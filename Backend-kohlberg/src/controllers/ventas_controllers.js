import { connection  } from "../db.js";

export const getVentas = (_req, res) => {
    try {
        const query = `
        SELECT 
            v.venta_id, 
            v.admin_id, 
            v.pedido_id, 
            DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha_venta
        FROM ventas v
        ORDER BY v.fecha_venta DESC
        `;
    
        connection.query(query, (error, results) => {
            if (error) return res.status(500).json({ message: "Error en la consulta" });
            res.json(results);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener las ventas" });
    }
}

export const getVenta = (req, res) => {
    try {
        const { id } = req.params;

        const query = `
        SELECT 
            v.venta_id, 
            v.admin_id, 
            v.pedido_id, 
            DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha_venta
        FROM ventas v
        WHERE v.venta_id = ?
        `;

        connection.query(query, [id], (error, results) => {
            if (error) return res.status(500).json({ message: "Error en la consulta" });

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }

            res.json(results[0]);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener la venta" });
    }
};

export const getVentasByAdmin = (req, res) => {
    try {
        const { adminId } = req.params;

        const query = `
        SELECT 
            v.venta_id, 
            v.admin_id, 
            v.pedido_id, 
            DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha_venta
        FROM ventas v
        WHERE v.admin_id = ?
        ORDER BY v.fecha_venta ASC
        `;

        connection.query(query, [adminId], (error, results) => {
            if (error) return res.status(500).json({ message: "Error en la consulta" });
            res.json(results);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener las ventas del administrador" });
    }
}

export const createVenta = (req, res) => {
    try {
        const { admin_id, pedido_id } = req.body;

        if (!admin_id || !pedido_id) {
            return res.status(400).json({ message: "Faltan datos requeridos" });
        }

        const query = `
        INSERT INTO ventas (admin_id, pedido_id)
        VALUES (?, ?)
        `;

        connection.query(query, [admin_id, pedido_id], (error, results) => {
            if (error) return res.status(500).json({ message: "Error al crear la venta" });
            res.status(201).json({ message: "Venta creada correctamente", ventaId: results.insertId });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al crear la venta" });
    }
};

export const deleteVenta = (req, res) => {
    try {
        const { id } = req.params;

        const query = `
        DELETE FROM ventas
        WHERE venta_id = ?
        `;

        connection.query(query, [id], (error, results) => {
            if (error) return res.status(500).json({ message: "Error al eliminar la venta" });

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }

            res.json({ message: "Venta eliminada correctamente" });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar la venta" });
    }
};

export const searchVentasByCliente = (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: "Falta el parámetro de búsqueda" });

        // Consulta: ventas -> pedidos -> personas
        const query = `
            SELECT 
                v.venta_id, 
                v.admin_id, 
                v.pedido_id, 
                DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i') AS fecha_venta,
                p.persona_id,
                per.nombre AS cliente_nombre,
                per.apellido AS cliente_apellido
            FROM ventas v
            INNER JOIN pedidos p ON v.pedido_id = p.pedido_id
            INNER JOIN personas per ON p.persona_id = per.persona_id
            WHERE per.nombre LIKE ? OR per.apellido LIKE ?
            ORDER BY v.fecha_venta DESC
        `;
        const search = `%${q}%`;
        connection.query(query, [search, search], (error, results) => {
            if (error) {
                console.log("Error en la consulta:", error);
                return res.status(500).json({ message: "Error en la consulta" });
            }
            // Devuelve siempre un array (vacío o con resultados)
            res.json(results);
        });
    } catch (error) {
        console.log("Error en el controlador:", error);
        return res.status(500).json({ message: "Error al buscar ventas por cliente" });
    }
};