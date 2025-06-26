// src/hooks/useSidebarAndAuth.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useSidebarAndAuth = (API_URL, token) => {
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        const handleStorage = () => {
            const saved = localStorage.getItem('sidebar-collapsed');
            setCollapsed(saved === 'true');
        };

        const handleSidebarEvent = (e) => {
            setCollapsed(e.detail);
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('sidebar-collapsed-changed', handleSidebarEvent);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('sidebar-collapsed-changed', handleSidebarEvent);
        };
    }, []);

    useEffect(() => {
        fetch(`${API_URL}/admins`, {
            headers: {
                Authorization: token,
            },
        }).then(res => {
            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
            }
        });
    }, [navigate, API_URL, token]);

    return { collapsed };
};

export default useSidebarAndAuth;
