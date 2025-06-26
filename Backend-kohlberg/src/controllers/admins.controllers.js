import { connection } from "../db.js";
import bcrypt from "bcrypt";
import { validateAdminData } from "../models/admins.models.js";

export const getAdmins = (req, res) => {
  try {
    connection.query("SELECT *, DATE_FORMAT(fecha_registro, '%Y-%m-%d %H:%i') as fecha_registro FROM administrador", (error, results) => {
      if (error) return res.status(500).json({ message: "Error al obtener los usuarios" });
      res.json(results);
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los usuarios" });
  }
}

export const getAdmin = (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      "SELECT *, DATE_FORMAT(fecha_registro, '%Y-%m-%d %H:%i') as fecha_registro FROM administrador WHERE admin_id = ?",
      [id],
      (error, results) => {
        if (error) return res.status(500).json({ message: "Error en la consulta" });

        if (results.length === 0) {
          return res.status(404).json({ message: "Administrador no encontrado" });
        }

        res.json(results[0]);
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el administrador" });
  }
}


export const getAdminPerfil = (req, res) => {
    try {
        // Supón que el middleware de autenticación agrega admin_id a req.admin_id
        const admin_id = req.admin_id;
        if (!admin_id) return res.status(401).json({ message: "No autorizado" });

        const query = `
            SELECT admin_id, nombre, apellido, cargo, email, telefono, nombre_usuario
            FROM administrador
            WHERE admin_id = ?
            LIMIT 1
        `;
        connection.query(query, [admin_id], (error, results) => {
            if (error) return res.status(500).json({ message: "Error en la consulta" });
            if (results.length === 0) return res.status(404).json({ message: "Administrador no encontrado" });
            res.json(results[0]);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener perfil" });
    }
};


export const changeAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { password_actual, password_nueva } = req.body;

  if (!password_actual || !password_nueva) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Obtener el admin
    connection.query(
      "SELECT * FROM administrador WHERE admin_id = ?",
      [id],
      async (error, results) => {
        if (error) return res.status(500).json({ message: "Error en la consulta" });
        if (results.length === 0) {
          return res.status(404).json({ message: "Administrador no encontrado" });
        }

        const admin = results[0];
        // Verificar contraseña actual
        const passwordMatch = await bcrypt.compare(password_actual, admin.passwordAdmin);
        if (!passwordMatch) {
          return res.status(400).json({ message: "La contraseña actual es incorrecta" });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password_nueva, 10);

        // Actualizar la contraseña
        connection.query(
          "UPDATE administrador SET passwordAdmin = ? WHERE admin_id = ?",
          [hashedPassword, id],
          (updateError) => {
            if (updateError) {
              return res.status(500).json({ message: "Error al actualizar la contraseña" });
            }
            res.json({ message: "Contraseña actualizada correctamente" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateStateAdmin = (req, res) => {
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
    "UPDATE administrador SET estado = ? WHERE admin_id = ?",
    [estado, id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al actualizar el estado del administrador" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }
      res.json({ message: `Estado del administrador actualizado a ${estado}` });
    }
  );
}


export const createAdmin = async (req, res) => {
  const userData = req.body;
  const validation = validateAdminData(userData);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  // Validar edad
  if (!userData.edad || isNaN(userData.edad) || Number(userData.edad) < 18) {
    return res.status(400).json({ message: "La edad debe ser un número y mayor o igual a 18 años" });
  }

  try {
    // Verificar si username o email ya existen
    connection.query(
      "SELECT * FROM administrador WHERE nombre_usuario = ? OR email = ? OR telefono = ?",
      [userData.nombre_usuario, userData.email, userData.telefono],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Error al verificar duplicados" });
        }
        if (results.length > 0) {
            if (results.some(u => u.nombre_usuario === userData.nombre_usuario)) {
              return res.status(400).json({ message: "El nombre de usuario ya existe" });
            }
            if (results.some(u => u.email === userData.email)) {
              return res.status(400).json({ message: "El email ya se encuentra registrado" });
            }
            if (results.some(u => u.telefono === userData.telefono)) {
                return res.status(400).json({ message: "El número de teléfono ya esta registrado" });
            }
        }

        // Si no hay duplicados, crear usuario
        try {
          const hashedPasswordAdmin = await bcrypt.hash(userData.passwordAdmin, 10);

          connection.query(
            "INSERT INTO administrador (nombre, apellido, edad, direccion, sexo, email, passwordAdmin, telefono, nombre_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              userData.nombre,
              userData.apellido,
              userData.edad,
              userData.direccion,
              userData.sexo,
              userData.email,
              hashedPasswordAdmin,
              userData.telefono,
              userData.nombre_usuario
            ],
            (error, results) => {
              if (error) {
                return res.status(500).json({ message: "Error al insertar el usuario" });
              }
              res.status(201).json({ message: "Usuario creado correctamente" });
            }
          );
        } catch (error) {
          res.status(500).json({ message: "Error interno del servidor" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteAdmin = (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM administrador WHERE admin_id = ?", [id], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Error al eliminar el administrador" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }
    res.json({ message: "Administrador eliminado correctamente" });
  });
}

export const updateAdminProfileImage = (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen." });
  }
  const filename = req.file.filename;

  connection.query(
    "UPDATE administrador SET perfil = ? WHERE admin_id = ?",
    [filename, id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al actualizar la imagen de perfil" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }
      res.json({ message: "Imagen de perfil actualizada correctamente", perfil: filename });
    }
  );
};

export const updateAdmin = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    nombre_usuario,
    email,
    telefono,
    direccion,
    sexo,
    edad // <-- Añadido aquí
  } = req.body;

  // Validación básica
  if (!nombre || !apellido || !nombre_usuario || !email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // Validar teléfono si se envía
  if (telefono) {
    if (!/^[67]\d{7}$/.test(telefono)) {
      return res.status(400).json({ message: "El teléfono debe tener 8 dígitos y empezar por 6 o 7" });
    }
  }

  // Validar edad si se envía
  if (edad !== undefined) {
    if (isNaN(edad) || Number(edad) < 18) {
      return res.status(400).json({ message: "La edad debe ser un número y mayor o igual a 18 años" });
    }
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "El email no es válido" });
  }

  // Verificar duplicados de usuario, email o teléfono (excepto el propio admin)
  connection.query(
    "SELECT * FROM administrador WHERE (nombre_usuario = ? OR email = ? OR telefono = ?) AND admin_id != ?",
    [nombre_usuario, email, telefono, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error al verificar duplicados" });
      }
      if (results.length > 0) {
        if (results.some(u => u.nombre_usuario === nombre_usuario)) {
          return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }
        if (results.some(u => u.email === email)) {
          return res.status(400).json({ message: "El email ya se encuentra registrado" });
        }
        if (telefono && results.some(u => u.telefono === telefono)) {
          return res.status(400).json({ message: "El número de teléfono ya está registrado" });
        }
      }

      // Actualizar datos (incluyendo edad)
      connection.query(
        `UPDATE administrador SET nombre = ?, apellido = ?, nombre_usuario = ?, email = ?, telefono = ?, direccion = ?, sexo = ?, edad = ? WHERE admin_id = ?`,
        [nombre, apellido, nombre_usuario, email, telefono, direccion, sexo, edad, id],
        (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Error al actualizar el administrador" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Administrador no encontrado" });
          }
          // Devuelve los datos actualizados
          res.json({
            nombre,
            apellido,
            nombre_usuario,
            email,
            telefono,
            direccion,
            sexo,
            edad
          });
        }
      );
    }
  );
};

export const patchAdmin = (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    "nombre",
    "apellido",
    "nombre_usuario",
    "email",
    "telefono",
    "direccion",
    "sexo",
    "edad",
    "cargo",
    "estado"
  ];
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Validación básica
  if (!updates.nombre || !updates.apellido || !updates.nombre_usuario || !updates.email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // Validar teléfono si se envía
  if (updates.telefono && !/^[67]\d{7}$/.test(updates.telefono)) {
    return res.status(400).json({ message: "El teléfono debe tener 8 dígitos y empezar por 6 o 7" });
  }

  // Validar edad si se envía
  if (updates.edad !== undefined && (isNaN(updates.edad) || Number(updates.edad) < 18)) {
    return res.status(400).json({ message: "La edad debe ser un número y mayor o igual a 18 años" });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(updates.email)) {
    return res.status(400).json({ message: "El email no es válido" });
  }

  // Validar estado si se envía
  if (updates.estado !== undefined) {
    if (
      !(
        updates.estado === 1 ||
        updates.estado === 0 ||
        updates.estado === "1" ||
        updates.estado === "0" ||
        updates.estado === "activo" ||
        updates.estado === "inactivo"
      )
    ) {
      return res.status(400).json({ message: "Estado inválido. Debe ser 'activo', 'inactivo', 1 o 0." });
    }
    // Normalizar estado
    if (updates.estado === "activo" || updates.estado === 1 || updates.estado === "1") {
      updates.estado = 1;
    } else if (updates.estado === "inactivo" || updates.estado === 0 || updates.estado === "0") {
      updates.estado = 0;
    }
  }

  // Verificar duplicados de usuario, email o teléfono (excepto el propio admin)
  connection.query(
    "SELECT * FROM administrador WHERE (nombre_usuario = ? OR email = ? OR telefono = ?) AND admin_id != ?",
    [updates.nombre_usuario, updates.email, updates.telefono, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error al verificar duplicados" });
      }
      if (results.length > 0) {
        if (results.some(u => u.nombre_usuario === updates.nombre_usuario)) {
          return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }
        if (results.some(u => u.email === updates.email)) {
          return res.status(400).json({ message: "El email ya se encuentra registrado" });
        }
        if (updates.telefono && results.some(u => u.telefono === updates.telefono)) {
          return res.status(400).json({ message: "El número de teléfono ya está registrado" });
        }
      }

      // Construir consulta dinámica
      const setClause = Object.keys(updates).map(field => `${field} = ?`).join(", ");
      const values = Object.values(updates);
      values.push(id);

      connection.query(
        `UPDATE administrador SET ${setClause} WHERE admin_id = ?`,
        values,
        (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Error al actualizar el administrador" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Administrador no encontrado" });
          }
          // Devuelve los datos actualizados
          res.json({
            admin_id: id,
            ...updates
          });
        }
      );
    }
  );
}