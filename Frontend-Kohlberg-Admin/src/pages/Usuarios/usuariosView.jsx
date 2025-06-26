import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSidebarAndAuth from '../../hooks/useSidebarAndAuth';
import MenuLateral from '../../components/menu_lateral/menu';
import { useUsuario, patchUsuario } from '../../hooks/useUsuarios';
import ModalEditUser from '../../components/modals/ModalEditUser';
import useFavoritos from '../../hooks/useFavoritos';
import usePedidos from '../../hooks/usePedidos';
import useVinos from '../../hooks/useVinos';
import axios from "axios";

const UsuariosView = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);
    const { id } = useParams();
    const navigate = useNavigate();

    const { usuario, loading, error } = useUsuario(API_URL, token, id);
    const { vinos } = useVinos(API_URL, token);
    const { favoritos } = useFavoritos(API_URL, token);
    const { pedidos } = usePedidos(API_URL, token);

    // Modal de edición
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Categorías
    const [categorias, setCategorias] = useState([]);
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

    // Filtrar favoritos y pedidos del usuario actual
    const favoritosUsuario = favoritos
        ? favoritos.filter(fav => fav.persona_id === Number(id))
        : [];
    const pedidosUsuario = pedidos
        ? pedidos.filter(ped => ped.persona_id === Number(id))
        : [];

    // Al abrir modal, carga los datos actuales
    const handleEdit = () => {
        setEditForm({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            username: usuario.username,
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            email: usuario.email,
            estado: usuario.estado,
            compras: usuario.compras,
            password_actual: "",
            password_nueva: ""
        });
        setShowEdit(true);
    };

    // Guardar cambios
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        try {
            // Prepara el objeto para PATCH
            const patchData = {
                nombre: editForm.nombre,
                apellido: editForm.apellido,
                username: editForm.username,
                telefono: editForm.telefono,
                direccion: editForm.direccion,
                email: editForm.email,
                estado: editForm.estado,
                compras: editForm.compras,
            };
            // Solo envía las contraseñas si se llenan
            if (editForm.password_actual && editForm.password_nueva) {
                patchData.password_actual = editForm.password_actual;
                patchData.password_hash = editForm.password_nueva;
            }
            await patchUsuario(API_URL, token, id, patchData);
            setShowEdit(false);
            window.location.reload();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setSaveError({ message: err.response.data.message });
            } else {
                setSaveError(err);
            }
        } finally {
            setSaving(false);
        }
    };

    // Obtener nombre de la categoría por id
    const getCategoriaNombre = (vino) => {
        if (!vino) return "-";
        const categoriaObj = categorias.find(c => c.categoria_id === (vino.categoria_id || vino.categoria));
        return categoriaObj ? categoriaObj.nombre : "-";
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <MenuLateral />
            <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4 text-center">Detalle de Usuario</h2>
                {loading ? (
                    <p className="text-indigo-700">Cargando usuario...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error.message || error.toString()}</p>
                ) : usuario ? (
                    <>
                        {/* Información del usuario en tabla */}
                        <table className="w-full mb-8 border-separate border-spacing-y-2">
                            <tbody>
                                <tr>
                                    <td className="font-bold text-gray-700 w-40">Nombre:</td>
                                    <td className="text-lg font-semibold">{usuario.nombre} {usuario.apellido}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Username:</td>
                                    <td>{usuario.username}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Teléfono:</td>
                                    <td>{usuario.telefono}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Dirección:</td>
                                    <td>{usuario.direccion}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Email:</td>
                                    <td>{usuario.email}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Fecha de registro:</td>
                                    <td>{usuario.fecha_creacion}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Compras:</td>
                                    <td>{usuario.compras}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-gray-700">Estado:</td>
                                    <td>
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold shadow ${usuario.estado === 1 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                            {usuario.estado === 1 ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="pt-4 text-right">
                                        <button
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-2 rounded-xl shadow transition"
                                            onClick={handleEdit}
                                        >
                                            Editar usuario
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Favoritos del usuario */}
                        <div className="mb-12">
                            <h4 className="text-xl font-bold text-indigo-700 mb-4">Productos Favoritos</h4>
                            {favoritosUsuario.length === 0 ? (
                                <div className="text-gray-400">No tiene productos favoritos.</div>
                            ) : (
                                <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Imagen</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Nombre</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Categoría</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {favoritosUsuario.map(fav => {
                                            const vino = vinos?.find(v => v.vino_id === fav.vino_id);
                                            return (
                                                <tr key={fav.favorito_id || fav.vino_id} className="border-t">
                                                    <td className="px-4 py-2">
                                                        {vino?.imagen_url ? (
                                                            <img
                                                                src={`${API_URL}/assets/vinos/${vino.imagen_url}`}
                                                                alt={vino.nombre}
                                                                className="w-16 h-16 object-contain rounded border bg-white"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400 w-16 h-16 flex items-center justify-center">Sin imagen</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 font-semibold text-indigo-800">{vino?.nombre || "Vino eliminado"}</td>
                                                    <td className="px-4 py-2">{getCategoriaNombre(vino)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pedidos del usuario */}
                        <div>
                            <h4 className="text-xl font-bold text-indigo-700 mb-4">Pedidos Realizados</h4>
                            {pedidosUsuario.length === 0 ? (
                                <div className="text-gray-400">No tiene pedidos realizados.</div>
                            ) : (
                                <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">N° Pedido</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Fecha</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Total</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Estado</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidosUsuario.map(ped => (
                                            <tr key={ped.pedido_id} className="border-t">
                                                <td className="px-4 py-2 font-semibold text-gray-700">#{ped.pedido_id}</td>
                                                <td className="px-4 py-2 text-xs text-gray-600">{ped.fecha_pedido}</td>
                                                <td className="px-4 py-2 font-bold text-indigo-700">Bs. {ped.total}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                        ${ped.estado === "pendiente" ? "bg-yellow-200 text-yellow-800"
                                                            : ped.estado === "enviado" ? "bg-blue-200 text-blue-800"
                                                            : ped.estado === "entregado" ? "bg-green-200 text-green-800"
                                                            : "bg-red-200 text-red-800"
                                                        }`}>
                                                        {ped.estado.charAt(0).toUpperCase() + ped.estado.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        className="bg-indigo-600 hover:bg-indigo-800 text-white px-3 py-1 rounded text-xs font-semibold"
                                                        onClick={() => navigate(`/pedidos/view/${ped.pedido_id}`)}
                                                    >
                                                        Ver detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Usuario no encontrado.</p>
                )}

                {editForm && (
                    <ModalEditUser
                        show={showEdit}
                        onClose={() => setShowEdit(false)}
                        onSubmit={handleSave}
                        form={editForm}
                        setForm={setEditForm}
                        creating={saving}
                        createError={saveError}
                    />
                )}
            </main>
        </div>
    );
};

export default UsuariosView;