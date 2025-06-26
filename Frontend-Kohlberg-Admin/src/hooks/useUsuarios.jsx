// src/hooks/useUsuarios.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const useUsuarios = (API_URL, token) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/usuariosAdmin`, {
            headers: {
                Authorization: token,
            }
        })
        .then(res => {
            setUsuarios(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al obtener usuarios:", err);
            setError(err);
            setLoading(false);
        });
    }, [API_URL, token]);

    return { usuarios, loading, error };
};

const useUsuario = (API_URL, token, id) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("No user ID provided");
            return;
        }
        axios.get(`${API_URL}/usuariosAdmin/${id}`, {
            headers: {
                Authorization: token,
            }
        })
        .then(res => {
            setUsuario(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al obtener usuario:", err);
            setError(err);
            setLoading(false);
        });
    }, [API_URL, token, id]);

    return { usuario, loading, error };
}

const createUsuario = async (API_URL, token, usuarioData) => {
    try {
        const response = await axios.post(`${API_URL}/usuariosAdmin`, usuarioData, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch (error) {
        console.error("Error al crear usuario:", error);
        throw error;
    }
}

const patchUsuario = async (API_URL, token, id, fields) => {
    try {
        const response = await axios.patch(
            `${API_URL}/usuariosAdmin/${id}`,
            fields,
            {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al actualizar parcialmente el usuario:", error);
        throw error;
    }
};

const updateUsuario = async (API_URL, token, id, usuarioData) => {
    try {
        const response = await axios.put(`${API_URL}/usuariosAdmin/${id}`, usuarioData, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw error;
    }
}

const useDeleteUsuarios = (API_URL, token, id) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("No user ID provided");
            return;
        }
        setLoading(true);
        axios.delete(`${API_URL}/usuariosAdmin/${id}`, {
            headers: {
                Authorization: token,
            }
        })
        window.location.reload()
        .then(res => {
            setUsuarios([]); // After deletion, user list should be empty or refetch if needed
            setLoading(false);
        })
        .catch(err => {
            console.error("Error al eliminar usuario:", err);
            setError(err);
            setLoading(false);
        });
    }, [API_URL, token, id]);

    return { usuarios, loading, error };
};


export default useUsuarios;
export { useUsuarios, useUsuario, useDeleteUsuarios, createUsuario, patchUsuario, updateUsuario };
