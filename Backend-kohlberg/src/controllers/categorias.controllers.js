import { connection } from "../db.js";

// Obtener todas las categorías
export const getCategorias = (req, res) => {
  connection.query("SELECT * FROM categorias", (error, results) => {
    if (error) {
      console.error("Error al obtener categorías:", error);
      return res.status(500).json({ message: "Error al obtener categorías" });
    }
    res.json(results);
  });
};

// Obtener una categoría por ID
export const getCategoria = (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM categorias WHERE categoria_id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error("Error al obtener categoría:", error);
        return res.status(500).json({ message: "Error al obtener categoría" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.json(results[0]);
    }
  );
};
