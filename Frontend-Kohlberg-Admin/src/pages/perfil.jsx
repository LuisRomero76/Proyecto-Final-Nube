import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../components/menu_lateral/menu";
import useSidebarAndAuth from "../hooks/useSidebarAndAuth";
import { usePerfilAdmin } from "../hooks/useAdmins";
import { useVentas } from "../hooks/useVentas";
import ModalPerfil from "../components/modals/ModalPerfil";
import { FaUserTie, FaPhone, FaMapMarkerAlt, FaTransgender, FaCalendarAlt, FaLock, FaEye, FaEyeSlash, FaEdit, FaTags, FaEye as FaEyeIcon } from "react-icons/fa";

const Perfil = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { collapsed } = useSidebarAndAuth(API_URL, token);
  const navigate = useNavigate();

  const {
    admin,
    loading,
    modalPerfil,
    setModalPerfil,
    setNuevaImagen,
    imagenPreview,
    setImagenPreview,
    imagenError,
    setImagenError,
    subiendoImagen,
    handleImagenChange,
    handleSubirImagen,
    // Contraseña
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordActual,
    setPasswordActual,
    passwordNueva,
    setPasswordNueva,
    passwordConfirm,
    setPasswordConfirm,
    passwordError,
    passwordSuccess,
    changingPassword, 
    mostrarFormulario,
    setMostrarFormulario,
    handlePasswordChange,
    // Nuevas funciones y estados para la edición de información
    handleActualizarInfo,
    editInfoLoading,
    editInfoError,
  } = usePerfilAdmin(API_URL, token);

  // Ventas del administrador
  const {
    ventas,
    ventasLoading,
    ventasError,
    fetchVentasByAdmin,
  } = useVentas(API_URL, token);

  useEffect(() => {
    if (admin && admin.admin_id) {
      fetchVentasByAdmin(admin.admin_id);
    }
    // eslint-disable-next-line
  }, [admin]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MenuLateral />
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} flex flex-col items-center py-10 px-4`}>
        <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight border-b pb-4">Perfil del Administrador</h2>
          {loading ? (
            <div className="text-gray-700 text-center text-lg">Cargando perfil...</div>
          ) : !admin ? (
            <div className="text-red-500 text-center">No se pudo cargar el perfil.</div>
          ) : (
            <>
              {/* Información del perfil en formato tabla */}
              <table className="w-full mb-8 border-separate border-spacing-y-2">
                <tbody>
                  <tr>
                    <td className="align-top pr-4 font-bold text-gray-700 w-40"></td>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-5xl text-gray-400 overflow-hidden">
                          {admin.perfil ? (
                            <img
                              src={`${API_URL}/assets/vinos/${admin.perfil}`}
                              className="w-full h-full object-cover"
                              alt="Perfil"
                            />
                          ) : (
                            <span>{admin.nombre?.charAt(0) || "A"}</span>
                          )}
                        </div>
                        <button
                          className="px-4 py-1 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setModalPerfil("editar")}
                        >
                          Cambiar foto
                        </button>
                      </div>
                    </td>
                  </tr>
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
                        onClick={() => setModalPerfil("editarInfo")}
                      >
                        <FaEdit /> Editar información
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Cambio de contraseña */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FaLock /> Cambiar contraseña
                </h3>
                {!mostrarFormulario ? (
                  <button
                    className="border border-gray-400 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-100 transition-none"
                    onClick={() => setMostrarFormulario(true)}
                  >
                    Cambiar contraseña
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md mx-auto">
                    <div>
                      <label className="block font-semibold mb-1">Contraseña actual</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="border rounded px-4 py-2 w-full pr-10"
                          value={passwordActual}
                          onChange={e => setPasswordActual(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Nueva contraseña</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="border rounded px-4 py-2 w-full pr-10"
                          value={passwordNueva}
                          onChange={e => setPasswordNueva(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowNewPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Confirmar nueva contraseña</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="border rounded px-4 py-2 w-full pr-10"
                          value={passwordConfirm}
                          onChange={e => setPasswordConfirm(e.target.value)}
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    {passwordError && (
                      <div className="text-red-600 font-semibold">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="text-green-600 font-semibold">{passwordSuccess}</div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-indigo-700 text-white font-bold px-6 py-2 rounded shadow transition-none w-full"
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Guardando..." : "Actualizar contraseña"}
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-800 font-bold px-6 py-2 rounded shadow transition-none w-full"
                        onClick={() => {
                          setMostrarFormulario(false);
                          setPasswordActual("");
                          setPasswordNueva("");
                          setPasswordConfirm("");
                        }}
                        disabled={changingPassword}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

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

              {/* Modales */}
              <ModalPerfil
                modalPerfil={modalPerfil}
                admin={admin}
                API_URL={API_URL}
                imagenPreview={imagenPreview}
                imagenError={imagenError}
                subiendoImagen={subiendoImagen}
                handleImagenChange={handleImagenChange}
                handleSubirImagen={handleSubirImagen}
                setModalPerfil={setModalPerfil}
                setNuevaImagen={setNuevaImagen}
                setImagenPreview={setImagenPreview}
                setImagenError={setImagenError}
                handleActualizarInfo={handleActualizarInfo}
                editInfoLoading={editInfoLoading}
                editInfoError={editInfoError}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Perfil;