import { connection } from "../db.js";

// Obtener todos los favoritos
export const getFavoritos = (req, res) => {
  connection.query(`
    SELECT f.favorito_id, f.persona_id, f.vino_id, v.nombre AS vino_nombre, f.fecha_agregado
    FROM favoritos f
    JOIN vinos v ON f.vino_id = v.vino_id
  `, (error, results) => {
    if (error) return res.status(500).json({ message: "Error al obtener los favoritos" });
    res.json(results);
  });
};

// Obtener favoritos de una persona específica
export const getFavorito = (req, res) => {
  const { persona_id } = req.params;
  connection.query(`
    SELECT f.favorito_id, f.vino_id, v.nombre AS vino_nombre, f.fecha_agregado
    FROM favoritos f
    JOIN vinos v ON f.vino_id = v.vino_id
    WHERE f.persona_id = ?
  `, [persona_id], (error, results) => {
    if (error) return res.status(500).json({ message: "Error al obtener favoritos del usuario" });
    res.json(results);
  });
};

// Agregar un favorito
export const createFavorito = (req, res) => {
  const { persona_id, vino_id } = req.body;

  if (!persona_id || !vino_id) {
    return res.status(400).json({ message: "persona_id y vino_id son requeridos" });
  }

  try {
    connection.query(
      "INSERT INTO favoritos (persona_id, vino_id) VALUES (?, ?)",
      [persona_id, vino_id],
      (error, results) => {
        
        const favorito_id = results.insertId;
  
        res.status(201).json({
          message: "Favorito agregado exitosamente",
          favorito_id: favorito_id
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Eliminar un favorito
export const deleteFavorito = (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM favoritos WHERE favorito_id = ?", [id], (error, results) => {
    if (error) return res.status(500).json({ message: "Error al eliminar el favorito" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Favorito no encontrado" });
    res.json({ message: "Favorito eliminado correctamente" });
  });
};


// Ver los favoritos de una persona en específico
export const getFavoritosPersona = (req, res) => {
  const { persona_id } = req.params;
  connection.query(`
    SELECT f.favorito_id, f.persona_id, f.vino_id, v.nombre AS vino_nombre, f.fecha_agregado
    FROM favoritos f
    JOIN vinos v ON f.vino_id = v.vino_id
    WHERE f.persona_id = ?
  `, [persona_id], (error, results) => {
    if (error) return res.status(500).json({ message: "Error al obtener los favoritos de la persona" });
    res.json(results);
  });
};
