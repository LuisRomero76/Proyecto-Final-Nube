import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

const ModalEditVino = ({
    show,
    onClose,
    onSubmit,
    form,
    setForm,
    creating,
    createError,
    categorias,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
            <form
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-6 border-2 border-indigo-200 max-h-[80vh] overflow-y-auto"
                onSubmit={onSubmit}
            >
                <h2 className="text-2xl font-extrabold text-indigo-900 text-center mb-2 tracking-tight">
                    Editar vino
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Descripción"
                            value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Precio"
                            value={form.precio}
                            onChange={e => setForm({ ...form, precio: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="Stock"
                            value={form.stock}
                            onChange={e => setForm({ ...form, stock: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                        <select
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            value={form.categoria_id}
                            onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.categoria_id} value={cat.categoria_id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen actual</label>
                        {form.imagen_url && (
                            <img
                                src={`${API_URL}/assets/vinos/${form.imagen_url}`}
                                alt="Imagen actual"
                                className="w-24 h-24 object-contain mb-2 rounded"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 transition"
                            onChange={e => setForm({ ...form, imagen_file: e.target.files[0] })}
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
                        {creating ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModalEditVino;