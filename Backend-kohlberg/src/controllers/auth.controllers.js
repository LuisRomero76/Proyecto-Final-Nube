import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { connection } from "../db.js";
import { guardarTokenActivo, eliminarTokenActivo } from "../models/tokens.models.js";

const SECRET_KEY = process.env.JWT_SECRET;

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM personas WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Error en la base de datos" });
      if (results.length === 0) return res.status(401).json({ message: "Credenciales inválidas" });

      const usuario = results[0];
      const match = await bcrypt.compare(password, usuario.password_hash);
      if (!match) return res.status(401).json({ message: "Credenciales inválidas" });

      const token = jwt.sign({ id: usuario.persona_id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, estado: usuario.estado}, SECRET_KEY);

      guardarTokenActivo(usuario.persona_id, token, (err2) => {
        if (err2) return res.status(500).json({ message: "Error al guardar el token" });

        res.json({
          message: "Inicio de sesión exitoso",
          token,
          usuario: {
            persona_id: usuario.persona_id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            estado: usuario.estado
          }
        });
      });
    }
  );
};

export const logoutUser = (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(400).json({ message: "Token no proporcionado" });

  eliminarTokenActivo(token, (err) => {
    if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
    res.json({ message: "Sesión cerrada correctamente" });
  });
};
