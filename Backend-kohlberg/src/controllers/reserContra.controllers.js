import { connection } from "../db.js";

export const verificarDatos = (req, res) => {
    const { nombre, apellido, nombre_usuario, telefono, edad } = req.body;

    if (!nombre || !apellido || !nombre_usuario || !telefono || !edad) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const query = `
        SELECT admin_id FROM administrador
        WHERE nombre = ? AND apellido = ? AND nombre_usuario = ? AND telefono = ? AND edad = ?
        LIMIT 1
    `;
    connection.query(query, [nombre, apellido, nombre_usuario, telefono, edad], (err, results) => {
        if (err) return res.status(500).json({ message: "Error en la consulta" });
        if (results.length === 0) return res.status(404).json({ message: "Datos incorrectos" });
        res.json({ admin_id: results[0].admin_id });
    });
};

export const resetContra = (req, res) => {
    const { id } = req.params;
    const { passwordAdmin } = req.body;

    if (!passwordAdmin || passwordAdmin.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const hashed = bcrypt.hashSync(passwordAdmin, 10);
    const query = `UPDATE administrador SET passwordAdmin = ? WHERE admin_id = ?`;
    connection.query(query, [hashed, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al actualizar contraseña" });
        res.json({ message: "Contraseña actualizada correctamente" });
    });
};