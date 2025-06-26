import { useState } from 'react';
import logo from '../../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function Login( onLogin) {

    const [email, setemail] = useState("");
    const [passwordAdmin, setpasswordAdmin] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const hadleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
          const res = await fetch(`${API_URL}/login-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, passwordAdmin }),
          });
          const data = await res.json();
          if (res.ok && data.token) {
            localStorage.setItem("token", data.token); // Guarda el token
            navigate("/principal"); // Redirige a la página de administración
            
          } else {
            setError(data.message);
          }
        } catch (err) {
            console.error("Error de conexión:", err);
          setError("Error de conexión");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-100 to-purple-200">
            <form onSubmit={hadleSubmit} className="relative bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center border border-white/30">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full shadow-lg">
                    <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
                        <img src={logo} className="w-23 h-23 object-cover scale-105"/>
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 drop-shadow-lg">Bienvenido</h2>
                <input
                    className="w-full mb-5 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-blue-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg"
                    type="text"
                    placeholder="Email"
                    onChange={(e) => setemail(e.target.value)}
                    required
                />
                <input
                    className="w-full mb-7 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-purple-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg"
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) => setpasswordAdmin(e.target.value)}
                    required
                />
                <button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all"
                    type="submit"
                >
                    Entrar
                </button>
                {error && (
                    <div className="w-full mt-4 flex items-center justify-center">
                        <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                            </svg>
                            {error}
                        </span>
                    </div>
                )}
                <div className="mt-6 flex justify-between w-full text-sm text-gray-500">
                    <a href="/resetContra" className="hover:underline transition-colors hover:text-blue-700">¿Olvidaste tu contraseña?</a>
                </div>
            </form>
        </div>
    )
}

export default Login;