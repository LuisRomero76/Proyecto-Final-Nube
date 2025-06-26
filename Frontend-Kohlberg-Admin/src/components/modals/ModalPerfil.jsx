import { useState } from "react";
import { FaRegImage } from "react-icons/fa6";

const ModalPerfil = ({
  modalPerfil,
  admin,
  API_URL,
  imagenPreview,
  imagenError,
  subiendoImagen,
  handleImagenChange,
  handleSubirImagen,
  setModalPerfil,
  setNuevaImagen,
  setImagenPreview,
  setImagenError,
  handleActualizarInfo,
  editInfoLoading,
  editInfoError,
}) => {
  // Modal para editar foto de perfil
  if (modalPerfil === "editar") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <form
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center gap-8 border border-indigo-200"
          onSubmit={handleSubirImagen}
        >
          <h2 className="text-2xl font-bold text-indigo-900 text-center mb-2 tracking-tight">
            Cambiar foto de perfil
          </h2>
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-indigo-700 shadow">
            {imagenPreview ? (
              <img
                src={imagenPreview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : admin.perfil ? (
              <img
                src={`${API_URL}/assets/vinos/${admin.perfil}`}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <FaRegImage size={90} className="text-indigo-700" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-700 border border-indigo-300 rounded-lg p-2 mt-2"
            onChange={handleImagenChange}
          />
          {imagenError && (
            <div className="text-red-600 font-semibold">{imagenError}</div>
          )}
          <div className="flex justify-end gap-4 w-full mt-2">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold transition"
              onClick={() => {
                setModalPerfil(null);
                setNuevaImagen(null);
                setImagenPreview(null);
                setImagenError("");
              }}
              disabled={subiendoImagen}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition"
              disabled={subiendoImagen}
            >
              {subiendoImagen ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Modal para editar información
  if (modalPerfil === "editarInfo") {
    const [form, setForm] = useState({
      nombre: admin.nombre || "",
      apellido: admin.apellido || "",
      nombre_usuario: admin.nombre_usuario || "",
      email: admin.email || "",
      telefono: admin.telefono || "",
      direccion: admin.direccion || "",
      sexo: admin.sexo || "",
      edad: admin.edad || "",
    });

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleActualizarInfo(form);
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <form
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-indigo-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-indigo-900 text-center mb-6 tracking-tight">
            Editar información
          </h2>
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Apellido
              </label>
              <input
                name="apellido"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.apellido}
                onChange={handleChange}
                required
                placeholder="Apellido"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario
              </label>
              <input
                name="nombre_usuario"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.nombre_usuario}
                onChange={handleChange}
                required
                placeholder="Usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                name="telefono"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Dirección
              </label>
              <input
                name="direccion"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Sexo
              </label>
              <select
                name="sexo"
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.sexo}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Edad
              </label>
              <input
                name="edad"
                type="number" 
                className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                value={form.edad}
                onChange={handleChange}
                placeholder="Edad"
              />
            </div>
          </div>
          {editInfoError && (
            <p className="text-red-500 font-semibold text-center mb-2">
              {editInfoError}
            </p>
          )}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold transition"
              onClick={() => setModalPerfil(null)}
              disabled={editInfoLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition"
              disabled={editInfoLoading}
            >
              {editInfoLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
};

export default ModalPerfil;