import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import { usePedido } from "../../hooks/usePedidos";
import useUsuarios from "../../hooks/useUsuarios";
import useVinos from "../../hooks/useVinos";
import { useAdmins } from "../../hooks/useAdmins";
import { useVentas } from "../../hooks/useVentas";
import { getAdminIdFromToken } from "../../hooks/useAdmins";
import useDetallePedido from "../../hooks/useDetallePedido";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

const ESTADOS = ["pendiente", "enviado", "entregado", "cancelado"];

const PedidosView = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);
    const { id } = useParams();
    const { pedido, loading, error, refreshPedido } = usePedido(API_URL, token, id);

    // Traer todos los usuarios y vinos para mostrar info completa
    const { usuarios } = useUsuarios(API_URL, token);
    const { vinos } = useVinos(API_URL, token);

    // Traer todos los administradores para mostrar el nombre del encargado
    const { admins } = useAdmins(API_URL, token);

    // Hook de ventas para crear una venta al entregar el pedido y para obtener ventas
    const { ventas, fetchVentas } = useVentas(API_URL, token);

    // Hook para editar/eliminar detalle de pedido
    const { editarDetallePedido, eliminarDetallePedido, agregarDetallePedido } = useDetallePedido(API_URL, token);

    const [categorias, setCategorias] = useState([]);
    const [estado, setEstado] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [modalDelete, setModalDelete] = useState(null); // {detalle_pedido_id, nombre}
    const [modalEdit, setModalEdit] = useState(null); // {detalle_pedido_id, vino_id, cantidad, precio_unitario}
    const [modalAdd, setModalAdd] = useState(false); // Estado para el modal de agregar producto
    const [editForm, setEditForm] = useState({});
    const [addForm, setAddForm] = useState({ vino_id: "", cantidad: 1 }); // Estado para el formulario de agregar
    const [editando, setEditando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [agregando, setAgregando] = useState(false); // Estado para controlar la carga al agregar
    const [errorModal, setErrorModal] = useState(null);

    const navigate = useNavigate();

    // Obtener categorías al montar el componente
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await axios.get(`${API_URL}/categoriasAdmin`, {
                    headers: { Authorization: token }
                });
                setCategorias(res.data);
            } catch (err) {
                setCategorias([]);
            }
        };
        fetchCategorias();
    }, [API_URL, token]);

    // Refrescar ventas cuando cambia el pedido
    useEffect(() => {
        fetchVentas();
    }, []);

    // Buscar usuario del pedido
    const usuarioPedido = pedido && usuarios
        ? usuarios.find(u => u.persona_id === pedido.persona_id)
        : null;

    // Enriquecer productos con info de vinos y categoría
    const productosEnriquecidos = pedido && vinos
        ? pedido.productos.map(prod => {
            const vino = vinos.find(v => v.vino_id === prod.vino_id);
            const categoriaObj = categorias.find(c => c.categoria_id === (vino?.categoria_id || prod.categoria_id));
            return {
                ...prod,
                categoria: categoriaObj ? categoriaObj.nombre : "-",
                imagen: vino?.imagen_url
                    ? `${API_URL}/assets/vinos/${vino.imagen_url}`
                    : null,
                vino_nombre: vino?.nombre || prod.vino_nombre
            };
        })
        : [];

    useEffect(() => {
        if (pedido) setEstado(pedido.estado);
    }, [pedido]);

    // Buscar la venta asociada a este pedido
    let ventaPedido = null;
    let adminVenta = null;
    if (pedido && ventas && ventas.length > 0) {
        ventaPedido = ventas.find(v => v.pedido_id === pedido.pedido_id);
        if (ventaPedido && admins) {
            adminVenta = admins.find(a => a.admin_id === ventaPedido.admin_id);
        }
    }

    const { createVenta } = useVentas(API_URL, token);

    const handleEstadoChange = async (e) => {
        const nuevoEstado = e.target.value;
        setEstado(nuevoEstado);

        setGuardando(true);
        try {
            // Actualizar estado del pedido
            await axios.put(`${API_URL}/pedidosAdmin/${id}/estado`, { estado: nuevoEstado }, {
                headers: { Authorization: token }
            });

            // Si el estado es "entregado" y antes no lo era
            if (nuevoEstado === "entregado" && pedido.estado !== "entregado") {
                // Sumar 1 a compras del usuario
                await axios.put(`${API_URL}/usuariosAdmin/${pedido.persona_id}/sumarCompra`, {}, {
                    headers: { Authorization: token }
                });

                // Actualizar stock de cada vino
                for (const prod of pedido.productos) {
                    await axios.put(`${API_URL}/vinosAdmin/${prod.vino_id}/reducirStock`, {
                        cantidad: prod.cantidad
                    }, {
                        headers: { Authorization: token }
                    });
                }

                // Crear la venta y asociar el admin encargado
                const admin_id = getAdminIdFromToken(token);
                await createVenta(admin_id, pedido.pedido_id);
                await fetchVentas(); // Refresca ventas para mostrar el admin encargado
            }

            alert("Estado actualizado correctamente");
            navigate("/pedidos");
        } catch (err) {
            alert("Error al actualizar el estado");
        } finally {
            setGuardando(false);
        }
    };

    // Eliminar detalle de pedido
    const handleDeleteDetalle = async () => {
        if (!modalDelete) return;
        setEliminando(true);
        setErrorModal(null);
        try {
            await eliminarDetallePedido(modalDelete.detalle_pedido_id);
            setModalDelete(null);
            window.location.reload(); // Recarga la página para reflejar los cambios
        } catch (err) {
            setErrorModal(err.message || "Error al eliminar el producto.");
        } finally {
            setEliminando(false);
        }
    };

    // Editar detalle de pedido
    const handleEditDetalle = async (e) => {
        e.preventDefault();
        setEditando(true);
        setErrorModal(null);
        try {
            await editarDetallePedido(modalEdit.detalle_pedido_id, {
                vino_id: editForm.vino_id,
                cantidad: editForm.cantidad,
                precio_unitario: editForm.precio_unitario
            });
            setModalEdit(null);
            setEditForm({});
            window.location.reload(); // Recarga la página para reflejar los cambios
        } catch (err) {
            setErrorModal(err.message || "Error al editar el producto.");
        } finally {
            setEditando(false);
        }
    };

    // Agregar detalle de pedido
    const handleAddDetalle = async (e) => {
        e.preventDefault();
        setAgregando(true);
        setErrorModal(null);
        try {
            await agregarDetallePedido(pedido.pedido_id, addForm.vino_id, addForm.cantidad);
            setModalAdd(false);
            setAddForm({ vino_id: "", cantidad: 1 });
            window.location.reload(); // Recarga la página para reflejar los cambios
            await refreshPedido(); // Refresca la lista y el total
        } catch (err) {
            setErrorModal(err.message || "Error al agregar el producto.");
        } finally {
            setAgregando(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <MenuLateral />
            <main className={`transition-all duration-200 w-full ${collapsed ? 'md:ml-20' : 'md:ml-64'} p-8`}>
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-indigo-900 mb-8 tracking-tight border-b pb-4">
                        Detalle del Pedido
                    </h1>
                    {loading ? (
                        <div className="text-lg text-gray-500">Cargando...</div>
                    ) : error ? (
                        <div className="text-red-500">Error: {error.message || error.toString()}</div>
                    ) : pedido ? (
                        <>
                            {/* Información general del pedido en tabla */}
                            <table className="w-full mb-8 border-separate border-spacing-y-2">
                                <tbody>
                                    <tr>
                                        <td className="font-bold text-gray-700 w-48">Pedido N°:</td>
                                        <td className="font-extrabold text-indigo-700">#{pedido.pedido_id}</td>
                                        <td className="font-bold text-gray-700 w-48">Cliente:</td>
                                        <td>
                                            {usuarioPedido
                                                ? `${usuarioPedido.nombre} ${usuarioPedido.apellido}`
                                                : "No disponible"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-gray-700">Fecha:</td>
                                        <td>{pedido.fecha_pedido}</td>
                                        <td className="font-bold text-gray-700">Correo:</td>
                                        <td>{usuarioPedido?.email || "No disponible"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-gray-700">Total:</td>
                                        <td className="font-bold text-indigo-700">Bs. {pedido.total}</td>
                                        <td className="font-bold text-gray-700">Teléfono:</td>
                                        <td>{usuarioPedido?.telefono || "No disponible"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-gray-700">Estado actual:</td>
                                        <td>
                                            <span className={`font-semibold px-2 py-1 rounded-full text-xs
                                                ${pedido.estado === "pendiente" ? "bg-yellow-200 text-yellow-800"
                                                    : pedido.estado === "enviado" ? "bg-blue-200 text-blue-800"
                                                    : pedido.estado === "entregado" ? "bg-green-200 text-green-800"
                                                    : "bg-red-200 text-red-800"
                                                }`}>
                                                {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                                            </span>
                                        </td>
                                        <td className="font-bold text-gray-700">Dirección:</td>
                                        <td>{usuarioPedido?.direccion || "No disponible"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-gray-700">Cambiar estado:</td>
                                        <td>
                                            <select
                                                className="border rounded px-3 py-2"
                                                value={estado}
                                                onChange={handleEstadoChange}
                                                disabled={guardando}
                                            >
                                                {ESTADOS.map(e => (
                                                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="font-bold text-gray-700">Administrador encargado:</td>
                                        <td>
                                            {adminVenta
                                                ? `${adminVenta.nombre} ${adminVenta.apellido}`
                                                : ventaPedido
                                                    ? `ID: ${ventaPedido.admin_id}`
                                                    : "No asignado"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Productos del pedido */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-indigo-800">Productos del Pedido</h2>
                                <button
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow transition"
                                    onClick={() => { setModalAdd(true); setErrorModal(null); }}
                                >
                                    <FaPlus /> Agregar producto
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Imagen</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Cantidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Precio Unitario</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Subtotal</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Categoría</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosEnriquecidos.map((prod, idx) => (
                                            <tr key={prod.detalle_pedido_id || `detalle-${idx}`} className="border-t">
                                                <td className="px-4 py-2">
                                                    {prod.imagen
                                                        ? (
                                                            <img
                                                                src={prod.imagen}
                                                                alt={prod.vino_nombre}
                                                                className="h-24 w-24 object-contain rounded shadow border bg-white"
                                                                style={{ maxWidth: "120px", maxHeight: "120px" }}
                                                            />
                                                        )
                                                        : <span className="text-xs text-gray-400">Sin imagen</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-2 font-semibold text-indigo-700">{prod.vino_nombre}</td>
                                                <td className="px-4 py-2">{prod.cantidad}</td>
                                                <td className="px-4 py-2">Bs. {prod.precio_unitario}</td>
                                                <td className="px-4 py-2 font-bold">Bs. {prod.cantidad * prod.precio_unitario}</td>
                                                <td className="px-4 py-2 text-xs">{prod.categoria}</td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow transition mr-2"
                                                        onClick={() => {
                                                            setModalDelete({
                                                                detalle_pedido_id: prod.detalle_pedido_id,
                                                                nombre: prod.vino_nombre
                                                            });
                                                            setErrorModal(null);
                                                        }}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </button>
                                                    <button
                                                        className="bg-orange-400 hover:bg-orange-600 text-white px-4 py-1 rounded-lg shadow transition"
                                                        onClick={() => {
                                                            setModalEdit({
                                                                detalle_pedido_id: prod.detalle_pedido_id
                                                            });
                                                            setEditForm({
                                                                vino_id: prod.vino_id,
                                                                cantidad: prod.cantidad,
                                                                precio_unitario: prod.precio_unitario
                                                            });
                                                            setErrorModal(null);
                                                        }}
                                                    >
                                                        <FaEdit size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </>
                    ) : (
                        <div>No se encontró el pedido.</div>
                    )}

                    {/* Modal Eliminar */}
                    {modalDelete && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-2 border-red-200">
                                <h3 className="text-xl font-bold text-red-700 mb-4 text-center">
                                    ¿Eliminar producto del pedido?
                                </h3>
                                <p className="mb-6 text-center">
                                    ¿Estás seguro de eliminar <span className="font-bold">{modalDelete.nombre}</span> de este pedido?
                                </p>
                                {errorModal && (
                                    <div className="text-red-500 text-center mb-2">{errorModal}</div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <button
                                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                                        onClick={() => setModalDelete(null)}
                                        disabled={eliminando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                                        onClick={handleDeleteDetalle}
                                        disabled={eliminando}
                                    >
                                        {eliminando ? "Eliminando..." : "Eliminar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Editar */}
                    {modalEdit && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                            <form
                                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border-2 border-orange-200"
                                onSubmit={handleEditDetalle}
                            >
                                <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                                    Editar producto del pedido
                                </h3>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Producto</label>
                                    <select
                                        className="w-full border border-indigo-300 rounded-lg p-3"
                                        value={editForm.vino_id}
                                        onChange={e => setEditForm(f => ({ ...f, vino_id: Number(e.target.value) }))}
                                        required
                                    >
                                        <option value="">Selecciona un producto</option>
                                        {vinos.map(v => (
                                            <option key={v.vino_id} value={v.vino_id}>
                                                {v.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full border border-indigo-300 rounded-lg p-3"
                                        value={editForm.cantidad}
                                        onChange={e => setEditForm(f => ({ ...f, cantidad: Number(e.target.value) }))}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Precio unitario</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="w-full border border-indigo-300 rounded-lg p-3"
                                        value={editForm.precio_unitario}
                                        onChange={e => setEditForm(f => ({ ...f, precio_unitario: Number(e.target.value) }))}
                                        required
                                    />
                                </div>
                                {errorModal && (
                                    <div className="text-red-500 text-center mb-2">{errorModal}</div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                                        onClick={() => setModalEdit(null)}
                                        disabled={editando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition"
                                        disabled={editando}
                                    >
                                        {editando ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Modal Agregar */}
                    {modalAdd && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                            <form
                                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border-2 border-green-200"
                                onSubmit={handleAddDetalle}
                            >
                                <h3 className="text-xl font-bold text-green-700 mb-4 text-center">
                                    Agregar producto al pedido
                                </h3>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Producto</label>
                                    <select
                                        className="w-full border border-indigo-300 rounded-lg p-3"
                                        value={addForm.vino_id}
                                        onChange={e => setAddForm(f => ({ ...f, vino_id: Number(e.target.value) }))}
                                        required
                                    >
                                        <option value="">Selecciona un producto</option>
                                        {vinos.map(v => (
                                            <option key={v.vino_id} value={v.vino_id}>
                                                {v.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full border border-indigo-300 rounded-lg p-3"
                                        value={addForm.cantidad}
                                        onChange={e => setAddForm(f => ({ ...f, cantidad: Number(e.target.value) }))}
                                        required
                                    />
                                </div>
                                {errorModal && (
                                    <div className="text-red-500 text-center mb-2">{errorModal}</div>
                                )}
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                                        onClick={() => setModalAdd(false)}
                                        disabled={agregando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                                        disabled={agregando}
                                    >
                                        {agregando ? "Agregando..." : "Agregar producto"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PedidosView;