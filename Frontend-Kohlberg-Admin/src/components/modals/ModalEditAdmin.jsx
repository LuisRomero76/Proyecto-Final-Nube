import React, { useState } from "react";
import axios from "axios";

const ModalEditAdmin = ({ admin, onClose, onUpdate, API_URL, token }) => {
  const [form, setForm] = useState({
    nombre: admin.nombre || "",
    apellido: admin.apellido || "",
    nombre_usuario: admin.nombre_usuario || "",
    email: admin.email || "",
    telefono: admin.telefono || "",
    direccion: admin.direccion || "",
    sexo: admin.sexo || "",
    edad: admin.edad || "",
    cargo: admin.cargo || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.patch(
        `${API_URL}/admins/update/${admin.admin_id}`,
        form,
        { headers: { Authorization: token } }
      );
      onUpdate({ ...admin, ...form });
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <form
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-indigo-200"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-indigo-900 text-center mb-6 tracking-tight">
          Editar información del administrador
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
              min={18}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cargo
            </label>
            <input
              name="cargo"
              className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
              value={form.cargo}
              onChange={handleChange}
              placeholder="Cargo"
            />
          </div>
        </div>
        {error && (
          <p className="text-red-500 font-semibold text-center mb-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalEditAdmin;