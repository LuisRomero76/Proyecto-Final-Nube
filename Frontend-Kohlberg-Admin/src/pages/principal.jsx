import MenuLateral from '../components/menu_lateral/menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import useSidebarAndAuth from '../hooks/useSidebarAndAuth';
import useUsuarios from '../hooks/useUsuarios';
import useVinos from '../hooks/useVinos';
import useFavoritos from '../hooks/useFavoritos';
import usePedidos from '../hooks/usePedidos';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const Principal = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const { collapsed } = useSidebarAndAuth(API_URL, token);
  const { usuarios } = useUsuarios(API_URL, token);
  const { vinos } = useVinos(API_URL, token);
  const { favoritos } = useFavoritos(API_URL, token);
  const { pedidos } = usePedidos(API_URL, token);

  // Filtra solo los pedidos pendientes
  const pedidosPendientes = pedidos
    ? pedidos.filter(p => p.estado === "pendiente")
    : [];

  // Ranking de favoritos
  const rankingFavoritos = vinos && favoritos
    ? vinos
        .map(vino => ({
          nombre: vino.nombre,
          favoritos: favoritos.filter(fav => fav.vino_id === vino.vino_id).length
        }))
        .sort((a, b) => b.favoritos - a.favoritos)
        .filter(v => v.favoritos > 0)
    : [];
  
  // Pedidos entregados
  const pedidosEntregados = pedidos
    ? pedidos.filter(p => p.estado === "entregado")
    : [];

  // Obtener año actual (o el año más reciente de los pedidos entregados)
  const anioActual = pedidosEntregados.length > 0
    ? new Date(pedidosEntregados[0].fecha_pedido).getFullYear()
    : new Date().getFullYear();

  // Inicializar conteo de pedidos entregados por mes
  const pedidosPorMes = Array(12).fill(0);

  pedidosEntregados.forEach(pedido => {
    const fecha = new Date(pedido.fecha_pedido.replace(" ", "T"));
    const anioPedido = fecha.getFullYear();
    const mesPedido = fecha.getMonth(); // 0 = enero

    if (anioPedido === anioActual) {
      pedidosPorMes[mesPedido] += 1;
    }
  });

  // Formato para recharts
  const dataVentasMes = MESES.map((mes, idx) => ({
    mes,
    ventas: pedidosPorMes[idx] // Ahora es la cantidad de pedidos entregados
  }));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateral />

      <main
        className={`transition-all duration-200 w-full ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        } p-6`}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Panel de Administración
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Card Top Usuarios */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-indigo-800 mb-4">Usuarios que Más Compran</h2>
            <ul className="space-y-3">
              {usuarios &&
                [...usuarios]
                  .sort((a, b) => b.compras - a.compras)
                  .slice(0, 5)
                  .map((usuario, idx) => (
                    <li key={usuario.id || idx} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                      <span className="flex items-center gap-2">
                        <span className="inline-block bg-indigo-100 text-indigo-700 font-bold rounded-full px-3 py-1 text-xs">{idx + 1}</span>
                        <span className="font-medium">{usuario.nombre} {usuario.apellido}</span>
                      </span>
                      <span className="font-bold text-indigo-700">{usuario.compras}</span>
                    </li>
                  ))}
              {usuarios && usuarios.length === 0 && (
                <li className="text-gray-500">No hay usuarios para mostrar.</li>
              )}
            </ul>
          </div>

          {/* Card Stock de Vinos */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col text-sm">
            <h2 className="flex text-xl font-bold text-indigo-800 mb-4 text-left">Stock de Vinos</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={
                    vinos
                      ? [...vinos]
                          .sort((a, b) => b.stock - a.stock)
                          .map(v => ({ nombre: v.nombre, stock: v.stock }))
                      : []
                  }
                  margin={{ top: 0, right: 0, left: -100, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    width={220}
                    tick={{ fontSize: 9 }}
                    interval={0}
                  />
                  <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="stock" fill="#6366f1" radius={[4, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card Pedidos Pendientes */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col col-span-1 md:col-span-2 xl:col-span-1"
               style={{ maxHeight: '400px', minHeight: '400px', overflowY: 'auto' }}>
            <h2 className="text-xl font-bold text-indigo-800 mb-4">Pedidos Pendientes</h2>
            {pedidosPendientes.length === 0 ? (
              <div className="text-gray-400 text-center">No hay pedidos pendientes.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pedidosPendientes.map(pedido => (
                  <li key={pedido.pedido_id} className="py-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Pedido #{pedido.pedido_id}</span>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold">Pendiente</span>
                    </div>
                    <div className="text-sm text-gray-600">Fecha: {pedido.fecha_pedido}</div>
                    <div className="text-sm text-gray-600">Total: <span className="font-bold text-indigo-700">${pedido.total}</span></div>
                    <div className="text-xs text-gray-500">
                      Productos: {pedido.productos.map(p => `${p.vino_nombre} (x${p.cantidad})`).join(', ')}
                    </div>
                    <button
                      className="mt-2 self-end bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-semibold"
                      onClick={() => window.location.href = `/pedidos/view/${pedido.pedido_id}`}
                    >
                      Ver detalles
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Card Ventas por Mes */}
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col text-sm col-span-1 md:col-span-2 xl:col-span-2" style={{ maxHeight: '400px', minHeight: '400px' }}>
            <h2 className="text-xl font-bold text-indigo-800 mb-3">
              Ventas por Mes - {anioActual}
            </h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataVentasMes}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="ventas" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {pedidosEntregados.length === 0 && (
              <div className="text-center text-gray-400 mt-2">No hay ventas registradas este año.</div>
            )}
          </div>

          {/* Card Ranking de Productos Favoritos */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col text-sm col-span-1 md:col-span-2 xl:col-span-1">
            <h2 className="text-xl font-bold text-indigo-800 mb-4">Ranking de Productos Favoritos</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={rankingFavoritos}
                  margin={{ top: 0, right: 0, left: -100, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    width={220}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="favoritos" fill="#f59e42" radius={[4, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {rankingFavoritos.length === 0 && (
              <div className="text-center text-gray-400 mt-4">No hay favoritos registrados.</div>
            )}
          </div>

          {/* Card Resumen General */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-indigo-800 mb-6">Resumen General</h2>
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Usuarios registrados:</span>
                <span className="text-2xl font-extrabold text-indigo-700">{usuarios ? usuarios.length : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Vinos registrados:</span>
                <span className="text-2xl font-extrabold text-indigo-700">{vinos ? vinos.length : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Stock total:</span>
                <span className="text-2xl font-extrabold text-indigo-700">
                  {vinos ? vinos.reduce((acc, v) => acc + (v.stock || 0), 0) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Ventas realizadas:</span>
                <span className="text-2xl font-extrabold text-indigo-700">
                  {pedidosEntregados ? pedidosEntregados.length : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Principal;