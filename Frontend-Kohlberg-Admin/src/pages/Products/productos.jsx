import React, { useState, useEffect } from "react";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import useVinos, { createVino, deleteVino, updateVino } from "../../hooks/useVinos";
import ModalVino from "../../components/modals/modalVino";
import ModalEditVino from "../../components/modals/ModalEditVino";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

function Productos() {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);

    const [refresh, setRefresh] = useState(0);
    const { vinos, loading, error } = useVinos(API_URL, token, refresh);

    // Categorías para el select
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(""); // "" para mostrar todos

    useEffect(() => {
        axios.get(`${API_URL}/categoriasAdmin`, {
            headers: { Authorization: token }
        })
        .then(res => setCategorias(res.data))
        .catch(() => setCategorias([]));
    }, [API_URL, token]);

    // Modal de creación
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria_id: "",
        imagen_url: ""
    });

    const handleCreateVino = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);
        try {
            const formData = new FormData();
            formData.append("nombre", form.nombre);
            formData.append("descripcion", form.descripcion);
            formData.append("precio", form.precio);
            formData.append("stock", form.stock);
            formData.append("categoria_id", form.categoria_id);
            if (form.imagen_file) {
                formData.append("imagen", form.imagen_file);
            }

            await axios.post(`${API_URL}/vinosAdmin`, formData, {
                headers: {
                    Authorization: token,
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowCreate(false);
            setForm({
                nombre: "",
                descripcion: "",
                precio: "",
                stock: "",
                categoria_id: "",
                imagen_file: null
            });
            window.location.reload();
        } catch (err) {
            setCreateError(err);
        } finally {
            setCreating(false);
        }
    };

    // Estado para edición
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState(null);

    // Abrir modal de edición
    const handleEditVino = (vino) => {
        setEditForm({
            nombre: vino.nombre,
            descripcion: vino.descripcion,
            precio: vino.precio,
            stock: vino.stock,
            categoria_id: vino.categoria_id,
            imagen_url: vino.imagen_url
        });
        setShowEdit(vino.vino_id);
        setEditError(null);
    };

    // Guardar cambios de edición
    const handleSaveEditVino = async (e) => {
        e.preventDefault();
        setEditing(true);
        setEditError(null);
        try {
            let dataToSend;
            if (editForm.imagen_file) {
                // Si hay nueva imagen, usa FormData
                dataToSend = new FormData();
                dataToSend.append("nombre", editForm.nombre);
                dataToSend.append("descripcion", editForm.descripcion);
                dataToSend.append("precio", editForm.precio);
                dataToSend.append("stock", editForm.stock);
                dataToSend.append("categoria_id", editForm.categoria_id);
                dataToSend.append("imagen", editForm.imagen_file);
                dataToSend.append("imagen_url", editForm.imagen_url); // Para saber cuál borrar en el backend
            } else {
                // Si no hay nueva imagen, envía JSON normal
                dataToSend = {
                    nombre: editForm.nombre,
                    descripcion: editForm.descripcion,
                    precio: editForm.precio,
                    stock: editForm.stock,
                    categoria_id: editForm.categoria_id,
                };
            }
        
            await updateVino(API_URL, token, showEdit, dataToSend, !!editForm.imagen_file);
            setShowEdit(false);
            setEditForm(null);
            window.location.reload();
        } catch (err) {
            setEditError(err);
        } finally {
            setEditing(false);
        }
    };


    // Eliminar vino
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const handleDeleteVino = async (vino_id) => {
        setDeletingId(vino_id);
        setDeleteError(null);
        try {
            await deleteVino(API_URL, token, vino_id);
            window.location.reload(); // Recargar para reflejar cambios
        } catch (err) {
            setDeleteError(err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <MenuLateral />
            <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                            Productos
                        </h2>
                        <p className="text-gray-500 font-medium">Gestiona los vinos disponibles en la tienda</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <select
                            className="border-2 border-gray-300 bg-white rounded-xl px-4 py-2 shadow focus:ring-2 focus:ring-indigo-400 transition"
                            value={categoriaSeleccionada}
                            onChange={e => setCategoriaSeleccionada(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.categoria_id} value={cat.categoria_id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                        <button
                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition"
                            onClick={() => setShowCreate(true)}
                        >
                            <span className="inline-flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo vino
                            </span>
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-50"></div>
                        <p className="ml-6 text-xl text-indigo-700 font-semibold">Cargando vinos...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-lg font-semibold">Error: {error.message || error.toString()}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Imagen</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Descripción</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Precio</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Stock</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Categoría</th>
                                    <th className="px-6 py-4 text-center text-gray-900 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vinos
                                    .filter(vino =>
                                        !categoriaSeleccionada ||
                                        String(vino.categoria_id) === String(categoriaSeleccionada)
                                    )
                                    .map(vino => {
                                        const categoria = categorias.find(cat => cat.categoria_id === vino.categoria_id);
                                        return (
                                            <tr key={vino.vino_id} className="hover:bg-gray-100 transition">
                                                <td className="px-6 py-4">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        <img
                                                            src={`${API_URL}/assets/vinos/${vino.imagen_url}`}
                                                            alt={vino.nombre}
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{vino.nombre}</td>
                                                <td className="px-6 py-4 text-gray-700">{vino.descripcion}</td>
                                                <td className="px-6 py-4 text-indigo-700 font-bold">${vino.precio}</td>
                                                <td className="px-6 py-4 text-pink-700 font-bold">
                                                    {vino.stock === 0 ? (
                                                        <span className="text-red-600 font-semibold">Agotado</span>
                                                    ) : (
                                                        vino.stock
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-purple-700 font-semibold">{categoria ? categoria.nombre : vino.categoria_id}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg transition mr-2"
                                                        onClick={() => handleEditVino(vino)}
                                                    >
                                                        <FaEdit size={20} />
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg transition mr-2"
                                                        onClick={() => handleDeleteVino(vino.vino_id)}
                                                        disabled={deletingId === vino.vino_id}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </button>
                                                    <button
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg transition"
                                                        onClick={() => window.location.href = `/productos/${vino.vino_id}`}
                                                        title="Ver producto"
                                                    >
                                                        <FaEye size={20} />
                                                    </button>
                                                    {deleteError && deletingId === vino.vino_id && (
                                                        <p className="text-red-500 mt-2 font-semibold">Error: {deleteError.message || deleteError.toString()}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {vinos.filter(vino =>
                            !categoriaSeleccionada ||
                            String(vino.categoria_id) === String(categoriaSeleccionada)
                        ).length === 0 && (
                            <div className="text-center py-10 text-gray-500 font-semibold">
                                No hay vinos para mostrar en esta categoría.
                            </div>
                        )}
                    </div>
                )}

                <ModalVino
                    show={showCreate}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreateVino}
                    form={form}
                    setForm={setForm}
                    creating={creating}
                    createError={createError}
                    categorias={categorias}
                />
                <ModalEditVino
                    show={!!showEdit}
                    onClose={() => setShowEdit(false)}
                    onSubmit={handleSaveEditVino}
                    form={editForm || {}}
                    setForm={setEditForm}
                    creating={editing}
                    createError={editError}
                    categorias={categorias}
                />

            </main>
        </div>
    );
}

export default Productos;