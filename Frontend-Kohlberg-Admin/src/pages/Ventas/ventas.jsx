import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/menu_lateral/menu";
import { useVentas } from "../../hooks/useVentas";
import useUsuarios from "../../hooks/useUsuarios";
import { useAdmins } from "../../hooks/useAdmins";
import usePedidos from "../../hooks/usePedidos";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";

const Ventas = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { collapsed } = useSidebarAndAuth(API_URL, token);
  const navigate = useNavigate();

  const {
    ventas,
    ventasLoading,
    ventasError,
    fetchVentas,
    searchVentasByCliente,
  } = useVentas(API_URL, token);

  const { usuarios } = useUsuarios(API_URL, token);
  const { admins } = useAdmins(API_URL, token);
  const { pedidos } = usePedidos(API_URL, token);

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
  if (!token) {
    // Redirige al login o muestra un mensaje
    // navigate("/login");
    return;
  }
  fetchVentas();
  // eslint-disable-next-line
}, []);

  // Nuevo: función para manejar la búsqueda
  const handleBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim() === "") {
      fetchVentas();
    } else {
      searchVentasByCliente(busqueda.trim());
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateral />
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Ventas realizadas
            </h2>
            <p className="text-gray-500 font-medium">
              Consulta el historial de ventas realizadas en la tienda
            </p>
          </div>
          {/* Buscador */}
          <form onSubmit={handleBuscar} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg shadow transition"
            >
              Buscar
            </button>
            {busqueda && (
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-red-600 font-bold"
                onClick={() => { setBusqueda(""); fetchVentas(); }}
                title="Limpiar búsqueda"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>
        {ventasLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-50"></div>
            <p className="ml-6 text-xl text-indigo-700 font-semibold">Cargando ventas...</p>
          </div>
        ) : ventasError ? (
          <p className="text-red-500 text-lg font-semibold">
            Error: {ventasError}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">ID Venta</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Administrador</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Cliente</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Fecha Venta</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Total Venta</th>
                  <th className="px-6 py-4 text-center text-gray-900 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 font-semibold">
                      No hay ventas registradas.
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta) => {
                    const pedido = pedidos.find(p => p.pedido_id === venta.pedido_id);
                    const usuario = usuarios.find(u => u.persona_id === pedido?.persona_id);
                    const admin = admins.find(a => a.admin_id === venta.admin_id);

                    return (
                      <tr key={venta.venta_id} className="hover:bg-gray-100 transition">
                        <td className="px-6 py-4 font-mono text-gray-800">{venta.venta_id}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {admin ? `${admin.nombre} ${admin.apellido}` : venta.admin_id}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {usuario ? `${usuario.nombre} ${usuario.apellido}` : venta.pedido_id}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{venta.fecha_venta}</td>
                        <td className="px-6 py-4 text-indigo-700 font-bold">
                          {pedido ? `Bs. ${pedido.total}` : "No disponible"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg transition"
                            onClick={() => navigate(`/pedidos/view/${venta.pedido_id}`)}
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Ventas;