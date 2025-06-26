import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images.png';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaHome, FaUsers, FaWineGlassAlt, FaShoppingCart, FaHeart, FaTags, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAdminPerfil } from '../../hooks/useAdmins';

const menuItems = [
  { label: 'Dashboard', path: '/principal' },
  { label: 'Usuarios', path: '/usuarios' },
  { label: 'Productos', path: '/productos' },
  { label: 'Pedidos', path: '/pedidos' },
  { label: 'Ventas', path: '/ventas' },
  { label: 'Administradores', path: '/administradores' },
  { label: 'Favoritos', path: '/favoritos' }
];

const MenuLateral = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  // Obtener datos del admin para mostrar foto y nombre
  const { admin } = useAdminPerfil(API_URL, token);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  const iconMap = {
    '/principal': <FaHome size={22} />,
    '/usuarios': <FaUsers size={22} />,
    '/productos': <FaWineGlassAlt size={22} />,
    '/pedidos': <FaShoppingCart size={22} />,
    '/favoritos': <FaHeart size={22} />,
    '/perfil': <FaUserCircle size={22} />,
    '/ventas': <FaTags size={22} />,
    '/administradores': <FaUsers size={22} />,
  };

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
    window.dispatchEvent(new CustomEvent('sidebar-collapsed-changed', { detail: collapsed }));
  }, [collapsed]);

  // Espacio lateral para el contenido principal
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.style.paddingLeft = collapsed ? '5rem' : '6rem';
    }
    return () => {
      if (main) main.style.paddingLeft = '';
    };
  }, [collapsed]);

  return (
    <>
      <aside
        className={`h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col shadow-2xl z-30 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-72'
        } border-r-2 border-indigo-700`}
        style={{ minWidth: collapsed ? '6rem' : '19rem' }}
      >
        {/* Logo y perfil admin */}
        <div className="p-4 flex flex-col items-center border-b border-indigo-700/40">
          {/* Logo */}
          <div className="w-full flex items-center justify-center mb-2">
            <img src={logo} className="w-12 h-12 object-cover rounded-full bg-white border-2 border-indigo-700 shadow" alt="Logo" />
          </div>
          {/* Perfil admin */}
          {!collapsed && admin && (
            <div className="w-full flex items-center gap-3 mt-2">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-700 bg-gray-100 flex items-center justify-center overflow-hidden">
                {admin.perfil ? (
                  <img
                    src={`${API_URL}/assets/vinos/${admin.perfil}`}
                    className="w-full h-full object-cover"
                    alt="Perfil"
                  />
                ) : (
                  <FaUserCircle size={38} className="text-indigo-700" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-indigo-100 leading-tight truncate">
                  {admin.nombre} {admin.apellido}
                </div>
                <button
                  className="mt-1 px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-xs rounded font-bold shadow transition"
                  onClick={() => navigate('/perfil')}
                >
                  Ver perfil
                </button>
              </div>
            </div>
          )}
          {/* Si está colapsado, solo el icono de perfil con tooltip */}
          {collapsed && (
            <div className="mt-2 flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full border-2 border-indigo-700 bg-gray-100 flex items-center justify-center overflow-hidden"
                title={admin ? `${admin.nombre} ${admin.apellido}` : "Perfil"}
                onClick={() => navigate('/perfil')}
                style={{ cursor: "pointer" }}
              >
                {admin && admin.perfil ? (
                  <img
                    src={`${API_URL}/assets/vinos/${admin.perfil}`}
                    className="w-full h-full object-cover"
                    alt="Perfil"
                  />
                ) : (
                  <FaUserCircle size={28} className="text-indigo-700" />
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Oculta "Administradores" si el usuario no es Administrador General
              if (
                item.label === "Administradores" &&
                (!admin || admin.cargo !== "Administrador General")
              ) {
                return null;
              }
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                      ${
                        location.pathname === item.path
                          ? 'bg-indigo-700/80 font-semibold shadow-lg'
                          : 'hover:bg-indigo-700/40'
                      }`}
                  >
                    <span className="flex-shrink-0">{iconMap[item.path]}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-700/40 mt-auto">
          <button
            className="w-full flex items-center gap-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl font-semibold transition-all justify-center shadow-lg"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={20} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
          {!collapsed && (
            <div className="mt-6 text-xs text-indigo-200 text-center opacity-70">
              &copy; {new Date().getFullYear()} Panel de Administración
            </div>
          )}
        </div>
        {/* Botón de colapsar/expandir */}
        <div className="absolute top-4 -right-4 z-30">
          <button
            className="bg-indigo-700 text-white p-2 rounded-full shadow-lg border-2 border-indigo-900"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <FaBars size={20} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default MenuLateral;