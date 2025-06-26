import axios from 'axios';
import { useEffect, useState } from 'react';

export function useVentas(API_URL, token) {
  const [ventas, setVentas] = useState([]);
  const [ventasLoading, setVentasLoading] = useState(false);
  const [ventasError, setVentasError] = useState(null);

  // Obtener todas las ventas
  const fetchVentas = async () => {
    setVentasLoading(true);
    setVentasError(null);
    try {
      const res = await axios.get(`${API_URL}/ventasAdmin`, {
        headers: { Authorization: token }
      });
      setVentas(res.data);
    } catch (err) {
      setVentasError(
        err.response?.data?.message || "No se pudieron obtener las ventas."
      );
    } finally {
      setVentasLoading(false);
    }
  };

  // Obtener una venta por ID
  const fetchVentaById = async (id) => {
    setVentasLoading(true);
    setVentasError(null);
    try {
      const res = await axios.get(`${API_URL}/ventasAdmin/${id}`, {
        headers: { Authorization: token }
      });
      return res.data;
    } catch (err) {
      setVentasError(
        err.response?.data?.message || "No se pudo obtener la venta."
      );
      return null;
    } finally {
      setVentasLoading(false);
    }
  };

  // Obtener ventas por admin
  const fetchVentasByAdmin = async (adminId) => {
    setVentasLoading(true);
    setVentasError(null);
    try {
      const res = await axios.get(`${API_URL}/ventasAdmin/admin/${adminId}`, {
        headers: { Authorization: token }
      });
      setVentas(res.data);
    } catch (err) {
      setVentasError(
        err.response?.data?.message || "No se pudieron obtener las ventas del administrador."
      );
    } finally {
      setVentasLoading(false);
    }
  };

  // Crear una venta
  const createVenta = async (admin_id, pedido_id) => {
    setVentasError(null);
    try {
      const res = await axios.post(
        `${API_URL}/ventasAdmin`,
        { admin_id, pedido_id },
        { headers: { Authorization: token } }
      );
      await fetchVentas();
      return res.data;
    } catch (err) {
      setVentasError(
        err.response?.data?.message || "No se pudo crear la venta."
      );
      return null;
    }
  };

  // Eliminar una venta
  const deleteVenta = async (venta_id) => {
    setVentasError(null);
    try {
      await axios.delete(`${API_URL}/ventasAdmin/${venta_id}`, {
        headers: { Authorization: token }
      });
      await fetchVentas();
      return true;
    } catch (err) {
      setVentasError(
        err.response?.data?.message || "No se pudo eliminar la venta."
      );
      return false;
    }
  };

  const searchVentasByCliente = async (query) => {
    setVentasLoading(true);
    setVentasError(null);
    try {
      const res = await axios.get(`${API_URL}/ventasAdmin/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: token }
      });
      setVentas(res.data);
    } catch (err) {
      console.log("Error en searchVentasByCliente:", err.response?.data); // <-- Agrega esto
      setVentasError(
        err.response?.data?.message || "No se pudieron buscar las ventas."
      );
    } finally {
      setVentasLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
    // eslint-disable-next-line
  }, [API_URL, token]);

  return {
    ventas,
    ventasLoading,
    ventasError,
    fetchVentas,
    fetchVentaById,
    fetchVentasByAdmin,
    createVenta,
    deleteVenta,
    setVentas,
    searchVentasByCliente
  };
}
