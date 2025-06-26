import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import usePedidos from "../../hooks/usePedidos";
import useUsuarios from "../../hooks/useUsuarios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ESTADOS = ["todos", "pendiente", "enviado", "entregado", "cancelado"];

const Pedidos = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);

    const { pedidos, loading, error } = usePedidos(API_URL, token);
    const { usuarios } = useUsuarios(API_URL, token);
    
    const [estadoFiltro, setEstadoFiltro] = useState("todos");

    const navigate = useNavigate();

    // Relacionar pedido con nombre de usuario
    const pedidosConUsuario = pedidos.map(pedido => {
        const usuario = usuarios.find(u => u.persona_id === pedido.persona_id);
        return {
            ...pedido,
            usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : `ID ${pedido.persona_id}`
        };
    });

    // Filtrar por estado
    const pedidosFiltrados = estadoFiltro === "todos"
        ? pedidosConUsuario
        : pedidosConUsuario.filter(p => p.estado === estadoFiltro);

    return (
        <div className="flex">
            <MenuLateral />
            <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">Administracion de Pedidos</h1>
                    <div>
                        <label className="font-semibold mr-2 text-gray-700">Filtrar por estado:</label>
                        <select
                            className="border rounded px-3 py-2"
                            value={estadoFiltro}
                            onChange={e => setEstadoFiltro(e.target.value)}
                        >
                            {ESTADOS.map(e => (
                                <option key={e} value={e}>
                                    {e.charAt(0).toUpperCase() + e.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-50"></div>
                        <p className="ml-6 text-xl text-indigo-700 font-semibold">Cargando pedidos...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-lg font-semibold">Error: {error.message || error.toString()}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">N° Pedido</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Cliente</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Fecha</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Total</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Productos</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosFiltrados.map(pedido => (
                                    <tr key={pedido.pedido_id} className="hover:bg-gray-100 transition">
                                        <td className="px-6 py-4 font-semibold text-xl text-indigo-700">#{pedido.pedido_id}</td>
                                        <td className="px-6 py-4">{pedido.usuario}</td>
                                        <td className="px-6 py-4">{pedido.fecha_pedido}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow
                                                ${pedido.estado === "pendiente"
                                                    ? "bg-yellow-200 text-yellow-800"
                                                    : pedido.estado === "enviado"
                                                        ? "bg-blue-200 text-blue-800"
                                                        : pedido.estado === "entregado"
                                                            ? "bg-green-200 text-green-800"
                                                            : pedido.estado === "cancelado"
                                                                ? "bg-red-200 text-red-800"
                                                                : "bg-gray-200 text-gray-800"
                                                }`}>
                                                {pedido.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-indigo-700 font-bold">Bs. {pedido.total}</td>
                                        <td className="px-6 py-4">
                                            <ul className="space-y-1">
                                                {pedido.productos.map(prod => (
                                                    <li key={prod.vino_id} className="flex items-center gap-2">
                                                        <span className="font-semibold">{prod.vino_nombre}</span>
                                                        <span className="text-xs text-gray-500">x{prod.cantidad}</span>
                                                        <span className="text-xs text-gray-500">(Bs. {prod.precio_unitario} c/u)</span>
                                                        <span className="text-xs text-indigo-700 font-bold">= Bs. {prod.total_producto}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded font-semibold text-xs"
                                                onClick={() => navigate(`/pedidos/view/${pedido.pedido_id}`)}
                                            >
                                                Ver detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pedidosFiltrados.length === 0 && (
                            <div className="text-center py-10 text-gray-500 font-semibold">
                                No hay pedidos registrados para este estado.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Pedidos;