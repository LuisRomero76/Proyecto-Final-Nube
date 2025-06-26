import { useState, useEffect } from "react";
import axios from "axios";

export function useAdminPerfil(API_URL, token) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!API_URL || !token) return;
    setLoading(true);
    axios
      .get(`${API_URL}/admins/perfil`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setAdmin(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error al obtener perfil");
        setLoading(false);
      });
  }, [API_URL, token]);

  return { admin, loading, error };
}