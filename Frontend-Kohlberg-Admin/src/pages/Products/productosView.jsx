import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import { viewVino, updateVino } from "../../hooks/useVinos";
import ModalEditVino from "../../components/modals/ModalEditVino";
import axios from "axios";

const ProductosView = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { collapsed } = useSidebarAndAuth(API_URL, token);
  const { id } = useParams();
  const navigate = useNavigate();

  const [vino, setVino] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal edición
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const fetchVino = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await viewVino(API_URL, token, id);
        setVino(data);

        // Obtener la categoría del vino
        if (data.categoria_id) {
          const res = await axios.get(`${API_URL}/categoriasAdmin/${data.categoria_id}`, {
            headers: { Authorization: token }
          });
          setCategoria(res.data);
        }
      } catch (err) {
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    };
    fetchVino();
  }, [API_URL, token, id, showEdit]);

  useEffect(() => {
    // Obtener todas las categorías para el modal de edición
    axios.get(`${API_URL}/categoriasAdmin`, {
      headers: { Authorization: token }
    })
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, [API_URL, token]);

  // Abrir modal de edición
  const handleEditVino = () => {
    if (!vino) return;
    setEditForm({
      nombre: vino.nombre,
      descripcion: vino.descripcion,
      precio: vino.precio,
      stock: vino.stock,
      categoria_id: vino.categoria_id,
      imagen_url: vino.imagen_url
    });
    setShowEdit(true);
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

      await updateVino(API_URL, token, id, dataToSend, !!editForm.imagen_file);
      setShowEdit(false);
      setEditForm(null);
    } catch (err) {
      setEditError(err);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateral />
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} flex flex-col items-center justify-start py-10 px-4`}>
        <div className="w-full max-w-3xl">
          <button
            className="mb-6 text-indigo-700 hover:underline font-semibold"
            onClick={() => navigate(-1)}
          >
            &larr; Volver
          </button>
          <h2 className="text-3xl font-bold text-indigo-900 mb-8 border-b pb-4">Detalle del Producto</h2>
          {loading ? (
            <div className="text-lg text-gray-500 text-center py-20">Cargando producto...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-20">{error}</div>
          ) : vino ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-64 h-64 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center shadow border mb-4">
                  {vino.imagen_url ? (
                    <img
                      src={`${API_URL}/assets/vinos/${vino.imagen_url}`}
                      alt={vino.nombre}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400">Sin imagen</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Nombre: </span>
                  <span className="text-indigo-900 font-bold text-lg">{vino.nombre}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Descripción: </span>
                  <span className="text-gray-800">{vino.descripcion}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Precio: </span>
                  <span className="text-indigo-700 font-bold text-lg">Bs. {vino.precio}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Stock: </span>
                  {vino.stock === 0 ? (
                    <span className="text-red-600 font-semibold">Agotado</span>
                  ) : (
                    <span className="text-green-700 font-bold">{vino.stock}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Categoría: </span>
                  <span className="text-purple-700 font-semibold">
                    {categoria ? categoria.nombre : "Sin categoría"}
                  </span>
                </div>
                <div className="mt-6">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition"
                    onClick={handleEditVino}
                  >
                    Editar producto
                  </button>
                </div>
                {editError && (
                  <div className="text-red-500 mt-2 font-semibold">{editError.message || editError.toString()}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-20">No se encontró el producto.</div>
          )}
        </div>
        <ModalEditVino
          show={showEdit}
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
};

export default ProductosView;