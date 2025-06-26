import { useEffect, useState } from "react";
import axios from "axios";

const useFavoritos = (API_URL, token) => {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const response = await axios.get(`${API_URL}/favoritosAdmin`, {
                    headers: {
                        Authorization: token,
                    },
                });
                setFavoritos(response.data);
            } catch (err) {
                console.error("Error al obtener favoritos:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritos();
    }, [API_URL, token]);

    return { favoritos, loading, error };
}

export default useFavoritos;
