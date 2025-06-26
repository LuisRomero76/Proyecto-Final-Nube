import { connection } from "../db.js";

// Función para recalcular el total del pedido
function recalcularTotalPedido(pedido_id, callback) {
    connection.query(
        "SELECT SUM(cantidad * precio_unitario) AS total FROM detalle_pedido WHERE pedido_id = ?",
        [pedido_id],
        (error, results) => {
            if (error) return callback(error);
            const total = results[0].total || 0;
            connection.query(
                "UPDATE pedidos SET total = ? WHERE pedido_id = ?",
                [total, pedido_id],
                callback
            );
        }
    );
}

export const addDetallePedido = (req, res) => {
    const { pedido_id, vino_id, cantidad } = req.body;
    if (!pedido_id || !vino_id || !cantidad) {
        return res.status(400).json({ message: "pedido_id, vino_id y cantidad son requeridos" });
    }

    // Obtener el precio_unitario del vino
    connection.query(
        "SELECT precio, categoria_id FROM vinos WHERE vino_id = ?",
        [vino_id],
        (error, results) => {
            if (error || results.length === 0) {
                return res.status(404).json({ message: "Vino no encontrado" });
            }
            const precio_unitario = results[0].precio;

            // Insertar el detalle
            connection.query(
                "INSERT INTO detalle_pedido (pedido_id, vino_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                [pedido_id, vino_id, cantidad, precio_unitario],
                (error) => {
                    if (error) return res.status(500).json({ message: "Error al agregar producto al pedido" });

                    // Recalcular el total del pedido
                    recalcularTotalPedido(pedido_id, (error) => {
                        if (error) return res.status(500).json({ message: "Error al recalcular el total del pedido" });
                        res.json({ message: "Producto agregado al pedido correctamente" });
                    });
                }
            );
        }
    );
};

export const updateDetallePedido = (req, res) => {
    const { id } = req.params;
    const { vino_id, cantidad, precio_unitario } = req.body;

    if (!vino_id || !cantidad || !precio_unitario) {
        return res.status(400).json({ message: "Vino ID, cantidad y precio unitario son requeridos" });
    }

    // Obtener el pedido_id antes de actualizar
    connection.query(
        "SELECT pedido_id FROM detalle_pedido WHERE detalle_id = ?",
        [id],
        (error, results) => {
            if (error || results.length === 0) {
                return res.status(404).json({ message: "Detalle del pedido no encontrado" });
            }
            const pedido_id = results[0].pedido_id;

            connection.query(
                "UPDATE detalle_pedido SET vino_id = ?, cantidad = ?, precio_unitario = ? WHERE detalle_id = ?",
                [vino_id, cantidad, precio_unitario, id],
                (error) => {
                    if (error) return res.status(500).json({ message: "Error al actualizar el detalle del pedido" });
                    recalcularTotalPedido(pedido_id, (error) => {
                        if (error) return res.status(500).json({ message: "Error al recalcular el total del pedido" });
                        res.json({ message: "Detalle del pedido actualizado exitosamente" });
                    });
                }
            );
        }
    );
};

export const deleteDetallePedido = (req, res) => {
    const { id } = req.params;

    // Obtener el pedido_id antes de eliminar
    connection.query(
        "SELECT pedido_id FROM detalle_pedido WHERE detalle_id = ?",
        [id],
        (error, results) => {
            if (error || results.length === 0) {
                return res.status(404).json({ message: "Detalle del pedido no encontrado" });
            }
            const pedido_id = results[0].pedido_id;

            connection.query(
                "DELETE FROM detalle_pedido WHERE detalle_id = ?",
                [id],
                (error, results) => {
                    if (error) return res.status(500).json({ message: "Error al eliminar el detalle del pedido" });
                    recalcularTotalPedido(pedido_id, (error) => {
                        if (error) return res.status(500).json({ message: "Error al recalcular el total del pedido" });
                        res.json({ message: "Detalle del pedido eliminado exitosamente" });
                    });
                }
            );
        }
    );
};