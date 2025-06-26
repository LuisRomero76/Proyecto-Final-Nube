import React from "react";

const ModalCreateAdmin = ({
    show,
    onClose,
    onSubmit,
    form,
    setForm,
    creating,
    createError
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
            <form
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-6 border-2 border-indigo-200"
                onSubmit={onSubmit}
            >
                <h2 className="text-2xl font-extrabold text-indigo-900 text-center mb-2 tracking-tight">
                    Crear nuevo administrador
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Apellido"
                            value={form.apellido}
                            onChange={e => setForm({ ...form, apellido: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Edad</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Edad"
                            type="number"
                            min={18}
                            value={form.edad}
                            onChange={e => setForm({ ...form, edad: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Dirección"
                            value={form.direccion}
                            onChange={e => setForm({ ...form, direccion: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sexo</label>
                        <select
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            value={form.sexo}
                            onChange={e => setForm({ ...form, sexo: e.target.value })}
                            required
                        >
                            <option value="">Selecciona sexo</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Teléfono"
                            value={form.telefono}
                            onChange={e => setForm({ ...form, telefono: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de usuario</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Nombre de usuario"
                            value={form.nombre_usuario}
                            onChange={e => setForm({ ...form, nombre_usuario: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                        <input
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Contraseña"
                            type="password"
                            value={form.passwordAdmin}
                            onChange={e => setForm({ ...form, passwordAdmin: e.target.value })}
                            required
                        />
                    </div>
                </div>
                {createError && (
                    <p className="text-red-500 font-semibold text-center">{createError.message || createError.toString()}</p>
                )}
                <div className="flex justify-end gap-4 pt-2">
                    <button
                        type="button"
                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold transition"
                        onClick={onClose}
                        disabled={creating}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-700 text-white rounded-lg font-bold hover:bg-indigo-800 transition"
                        disabled={creating}
                    >
                        {creating ? "Creando..." : "Crear"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModalCreateAdmin;