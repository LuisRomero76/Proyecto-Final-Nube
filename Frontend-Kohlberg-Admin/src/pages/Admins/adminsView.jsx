import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import axios from "axios";
import ModalEditAdmin from "../../components/modals/ModalEditAdmin";
import { FaUserTie, FaPhone, FaMapMarkerAlt, FaTransgender, FaCalendarAlt, FaEdit, FaTags, FaEye as FaEyeIcon } from "react-icons/fa";

const AdminsView = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { collapsed } = useSidebarAndAuth(API_URL, token);
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [ventasLoading, setVentasLoading] = useState(true);
  const [ventasError, setVentasError] = useState(null);

  // Obtener datos del admin
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/admins/${id}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setAdmin(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error al obtener administrador");
        setLoading(false);
      });
  }, [API_URL, token, id]);

  // Obtener ventas realizadas por el admin
  useEffect(() => {
    if (!id) return;
    setVentasLoading(true);
    axios
      .get(`${API_URL}/ventasAdmin/admin/${id}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setVentas(res.data);
        setVentasLoading(false);
      })
      .catch((err) => {
        setVentasError(err.response?.data?.message || "Error al obtener ventas");
        setVentasLoading(false);
      });
  }, [API_URL, token, id]);

  const handleEdit = () => setShowEdit(true);
  const handleCloseEdit = () => setShowEdit(false);

  const handleUpdate = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    setShowEdit(false);
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MenuLateral />
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} flex flex-col items-center py-10 px-4`}>
        <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight border-b pb-4">
            Perfil del {admin.cargo}
          </h2>

          {/* Información básica del administrador */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={`${API_URL}/assets/vinos/${admin.perfil}`}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300 shadow mb-4"
            />
            <div className="text-xl font-bold text-gray-800">{admin.nombre} {admin.apellido}</div>
            <div className="text-gray-500">{admin.cargo}</div>
          </div>

          {/* Información del perfil en formato tabla */}
          <table className="w-full mb-8 border-separate border-spacing-y-2">
            <tbody>
              <tr>
                <td className="font-bold text-gray-700">Nombre:</td>
                <td className="text-lg font-semibold">{admin.nombre} {admin.apellido}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Usuario:</td>
                <td className="flex items-center gap-2">
                  <FaUserTie className="text-gray-500" />
                  <span className="font-mono">{admin.nombre_usuario}</span>
                </td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Teléfono:</td>
                <td><FaPhone className="inline mr-2 text-gray-500" />{admin.telefono || "No disponible"}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Dirección:</td>
                <td><FaMapMarkerAlt className="inline mr-2 text-gray-500" />{admin.direccion || "No disponible"}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Sexo:</td>
                <td>
                  <FaTransgender className="inline mr-2 text-gray-500" />
                  {admin.sexo === "M"
                    ? "Masculino"
                    : admin.sexo === "F"
                    ? "Femenino"
                    : admin.sexo || "No disponible"}
                </td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Fecha de registro:</td>
                <td><FaCalendarAlt className="inline mr-2 text-gray-500" />{admin.fecha_registro}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Email:</td>
                <td>{admin.email}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Cargo:</td>
                <td>{admin.cargo || "No disponible"}</td>
              </tr>
              <tr>
                <td className="font-bold text-gray-700">Edad:</td>
                <td>{admin.edad || "No disponible"}</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-4 text-right">
                  <button
                    className="flex items-center gap-2 border border-indigo-700 text-indigo-700 font-semibold px-4 py-2 rounded hover:bg-indigo-50 transition-none"
                    onClick={handleEdit}
                  >
                    <FaEdit /> Editar información
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Ventas realizadas por el administrador */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaTags /> Ventas realizadas
            </h3>
            {ventasLoading ? (
              <div className="text-gray-700 text-center text-base">Cargando ventas...</div>
            ) : ventasError ? (
              <div className="text-red-500 text-center">{ventasError}</div>
            ) : ventas.length === 0 ? (
              <div className="text-gray-500 text-center">No hay ventas registradas para este administrador.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow border bg-white">
                <table className="min-w-full divide-y divide-indigo-200">
                  <thead className="bg-indigo-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        ID Venta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        ID Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Fecha Venta
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-indigo-100">
                    {ventas.map((venta) => (
                      <tr key={venta.venta_id} className="hover:bg-indigo-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {venta.venta_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {venta.pedido_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {venta.fecha_venta}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                            onClick={() => navigate(`/pedidos/view/${venta.pedido_id}`)}
                            title="Ver detalles del pedido"
                          >
                            <FaEyeIcon /> Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal de edición */}
          {showEdit && (
            <ModalEditAdmin
              admin={admin}
              onClose={handleCloseEdit}
              onUpdate={handleUpdate}
              API_URL={API_URL}
              token={token}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminsView;