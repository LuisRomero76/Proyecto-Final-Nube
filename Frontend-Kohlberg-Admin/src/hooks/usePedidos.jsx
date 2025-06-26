import { useState, useEffect } from "react";
import axios from "axios";

const usePedidos = (API_URL, token) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/pedidosAdmin`, {
            headers: { Authorization: token }
        })
        .then(res => {
            setPedidos(res.data);
            setLoading(false);
        })
        .catch(err => {
            setError(err);
            setLoading(false);
        });
    }, [API_URL, token]);

    return { pedidos, loading, error };
};

const usePedido = (API_URL, token, id) => {
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get(`${API_URL}/pedidosAdmin/${id}`, {
                headers: { Authorization: token }
            })
            .then(res => {
                setPedido(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
        }
    }, [API_URL, token, id]);

    return { pedido, loading, error };
}

export default usePedidos;
export { usePedido };