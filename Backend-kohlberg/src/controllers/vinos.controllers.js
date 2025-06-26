import { connection } from "../db.js";
import fs from "fs";
import { fileURLToPath } from 'url';
import multer from "multer";
import path from "path";

// Obtener todos los vinos
export const getVinos = (req, res) => {
  try {
    connection.query("SELECT * FROM vinos", (error, results) => {
      res.json(results);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los vinos" });
  }
};

// Obtener vinos por categoria
export const getVinosPorCategoria = (req, res) => {
  try {
    const { categoria_id } = req.params;
    connection.query(
      "SELECT * FROM vinos WHERE categoria_id = ?",
      [categoria_id],
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: "Error al obtener los vinos por categoría" });
        }
        res.json(results);
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

// Obtener un vino por ID
export const getVino = (req, res) => {

  try {
    const { id } = req.params;
    connection.query("SELECT * FROM vinos WHERE vino_id = ?", [id], (error, results) => {
      if (results.length === 0) {
        return res.status(404).json({ message: "Vino no encontrado" });
      }
      res.json(results[0]);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el vino" });
  }

  
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/assets/vinos"));
    },
    filename: function (req, file, cb) {
        // Usa el nombre original o genera uno único si prefieres
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
        cb(null, uniqueName);
    }
});

export const upload = multer({ storage });

// Crear un nuevo vino
export const createVino = (req, res) => {

  try {
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;
    const imagen_url = req.file ? req.file.filename : null;

    connection.query(
        "INSERT INTO vinos (nombre, descripcion, precio, stock, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?, ?)",
        [nombre, descripcion, precio, stock, categoria_id, imagen_url],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error al crear el vino" });
            }
            res.json({ message: "Vino creado correctamente" });
        }
    );
  } catch (error) {
    return res.status(500).json({ message: "Error al insertar el vino" });
  }
};

// Eliminar un vino por ID
export const deleteVino = (req, res) => {
  try {
    const { id } = req.params;
    // Primero obtenemos el nombre del archivo de imagen
    connection.query("SELECT imagen_url FROM vinos WHERE vino_id = ?", [id], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al buscar el vino" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Vino no encontrado" });
      }
      const imagen_url = results[0].imagen_url;

      // Eliminamos el registro de la base de datos
      connection.query("DELETE FROM vinos WHERE vino_id = ?", [id], (delError, delResults) => {
        if (delError) {
          return res.status(500).json({ message: "Error al eliminar el vino" });
        }
        if (delResults.affectedRows === 0) {
          return res.status(404).json({ message: "Vino no encontrado" });
        }

        // Eliminamos la imagen del sistema de archivos si existe
        if (imagen_url) {
          const imagePath = path.join(__dirname, "../../public/assets/vinos", imagen_url);
          fs.unlink(imagePath, (fsErr) => {
            // No es necesario manejar el error si el archivo no existe
            res.json({ message: "Vino eliminado correctamente" });
          });
        } else {
          res.json({ message: "Vino eliminado correctamente" });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el vino" });
  }
};

// Actualizar un vino por ID
export const updateVino = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;
    let imagen_url = req.body.imagen_url; // nombre anterior

    // Si hay nueva imagen, elimina la anterior
    if (req.file) {
        // Elimina la imagen anterior si existe
        if (imagen_url) {
            const oldPath = path.join(__dirname, "../../public/assets/vinos", imagen_url);
            fs.unlink(oldPath, (err) => {
                // No es necesario manejar el error si el archivo no existe
            });
        }
        imagen_url = req.file.filename;
    }

    // Actualiza en la base de datos
    connection.query(
        "UPDATE vinos SET nombre=?, descripcion=?, precio=?, stock=?, categoria_id=?, imagen_url=? WHERE vino_id=?",
        [nombre, descripcion, precio, stock, categoria_id, imagen_url, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error al actualizar el vino" });
            }
            res.json({ message: "Vino actualizado correctamente" });
        }
    );
};


export const reducirStockVino = (req, res) => {
  const vino_id = req.params.id; // <-- aquí tomas el id de la URL
  const { cantidad } = req.body;

  if (!vino_id || !cantidad) {
    return res.status(400).json({ message: "Faltan datos necesarios para reducir el stock" });
  }

  connection.query(
    "UPDATE vinos SET stock = stock - ? WHERE vino_id = ?",
    [cantidad, vino_id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al reducir el stock del vino" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Vino no encontrado" });
      }
      res.json({ message: "Stock reducido correctamente" });
    }
  );
};