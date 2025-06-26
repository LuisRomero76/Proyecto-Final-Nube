import { connection } from "../db.js";

export const guardarTokenActivo = (persona_id, token, callback) => {
  connection.query(
    "INSERT INTO tokens_activos (persona_id, token) VALUES (?, ?)",
    [persona_id, token],
    callback
  );
};

export const verificarTokenActivo = (token, callback) => {
  connection.query(
    "SELECT * FROM tokens_activos WHERE token = ?",
    [token],
    (error, results) => {
      if (error) return callback(error, null);
      callback(null, results.length > 0);
    }
  );
};

export const eliminarTokenActivo = (token, callback) => {
  connection.query(
    "DELETE FROM tokens_activos WHERE token = ?",
    [token],
    callback
  );
};
