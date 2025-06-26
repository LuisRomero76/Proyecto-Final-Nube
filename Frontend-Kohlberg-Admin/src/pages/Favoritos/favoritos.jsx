import MenuLateral from "../../components/menu_lateral/menu";
import useSidebarAndAuth from "../../hooks/useSidebarAndAuth";
import useFavoritos from "../../hooks/useFavoritos";
import useUsuarios from "../../hooks/useUsuarios";
import useVinos from "../../hooks/useVinos";

const Favoritos = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const { collapsed } = useSidebarAndAuth(API_URL, token);

    // Hooks para obtener datos
    const { favoritos } = useFavoritos(API_URL, token);
    const { usuarios } = useUsuarios(API_URL, token);
    const { vinos } = useVinos(API_URL, token);

    // Relacionar usuarios con sus favoritos
    const usuariosConFavoritos = usuarios.map(usuario => {
        const favoritosUsuario = favoritos
            .filter(fav => fav.persona_id === usuario.persona_id)
            .map(fav => {
                const vino = vinos.find(v => v.vino_id === fav.vino_id);
                return vino ? vino : null;
            })
            .filter(Boolean);
        return {
            ...usuario,
            favoritos: favoritosUsuario
        };
    });

    return (
        <div className="flex">
            <MenuLateral />
            <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Vista de Favoritos</h1>
                <table className="min-w-full bg-white rounded-2xl shadow-xl border border-gray-200">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-6 py-4 text-left text-gray-900 font-bold">Persona</th>
                            <th className="px-6 py-4 text-left text-gray-900 font-bold">Productos favoritos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosConFavoritos.map(usuario => (
                            <tr key={usuario.persona_id} className="hover:bg-gray-100 transition">
                                <td className="px-6 py-4 font-semibold text-gray-800">
                                    {usuario.nombre} {usuario.apellido}
                                </td>
                                <td className="px-6 py-4">
                                    {usuario.favoritos.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {usuario.favoritos.map(vino => (
                                                <div
                                                    key={vino.vino_id}
                                                    className="flex items-center gap-2 bg-indigo-100 border border-indigo-300 rounded-full px-3 py-1 shadow text-indigo-800"
                                                >
                                                    <img
                                                        src={`${API_URL}/assets/vinos/${vino.imagen_url}`}
                                                        alt={vino.nombre}
                                                        className="w-8 h-8 object-cover rounded-full border"
                                                    />
                                                    <span className="font-medium">{vino.nombre}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Sin favoritos</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default Favoritos;