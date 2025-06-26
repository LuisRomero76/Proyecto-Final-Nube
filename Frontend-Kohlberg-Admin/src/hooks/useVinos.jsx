// src/hooks/useVinos.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const useVinos = (API_URL, token) => {
    const [vinos, setVinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/vinosAdmin`, {
            headers: {
                Authorization: token,
            }
        })
        .then(res => {
            setVinos(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al obtener productos:", err);
            setError(err);
            setLoading(false);
        });
    }, [API_URL, token]);

    return { vinos, loading, error };
};

const viewVino = async (API_URL, token, id) => {
    try {
        const response = await axios.get(`${API_URL}/vinosAdmin/${id}`, {
            headers: {
                Authorization: token,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener vino:", error);
        throw error;
    }
}

const createVino = async (API_URL, token, vinoData) => {
    try {
        const response = await axios.post(`${API_URL}/vinosAdmin`, vinoData, {
            headers: {
                Authorization: token,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear vino:", error);
        throw error;
    }
}

const deleteVino = async (API_URL, token, id) => {
    try {
        const response = await axios.delete(`${API_URL}/vinosAdmin/${id}`, {
            headers: {
                Authorization: token,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al eliminar vino:", error);
        throw error;
    }
}

const updateVino = async (API_URL, token, id, vinoData, isFormData = false) => {
    try {
        const response = await axios.put(
            `${API_URL}/vinosAdmin/${id}`,
            vinoData,
            {
                headers: {
                    Authorization: token,
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al actualizar vino:", error);
        throw error;
    }
};

export default useVinos;
export { createVino, deleteVino, updateVino, viewVino };
