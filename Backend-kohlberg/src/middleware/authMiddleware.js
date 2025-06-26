import jwt from "jsonwebtoken";
import { verificarTokenActivo } from "../models/tokens.models.js";
import { eliminarTokenActivoAdmin, verificarTokenActivoAdmin } from "../models/tokensAdmins.models.js";

const SECRET_KEY = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    verificarTokenActivo(token, (err2, esValido) => {
      if (err2 || !esValido)
        return res.status(401).json({ message: "Token no válido o expirado" });

      req.usuario = decoded;
      next();
    });
  });
};


export const authenticateTokenAdmin = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      // Si el error es por expiración, elimina el token de la base de datos
      if (err.name === "TokenExpiredError") {
        eliminarTokenActivoAdmin(token, () => {
          return res.status(401).json({ message: "Token expirado" });
        });
      } else {
        return res.status(401).json({ message: "Token inválido" });
      }
      return;
    }
    
    verificarTokenActivoAdmin(token, (err2, esValido) => {
      if (err2 || !esValido)
        return res.status(401).json({ message: "Token no válido o expirado" });

      req.usuario = decoded;
      next();
    });
  });
};