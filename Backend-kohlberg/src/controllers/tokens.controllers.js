// controllers/tokens.controller.js
import { connection } from "../db.js";

export const getActiveTokens = (req, res) => {
  try {
    connection.query("SELECT * FROM tokens_activos", (err, results) => {  
      res.json({ sesiones_activas: results });
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener sesiones activas" });
  }
};

export const getUserTokens = (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    connection.query(
      "SELECT * FROM tokens_activos WHERE persona_id = ?",
      [usuarioId],
      (err, results) => {
        res.json({ sesiones_usuario: results });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};
