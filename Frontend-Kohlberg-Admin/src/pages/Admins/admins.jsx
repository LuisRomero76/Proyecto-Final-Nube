import React, { useState, useEffect } from "react";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import { useAdmins, useAdminsState, createAdmin } from "../../hooks/useAdmins"; // Debes tener este hook para obtener la lista de admins
import { FaTrashAlt, FaUserCircle, FaEye } from "react-icons/fa"; // Asegúrate de importar FaEye
import ModalCreateAdmin from "../../components/modals/ModalCreateAdmin";
import { useNavigate } from "react-router-dom";
import { useAdminPerfil } from "../../hooks/useAdminPerfil";

const Admins = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { collapsed } = useSidebarAndAuth(API_URL, token);

  // Obtener administradores
  const { admins, loading, error, refreshAdmins } = useAdmins(API_URL, token);

  // Estado para cambiar estado de admin
  const { updateAdminState, loading: toggling, error: toggleError } = useAdminsState(API_URL, token);
  const [toggleId, setToggleId] = useState(null);

  // Estado para eliminar admin (puedes crear un hook similar si tienes endpoint)
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Modal de creación
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    direccion: "",
    sexo: "",
    email: "",
    telefono: "",
    nombre_usuario: "",
    passwordAdmin: ""
  });

  const { admin } = useAdminPerfil(API_URL, token);
  const navigate = useNavigate();

  useEffect(() => {
    if (admin && admin.cargo !== "Administrador General") {
      navigate("/principal"); // O la ruta que prefieras
    }
  }, [admin, navigate]);

  const handleToggleEstado = async (admin) => {
    setToggleId(admin.admin_id);
    await updateAdminState(admin.admin_id, admin.estado === 1 ? 0 : 1);
    setToggleId(null);
    refreshAdmins();
  };

  const handleDeleteAdmin = async (admin_id) => {
    setDeleting(true);
    setDeleteId(admin_id);
    setDeleteError(null);
    try {
      await fetch(`${API_URL}/admins/${admin_id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      refreshAdmins();
    } catch (err) {
      setDeleteError("Error al eliminar administrador");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await createAdmin(API_URL, token, form);
      setShowCreate(false);
      setForm({
        nombre: "",
        apellido: "",
        edad: "",
        direccion: "",
        sexo: "",
        email: "",
        telefono: "",
        nombre_usuario: "",
        passwordAdmin: ""
      });
      refreshAdmins();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Error al crear administrador");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateral />
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
        <div className="flex justify-end mb-6">
          <button
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition"
            onClick={() => setShowCreate(true)}
          >
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear Administrador
            </span>
          </button>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight border-b pb-4">Administradores</h2>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-opacity-50"></div>
            <p className="ml-6 text-xl text-indigo-700 font-semibold">Cargando administradores...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-lg font-semibold">Error: {error.message || error.toString()}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Perfil</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Nombre</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Apellido</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Usuario</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Dirección</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Fecha registro</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Teléfono</th>
                  <th className="px-6 py-4 text-left text-gray-900 font-bold">Estado</th>
                  <th className="px-6 py-4 text-center text-gray-900 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, idx) => (
                  <tr
                    key={admin.admin_id}
                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-indigo-50" : "bg-white"} hover:bg-indigo-100 transition`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-700 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {admin.perfil ? (
                          <img
                            src={`${API_URL}/assets/vinos/${admin.perfil}`}
                            className="w-full h-full object-cover"
                            alt="Perfil"
                          />
                        ) : (
                          <FaUserCircle size={32} className="text-indigo-700" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{admin.nombre}</td>
                    <td className="px-6 py-4">{admin.apellido}</td>
                    <td className="px-6 py-4">{admin.nombre_usuario}</td>
                    <td className="px-6 py-4">{admin.direccion}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">{admin.fecha_registro}</td>
                    <td className="px-6 py-4">{admin.telefono}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1 rounded-full text-sm font-bold shadow ${admin.estado === 1 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {admin.estado === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg shadow transition font-semibold"
                        onClick={() => navigate(`/adminView/${admin.admin_id}`)}
                      >
                        <FaEye size={20} />
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow transition font-semibold"
                        onClick={() => handleDeleteAdmin(admin.admin_id)}
                        disabled={deleting && deleteId === admin.admin_id}
                      >
                        {deleting && deleteId === admin.admin_id ? (
                          "Eliminando..."
                        ) : (
                          <FaTrashAlt size={20} />
                        )}
                      </button>
                      <button
                        className={`${
                          admin.estado === 1
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white px-4 py-1 rounded-lg shadow transition font-semibold`}
                        onClick={() => handleToggleEstado(admin)}
                        disabled={toggling && toggleId === admin.admin_id}
                      >
                        {toggling && toggleId === admin.admin_id
                          ? "Cambiando..."
                          : admin.estado === 1
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {toggleError && (
              <p className="text-red-500 mt-4 ml-4">Error: {toggleError}</p>
            )}
            {deleteError && (
              <p className="text-red-500 mt-4 ml-4">Error: {deleteError}</p>
            )}
          </div>
        )}
        <ModalCreateAdmin
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateAdmin}
          form={form}
          setForm={setForm}
          creating={creating}
          createError={createError}
        />
      </main>
    </div>
  );
};

export default Admins;