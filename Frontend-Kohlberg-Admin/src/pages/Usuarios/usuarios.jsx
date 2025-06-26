import React, { useState } from "react";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import { useUsuarios, useDeleteUsuarios, createUsuario } from "../../hooks/useUsuarios";
import ModalUser from "../../components/modals/modalUser";
import { FaTrashAlt } from "react-icons/fa";

function Usuarios() {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);

    // Refrescar la tabla sin recargar la página
    const [refresh, setRefresh] = useState(0);
    const { usuarios, loading, error } = useUsuarios(API_URL, token, refresh);

    // Estado para manejar el usuario a eliminar y recargar la lista tras eliminar
    const [deleteId, setDeleteId] = useState(null);
    const { loading: deleting, error: deleteError } = useDeleteUsuarios(API_URL, token, deleteId);

    React.useEffect(() => {
        if (deleteId && !deleting && !deleteError) {
            setRefresh(r => r + 1);
        }
    }, [deleteId, deleting, deleteError]);

    // Crear usuario
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        username: "",
        telefono: "",
        direccion: "",
        email: "",
        password_hash: ""
    });

    const handleCreateUsuario = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);
        try {
            await createUsuario(API_URL, token, form);
            setShowCreate(false);
            setForm({
                nombre: "",
                apellido: "",
                username: "",
                telefono: "",
                direccion: "",
                email: "",
                password_hash: ""
            });
            window.location.reload();
        } catch (err) {
            setCreateError(err);
        } finally {
            setCreating(false);
        }
    };

    // Cambiar estado
    const [toggleId, setToggleId] = useState(null);
    const [toggling, setToggling] = useState(false);
    const [toggleError, setToggleError] = useState(null);

    const handleToggleEstado = async (usuario) => {
        setToggling(true);
        setToggleError(null);
        setToggleId(usuario.persona_id);
        try {
            const response = await fetch(`${API_URL}/usuariosStateAdmin/${usuario.persona_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                },
                body: JSON.stringify({ estado: usuario.estado === 1 ? 0 : 1 }),
            });
            if (!response.ok) throw new Error("Error al cambiar estado");
            window.location.reload();
        } catch (err) {
            setToggleError(err);
        } finally {
            setToggling(false);
            setToggleId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <MenuLateral />
            <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                            Usuarios
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Gestiona los usuarios registrados en la plataforma.
                        </p>
                    </div>
                    <button
                        className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition"
                        onClick={() => setShowCreate(true)}
                    >
                        <span className="inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Usuario
                        </span>
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-50"></div>
                        <p className="ml-6 text-xl text-indigo-700 font-semibold">Cargando usuarios...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-lg font-semibold">Error: {error.message || error.toString()}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Apellido</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Username</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Teléfono</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Dirección</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Email</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Fecha registro</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Compras</th>
                                    <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                                    <th className="px-6 py-4 text-center text-gray-900 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario, idx) => (
                                    <tr
                                        key={usuario.persona_id}
                                        className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-indigo-50" : "bg-white"} hover:bg-indigo-100 transition`}
                                    >
                                        <td className="px-6 py-4 font-semibold">
                                            <a
                                                href={`/usuarioView/${usuario.persona_id}`}
                                                className="text-indigo-700 hover:underline hover:text-indigo-900 transition"
                                            >
                                                {usuario.nombre}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">{usuario.apellido}</td>
                                        <td className="px-6 py-4">{usuario.username}</td>
                                        <td className="px-6 py-4">{usuario.telefono}</td>
                                        <td className="px-6 py-4">{usuario.direccion}</td>
                                        <td className="px-6 py-4">{usuario.email}</td>
                                        <td className="px-6 py-4">{usuario.fecha_creacion}</td>
                                        <td className="px-6 py-4 text-center">{usuario.compras}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-1 rounded-full text-sm font-bold shadow ${usuario.estado === 1 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                                {usuario.estado === 1 ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2 justify-center">
                                            <button
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow transition font-semibold"
                                                onClick={() => setDeleteId(usuario.persona_id)}
                                                disabled={deleting}
                                            >
                                                {deleting && deleteId === usuario.persona_id ? (
                                                  "Eliminando..."
                                                ) : (
                                                  <>
                                                    <FaTrashAlt size={20} />
                                                  </>
                                                )}
                                            </button>
                                            <button
                                                className={`${
                                                    usuario.estado === 1
                                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                                        : "bg-green-600 hover:bg-green-700"
                                                } text-white px-4 py-1 rounded-lg shadow transition font-semibold`}
                                                onClick={() => handleToggleEstado(usuario)}
                                                disabled={toggling && toggleId === usuario.persona_id}
                                            >
                                                {toggling && toggleId === usuario.persona_id
                                                    ? "Cambiando..."
                                                    : usuario.estado === 1
                                                    ? "Desactivar"
                                                    : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {toggleError && (
                            <p className="text-red-500 mt-4 ml-4">Error: {toggleError.message || toggleError.toString()}</p>
                        )}
                    </div>
                )}

                <ModalUser
                    show={showCreate}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreateUsuario}
                    form={form}
                    setForm={setForm}
                    creating={creating}
                    createError={createError}
                />
            </main>
        </div>
    );
}

export default Usuarios;