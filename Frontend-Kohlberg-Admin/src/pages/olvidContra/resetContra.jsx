import { useState, useRef } from "react";
import logo from "../../assets/logo.svg";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function ResetContra() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutos
  const timerRef = useRef();
  const [nuevaContra, setNuevaContra] = useState("");
  const [repetirContra, setRepetirContra] = useState("");
  const navigate = useNavigate();

  // Temporizador
  const startTimer = () => {
    setTimer(300);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStep(1);
          setError("El código ha expirado. Solicita uno nuevo.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Paso 1: Solicitar código
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/admins/solicitar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        startTimer();
      } else {
        setError(data.message || "No se pudo enviar el código");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Paso 2: Verificar código
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/admins/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();
      if (res.ok && data.admin_id) {
        setAdminId(data.admin_id);
        setStep(3);
        clearInterval(timerRef.current);
      } else {
        setError(data.message || "Código incorrecto");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Paso 3: Cambiar contraseña
  const handleCambiarContra = async (e) => {
    e.preventDefault();
    setError("");
    if (nuevaContra.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaContra !== repetirContra) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admins/reset-contra/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordAdmin: nuevaContra }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(4);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(data.message || "No se pudo cambiar la contraseña");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  // Formato de temporizador mm:ss
  const formatTimer = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-100 to-purple-200">
      <form
        onSubmit={
          step === 1
            ? handleSolicitarCodigo
            : step === 2
            ? handleVerificarCodigo
            : handleCambiarContra
        }
        className="relative bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center border border-white/30"
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full shadow-lg">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
            <img src={logo} className="w-23 h-23 object-cover scale-105" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 drop-shadow-lg">
          Recuperar contraseña
        </h2>
        {step === 1 && (
          <>
            <input
              className="w-full mb-6 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-blue-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all"
              type="submit"
            >
              Enviar código
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="w-full flex justify-between items-center mb-4">
              <span className="text-gray-700 text-sm">
                Ingresa el código enviado a tu email
              </span>
              <span className="text-indigo-700 font-bold text-sm">
                {formatTimer(timer)}
              </span>
            </div>
            <input
              className="w-full mb-6 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-purple-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg tracking-widest text-center font-mono"
              type="text"
              name="codigo"
              placeholder="Código de 4 dígitos"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              maxLength={4}
              minLength={4}
              pattern="\d{4}"
            />
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all"
              type="submit"
            >
              Verificar código
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <input
              className="w-full mb-4 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-purple-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg"
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaContra}
              onChange={(e) => setNuevaContra(e.target.value)}
              required
            />
            <input
              className="w-full mb-6 px-5 py-3 border-none rounded-xl shadow focus:ring-4 focus:ring-purple-300 transition-all bg-gray-100/80 placeholder-gray-500 text-lg"
              type="password"
              placeholder="Repetir contraseña"
              value={repetirContra}
              onChange={(e) => setRepetirContra(e.target.value)}
              required
            />
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all"
              type="submit"
            >
              Cambiar contraseña
            </button>
          </>
        )}
        {step === 4 && (
          <div className="w-full mt-6 text-center text-green-700 font-bold text-lg">
            ¡Contraseña cambiada correctamente!
            <br />
            Redirigiendo al login...
          </div>
        )}
        {error && (
          <div className="w-full mt-4 flex items-center justify-center">
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow text-sm font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
              {error}
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

export default ResetContra;