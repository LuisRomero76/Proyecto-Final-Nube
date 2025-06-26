import axios from "axios";

// Hook para editar y eliminar un detalle de pedido
const useDetallePedido = (API_URL, token) => {
  // Editar detalle de pedido
  const editarDetallePedido = async (detalle_pedido_id, data) => {
    try {
      // data: { vino_id, cantidad, precio_unitario }
      const res = await axios.put(
        `${API_URL}/detallePedidosAdmin/${detalle_pedido_id}`,
        data,
        {
          headers: { Authorization: token }
        }
      );
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Eliminar detalle de pedido
  const eliminarDetallePedido = async (detalle_pedido_id) => {
    try {
      const res = await axios.delete(
        `${API_URL}/detallePedidosAdmin/${detalle_pedido_id}`,
        {
          headers: { Authorization: token }
        }
      );
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const agregarDetallePedido = async (pedido_id, vino_id, cantidad) => {
    try {
      const res = await axios.post(
        `${API_URL}/detallePedidosAdmin`,
        { pedido_id, vino_id, cantidad },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  return {
    editarDetallePedido,
    eliminarDetallePedido,
    agregarDetallePedido
  };
};

export default useDetallePedido;