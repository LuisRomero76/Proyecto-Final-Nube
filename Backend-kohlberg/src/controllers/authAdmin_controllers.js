import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { connection } from "../db.js";
import { eliminarTokenActivoAdmin, guardarTokenActivoAdmin } from "../models/tokensAdmins.models.js";

const SECRET_KEY = process.env.JWT_SECRET;

// Login de administrador
export const loginAdmin = (req, res) => {
  const { email, passwordAdmin } = req.body;

  connection.query(
    "SELECT * FROM administrador WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Error en la base de datos" });
      if (results.length === 0) return res.status(401).json({ message: "Direccion Email incorrecto" });

      const admin = results[0];

      // Verificar si el admin está activo
      if (admin.estado !== 1 && admin.estado !== "1") {
        return res.status(403).json({ message: "Acceso denegado. El administrador no está activo." });
      }

      const match = await bcrypt.compare(passwordAdmin, admin.passwordAdmin);
      if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });
      
      // Generar token con expiración de 10 minutos
      const token = jwt.sign(
        {
          id: admin.admin_id,
          nombre: admin.nombre,
          email: admin.email
        },
        SECRET_KEY,
        { expiresIn: "3h" }
      );

      guardarTokenActivoAdmin(admin.admin_id, token, (err2) => {
        if (err2) return res.status(500).json({ message: "Error al guardar el token" });

        res.json({
          message: "Inicio de sesión exitoso",
          token,
          admin: {
            admin_id: admin.admin_id,
            nombre: admin.nombre,
            email: admin.email
          }
        });
      });

    }
  );
};

export const logoutAdmin = (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(400).json({ message: "Token no proporcionado" });

  eliminarTokenActivoAdmin(token, (err) => {
    if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
    res.json({ message: "Sesión cerrada correctamente" });
  });
};

