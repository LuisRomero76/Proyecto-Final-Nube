import { FaIdBadge, FaEnvelope, FaEdit } from "react-icons/fa";
import { FaEye, FaPen } from "react-icons/fa6";

const CardPerfil = ({
  admin,
  API_URL,
  handlePerfilClick,
  showMenu,
  setShowMenu,
  menuRef,
}) => (
  <div className="flex flex-col md:flex-row items-center gap-8 mb-8 relative">
    <div className="relative" ref={menuRef}>
      <div
        className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-6xl font-bold shadow-lg border-4 border-white cursor-pointer group"
        onClick={e => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        title="Opciones de imagen de perfil"
      >
        {admin.perfil ? (
          <img
            src={`${API_URL}/assets/vinos/${admin.perfil}`}
            className="w-full h-full object-cover rounded-full"
            alt="Perfil"
          />
        ) : (
          <span>{admin.nombre?.charAt(0) || "A"}</span>
        )}
        <span className="absolute bottom-2 right-2 bg-indigo-700 border-2 border-white w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-110 transition">
          <FaEdit className="text-white text-lg" />
        </span>
      </div>
      {/* Menú contextual */}
      {showMenu && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[110%] bg-[#23272f] text-white rounded-xl shadow-xl py-2 min-w-[220px] border border-gray-700 z-50 animate-fade-in">
          <div
            className="flex items-center gap-3 px-5 py-3 hover:bg-[#31343b] cursor-pointer transition text-base rounded-lg"
            onClick={() => {
              handlePerfilClick("ver");
              setShowMenu(false);
            }}
          >
            <FaEye className="w-5 h-5" />
            <span>Ver foto de perfil</span>
          </div>
          <div
            className="flex items-center gap-3 px-5 py-3 hover:bg-[#31343b] cursor-pointer transition text-base rounded-lg"
            onClick={() => {
              handlePerfilClick("editar");
              setShowMenu(false);
            }}
          >
            <FaPen className="w-5 h-5" />
            <span>Editar foto de perfil</span>
          </div>
        </div>
      )}
    </div>
    <div className="flex-1">
      <div className="text-3xl font-bold text-indigo-900 mb-1">{admin.nombre} {admin.apellido}</div>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <FaIdBadge /> <span className="font-mono text-sm">{admin.nombre_usuario}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <FaEnvelope /> <span>{admin.email}</span>
      </div>
    </div>
  </div>
);

export default CardPerfil;