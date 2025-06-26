import { connection } from "../db.js";

// Obtener todos los pedidos
export const getPedidos = (req, res) => {
  const query = `
    SELECT pedido_id, persona_id, estado, total,
    DATE_FORMAT(fecha_pedido, '%Y-%m-%d %H:%i') AS fecha_pedido
    FROM pedidos
  `;
  connection.query(query, (err, pedidos) => {
    if (err) {
      console.error("Error al obtener los pedidos:", err);
      return res.status(500).json({ message: "Error al obtener los pedidos" });
    }

    if (pedidos.length === 0) return res.json([]);

    connection.query(`
      SELECT dp.pedido_id, dp.vino_id, v.nombre AS vino_nombre, dp.cantidad, dp.precio_unitario
      FROM detalle_pedido dp
      JOIN vinos v ON dp.vino_id = v.vino_id
    `, (errDetalles, detalles) => {
      if (errDetalles) {
        console.error("Error al obtener detalles de pedidos:", errDetalles);
        return res.status(500).json({ message: "Error al obtener los productos de los pedidos" });
      }

      const pedidosConProductos = pedidos.map(pedido => {
        const productos = detalles
          .filter(d => d.pedido_id === pedido.pedido_id)
          .map(d => ({
            ...d,
            total_producto: d.cantidad * d.precio_unitario
          }));
        return {
          ...pedido,
          productos
        };
      });

      res.json(pedidosConProductos);
    });
  });
};

// Obtener un pedido por ID
export const getPedido = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT pedido_id, persona_id, estado, total,
    DATE_FORMAT(fecha_pedido, '%Y-%m-%d %H:%i') AS fecha_pedido
    FROM pedidos
    WHERE pedido_id = ?
  `;
  connection.query(query, [id], (err, pedidoRows) => {
    if (err) {
      console.error("Error al obtener el pedido:", err);
      return res.status(500).json({ message: "Error al obtener el pedido" });
    }

    if (pedidoRows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const pedido = pedidoRows[0];

    connection.query(
  `SELECT dp.detalle_id, dp.vino_id, v.nombre AS vino_nombre, dp.cantidad, dp.precio_unitario
   FROM detalle_pedido dp
   JOIN vinos v ON dp.vino_id = v.vino_id
   WHERE dp.pedido_id = ?`,
  [id],
  (errProductos, productos) => {
    if (errProductos) {
      // ...
    }

    const productosConTotal = productos.map(p => ({
      ...p,
      detalle_pedido_id: p.detalle_id, // <-- Esto es lo importante
      total_producto: p.cantidad * p.precio_unitario
    }));

    res.json({
      ...pedido,
      productos: productosConTotal
    });
  }
);
  });
};

// Crear un nuevo pedido
export const createPedido = (req, res) => {
  const { persona_id, estado = "pendiente", productos } = req.body;

  if (!persona_id || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Faltan datos obligatorios (persona_id, productos)" });
  }

  // 1. Obtener precios reales desde la base de datos
  const vinoIds = productos.map(p => p.vino_id);
  const query = `SELECT vino_id, precio FROM vinos WHERE vino_id IN (${vinoIds.map(() => '?').join(',')})`;

  connection.query(query, vinoIds, (err, vinoRows) => {
    if (err) {
      console.error("Error al consultar precios de vinos:", err);
      return res.status(500).json({ message: "Error al consultar precios de vinos" });
    }

    // Mapear precios a los productos
    const preciosMap = {};
    vinoRows.forEach(v => preciosMap[v.vino_id] = v.precio);

    // Calcular total del pedido
    const detalles = productos.map(p => {
      const precio_unitario = preciosMap[p.vino_id] || 0;
      const total_producto = precio_unitario * p.cantidad;
      return { ...p, precio_unitario, total_producto };
    });

    const total = detalles.reduce((acc, d) => acc + d.total_producto, 0);

    // 2. Insertar el pedido
    connection.query(
      "INSERT INTO pedidos (persona_id, estado, total) VALUES (?, ?, ?)",
      [persona_id, estado, total],
      (errInsertPedido, resultPedido) => {
        if (errInsertPedido) {
          console.error("Error al insertar pedido:", errInsertPedido);
          return res.status(500).json({ message: "Error al crear el pedido" });
        }

        const pedidoId = resultPedido.insertId;

        // 3. Insertar detalles del pedido
        const valores = detalles.map(d => [pedidoId, d.vino_id, d.cantidad, d.precio_unitario]);
        connection.query(
          "INSERT INTO detalle_pedido (pedido_id, vino_id, cantidad, precio_unitario) VALUES ?",
          [valores],
          (errDetalles) => {
            if (errDetalles) {
              console.error("Error al insertar detalles:", errDetalles);
              return res.status(500).json({ message: "Error al insertar productos del pedido" });
            }

            res.status(201).json({ message: "Pedido creado exitosamente", pedido_id: pedidoId });
          }
        );
      }
    );
  });
};

export const updateStatePedido = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "Falta el estado del pedido" });
  }

  connection.query(
    "UPDATE pedidos SET estado = ? WHERE pedido_id = ?",
    [estado, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar el estado del pedido:", err);
        return res.status(500).json({ message: "Error al actualizar el estado del pedido" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      res.json({ message: "Estado del pedido actualizado correctamente" });
    }
  );
}

// Actualizar un pedido
export const updatePedido = (req, res) => {
  const { id } = req.params;
  const { estado, total, productos } = req.body;

  if (!estado || !total || !productos || productos.length === 0) {
    return res.status(400).json({ message: "Faltan datos necesarios para actualizar el pedido" });
  }

  // Actualizar estado y total
  connection.query(
    "UPDATE pedidos SET estado = ?, total = ? WHERE pedido_id = ?",
    [estado, total, id],
    (errUpdate, resultUpdate) => {
      if (errUpdate) {
        console.error("Error al actualizar el pedido:", errUpdate);
        return res.status(500).json({ message: "Error al actualizar el pedido" });
      }

      if (resultUpdate.affectedRows === 0) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      // Borrar productos existentes del pedido
      connection.query("DELETE FROM detalle_pedido WHERE pedido_id = ?", [id], (errDelete) => {
        if (errDelete) {
          console.error("Error al borrar detalles anteriores:", errDelete);
          return res.status(500).json({ message: "Error al limpiar productos anteriores" });
        }

        // Insertar nuevos productos
        const nuevosDetalles = productos.map(p => [id, p.vino_id, p.cantidad, p.precio_unitario]);
        connection.query(
          "INSERT INTO detalle_pedido (pedido_id, vino_id, cantidad, precio_unitario) VALUES ?",
          [nuevosDetalles],
          (errInsert) => {
            if (errInsert) {
              console.error("Error al insertar nuevos productos:", errInsert);
              return res.status(500).json({ message: "Error al actualizar productos del pedido" });
            }

            res.json({ message: "Pedido actualizado correctamente" });
          }
        );
      });
    }
  );
};

// Eliminar un pedido
export const deletePedido = (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM pedidos WHERE pedido_id = ?", [id], (error, results) => {
    if (error) {
      console.error("Error al eliminar el pedido:", error);
      return res.status(500).json({ message: "Error al eliminar el pedido" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    res.json({ message: "Pedido eliminado correctamente" });
  });
};
