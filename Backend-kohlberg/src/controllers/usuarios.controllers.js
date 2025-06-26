import { connection } from "../db.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { validateUserData } from "../models/usuarios.models.js";

export const getUsers = (req, res) => {
  try {
    const query = `
      SELECT persona_id, nombre, apellido, username, telefono, direccion, email, estado, compras,
      DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i') AS fecha_creacion FROM personas`;
    
    connection.query(query, (error, results) => {
      if (error) return res.status(500).json({ message: "Error en la consulta" });
      res.json(results);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

export const getUser = (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT persona_id, nombre, apellido, username, telefono, direccion, email, estado, compras, 
      DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i') AS fecha_creacion
      FROM personas
      WHERE persona_id = ?
    `;

    connection.query(query, [id], (error, results) => {
      if (error) return res.status(500).json({ message: "Error en la consulta" });

      if (results.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(results[0]);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

export const sumarCompras = (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      "UPDATE personas SET compras = compras + 1 WHERE persona_id = ?",
      [id],
      (error, results) => {
        if (error) {
          console.error("Error al actualizar las compras:", error);
          return res.status(500).json({ message: "Error al actualizar las compras" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Compras actualizadas correctamente" });
      }
    );
  } catch (error) {
    console.error("Error general:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

export const createUser = async (req, res) => {
  const userData = req.body;
  const validation = validateUserData(userData);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    // Verificar si username o email ya existen
    connection.query(
      "SELECT * FROM personas WHERE username = ? OR email = ?",
      [userData.username, userData.email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Error al verificar duplicados" });
        }
        if (results.length > 0) {
          if (results.some(u => u.username === userData.username)) {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
          }
          if (results.some(u => u.email === userData.email)) {
            return res.status(400).json({ message: "El email ya existe" });
          }
        }

        // Si no hay duplicados, crear usuario
        try {
          const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

          connection.query(
            "INSERT INTO personas (nombre, apellido, username, telefono, direccion, email, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              userData.nombre,
              userData.apellido,
              userData.username,
              userData.telefono,
              userData.direccion,
              userData.email,
              hashedPassword
            ],
            (error, results) => {
              if (error) {
                console.error("Error al insertar el usuario:", error);
                return res.status(500).json({ message: "Error al insertar el usuario" });
              }
              res.status(201).json({ message: "Usuario creado correctamente" });
            }
          );
        } catch (error) {
          console.error("Error al encriptar la contraseña:", error);
          res.status(500).json({ message: "Error interno del servidor" });
        }
      }
    );
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    connection.query("DELETE FROM personas WHERE persona_id = ?", [id], (error, results) => {
      if (results.affectedRows === 0) {
        return res.status(404).json({message: "Usuario no encontrado"});
      }
      res.json({message: "Usuario eliminado correctamente"});
    });
  } catch (error) {
    return res.status(500).json({message: "Error al eliminar el usuario"});
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  const validation = validateUserData(userData);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    // Encriptar solo si se envía una nueva contraseña
    let hashedPassword = userData.password_hash;
    if (userData.password_hash) {
      hashedPassword = await bcrypt.hash(userData.password_hash, 10);
    }

    connection.query(
      "UPDATE personas SET nombre = ?, apellido = ?, username = ?, telefono = ?, direccion = ?, email = ?, password_hash = ? WHERE persona_id = ?",
      [ userData.nombre, userData.apellido, userData.username, userData.telefono, userData.direccion, userData.email, hashedPassword, id ],
      (error, results) => {
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario actualizado correctamente" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const patchUser = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "No se enviaron campos para actualizar" });
  }

  // Validaciones directas...
  // ... (lo que ya tienes)

  // Si se va a cambiar la contraseña, verifica la actual
  if (fields.password_hash && fields.password_actual) {
    // Obtén el hash actual de la base de datos
    connection.query(
      "SELECT password_hash FROM personas WHERE persona_id = ?",
      [id],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Error al verificar la contraseña actual" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const hashActual = results[0].password_hash;
        const match = await bcrypt.compare(fields.password_actual, hashActual);
        if (!match) {
          return res.status(400).json({ message: "La contraseña actual es incorrecta" });
        }
        // Si la contraseña actual es correcta, sigue con el update
        delete fields.password_actual; // No guardar este campo
        updateUserPatch();
      }
    );
  } else if (fields.password_hash && !fields.password_actual) {
    return res.status(400).json({ message: "Debes ingresar la contraseña actual para cambiar la contraseña" });
  } else {
    updateUserPatch();
  }

  async function updateUserPatch() {
    try {
      // Si se va a actualizar la contraseña, encripta antes de guardar
      if (fields.password_hash) {
        fields.password_hash = await bcrypt.hash(fields.password_hash, 10);
      }

      const setClause = Object.keys(fields)
        .map(field => `${field} = ?`)
        .join(", ");
      const values = Object.values(fields);

      connection.query(
        `UPDATE personas SET ${setClause} WHERE persona_id = ?`,
        [...values, id],
        (error, results) => {
          if (error) {
            console.error("Error al actualizar el usuario:", error);
            return res.status(500).json({ message: "Error al actualizar el usuario" });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
          }
          res.json({ message: "Usuario actualizado correctamente" });
        }
      );
    } catch (error) {
      console.error("Error al encriptar la contraseña:", error);
      return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  }
}

export const updateStateUser = (req, res) => {
  const { id } = req.params;
  let { estado } = req.body;

  // Permitir tanto string como número
  if (estado === "activo" || estado === 1 || estado === "1") {
    estado = 1;
  } else if (estado === "inactivo" || estado === 0 || estado === "0") {
    estado = 0;
  } else {
    return res.status(400).json({ message: "Estado inválido. Debe ser 'activo', 'inactivo', 1 o 0." });
  }

  connection.query(
    "UPDATE personas SET estado = ? WHERE persona_id = ?",
    [estado, id],
    (error, results) => {
      if (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        return res.status(500).json({ message: "Error al actualizar el estado del usuario" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ message: `Estado del usuario actualizado correctamente` });
    }
  );
}