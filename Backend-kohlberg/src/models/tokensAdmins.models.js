import { connection } from "../db.js";

export const guardarTokenActivoAdmin = (admin_id, token, callback) => {
  connection.query(
    "INSERT INTO tokensAdmins_activos (admin_id, token) VALUES (?, ?)",
    [admin_id, token],
    callback
  );
};

export const verificarTokenActivoAdmin = (token, callback) => {
  connection.query(
    "SELECT * FROM tokensAdmins_activos WHERE token = ?",
    [token],
    (error, results) => {
      if (error) return callback(error, null);
      callback(null, results.length > 0);
    }
  );
};

export const eliminarTokenActivoAdmin = (token, callback) => {
  connection.query(
    "DELETE FROM tokensAdmins_activos WHERE token = ?",
    [token],
    callback
  );
};
