import { connection } from "../../db.js";
import bcrypt from "bcrypt";

// Validación de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAdminAWS = async (req, res) => {
    const {
        nombre,
        apellido,
        edad,
        direccion,
        sexo,
        cargo,
        email,
        passwordAdmin,
        telefono,
        nombre_usuario
    } = req.body;

    // Validación básica
    if (
        !nombre || !apellido || !edad || !direccion || !sexo ||
        !cargo || !email || !passwordAdmin || !telefono || !nombre_usuario
    ) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Validar edad
    if (isNaN(edad) || Number(edad) < 18) {
        return res.status(400).json({ message: "La edad debe ser un número y mayor o igual a 18 años" });
    }

    // Validar teléfono
    if (!/^[67]\d{7}$/.test(telefono)) {
        return res.status(400).json({ message: "El teléfono debe tener 8 dígitos y empezar por 6 o 7" });
    }

    // Validar email
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El email no es válido" });
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (passwordAdmin.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar duplicados de usuario, email o teléfono
    connection.query(
        "SELECT * FROM administrador WHERE nombre_usuario = ? OR email = ? OR telefono = ?",
        [nombre_usuario, email, telefono],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error al verificar duplicados." });
            }
            if (results.length > 0) {
                if (results.some(u => u.nombre_usuario === nombre_usuario)) {
                    return res.status(400).json({ message: "El nombre de usuario ya existe" });
                }
                if (results.some(u => u.email === email)) {
                    return res.status(400).json({ message: "El email ya se encuentra registrado" });
                }
                if (results.some(u => u.telefono === telefono)) {
                    return res.status(400).json({ message: "El número de teléfono ya está registrado" });
                }
            }

            // Hashear la contraseña antes de guardar
            const hashedPassword = await bcrypt.hash(passwordAdmin, 10);

            const query = `
                INSERT INTO administrador 
                (nombre, apellido, edad, direccion, sexo, cargo, email, passwordAdmin, telefono, nombre_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                query,
                [nombre, apellido, edad, direccion, sexo, cargo, email, hashedPassword, telefono, nombre_usuario],
                (error, results) => {
                    if (error) {
                        return res.status(500).json({ message: "Error al crear el administrador.", error });
                    }
                    res.status(201).json({ message: "Administrador creado exitosamente." });
                }
            );
        }
    );
};
