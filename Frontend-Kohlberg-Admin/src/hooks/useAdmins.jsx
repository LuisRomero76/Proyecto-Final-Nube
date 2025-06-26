import { useEffect, useState, useRef } from "react";
import axios from "axios";

// Función para decodificar el token JWT y extraer el id del admin
export function getAdminIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    return null;
  }
}

export function useAdmins(API_URL, token) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/admins`, {
        headers: { Authorization: token },
      });
      setAdmins(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudieron obtener los administradores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, [API_URL, token]);

  // Para refrescar la lista después de eliminar o actualizar
  const refreshAdmins = fetchAdmins;

  return { admins, loading, error, refreshAdmins };
}

export function useAdminsState(API_URL, token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAdminState = async (admin_id, estado) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        `${API_URL}/adminsState/${admin_id}`,
        { estado },
        { headers: { Authorization: token } }
      );
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al cambiar el estado del administrador"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateAdminState, loading, error };
}

export async function createAdmin(API_URL, token, form) {
  try {
        const response = await axios.post(`${API_URL}/admins`, form, {
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


// Hook para obtener datos del admin
export function useAdminPerfil(API_URL, token) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      const adminId = getAdminIdFromToken(token);
      if (!adminId) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/admins/${adminId}`, {
          headers: { Authorization: token },
        });
        setAdmin(res.data);
      } catch (err) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [API_URL, token]);

  return { admin, loading, setAdmin, setLoading };
}

export function usePerfilAdmin(API_URL, token) {
  const { admin, loading, setAdmin } = useAdminPerfil(API_URL, token);

  // Imagen de perfil
  const [modalPerfil, setModalPerfil] = useState(null); // null | "ver" | "editar"
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenError, setImagenError] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Menú contextual
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  // Cierra el menú contextual al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Manejar click en imagen de perfil
  const handlePerfilClick = (opcion) => {
    setModalPerfil(opcion);
    setShowMenu(false);
    setImagenError("");
    setNuevaImagen(null);
    setImagenPreview(null);
  };

  // Manejar selección de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImagenError("Solo se permiten archivos de imagen.");
      return;
    }
    setImagenError("");
    setNuevaImagen(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  // Subir imagen de perfil
  const handleSubirImagen = async (e) => {
    e.preventDefault();
    if (!nuevaImagen) {
      setImagenError("Selecciona una imagen.");
      return;
    }
    setSubiendoImagen(true);
    setImagenError("");
    try {
      const adminId = getAdminIdFromToken(token);
      const formData = new FormData();
      formData.append("perfil", nuevaImagen);

      const res = await axios.patch(
        `${API_URL}/admins/${adminId}/perfil`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAdmin((prev) => ({ ...prev, perfil: res.data.perfil }));
      setModalPerfil(null);
      setNuevaImagen(null);
      setImagenPreview(null);
    } catch (err) {
      setImagenError(
        err.response?.data?.message || "No se pudo actualizar la imagen."
      );
    } finally {
      setSubiendoImagen(false);
    }
  };

  // Contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Manejar cambio de contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordActual || !passwordNueva || !passwordConfirm) {
      setPasswordError("Completa todos los campos.");
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      setPasswordError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    setChangingPassword(true);
    try {
      const adminId = getAdminIdFromToken(token);
      await axios.patch(
        `${API_URL}/admins/${adminId}/password`,
        {
          password_actual: passwordActual,
          password_nueva: passwordNueva,
        },
        {
          headers: { Authorization: token },
        }
      );
      setPasswordSuccess("¡Contraseña actualizada correctamente!");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      setMostrarFormulario(false);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "No se pudo cambiar la contraseña. Verifica la contraseña actual."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Edición de información
  const [editInfoLoading, setEditInfoLoading] = useState(false);
  const [editInfoError, setEditInfoError] = useState("");

  const handleActualizarInfo = async (form) => {
    setEditInfoLoading(true);
    setEditInfoError("");
    try {
      const adminId = getAdminIdFromToken(token);
      const res = await axios.patch(
        `${API_URL}/admins/${adminId}`,
        form,
        { headers: { Authorization: token } }
      );
      setAdmin((prev) => ({ ...prev, ...res.data }));
      setModalPerfil(null);
    } catch (err) {
      setEditInfoError(
        err.response?.data?.message ||
        "No se pudo actualizar la información."
      );
    } finally {
      setEditInfoLoading(false);
    }
  };

  return {
    admin,
    loading,
    setAdmin,
    // Imagen de perfil
    modalPerfil,
    setModalPerfil,
    nuevaImagen,
    setNuevaImagen,
    imagenPreview,
    setImagenPreview,
    imagenError,
    setImagenError,
    subiendoImagen,
    handlePerfilClick,
    handleImagenChange,
    handleSubirImagen,
    showMenu,
    setShowMenu,
    menuRef,
    // Contraseña
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordActual,
    setPasswordActual,
    passwordNueva,
    setPasswordNueva,
    passwordConfirm,
    setPasswordConfirm,
    passwordError,
    setPasswordError,
    passwordSuccess,
    setPasswordSuccess,
    changingPassword,
    setChangingPassword,
    mostrarFormulario,
    setMostrarFormulario,
    handlePasswordChange,
    // Edición de información
    editInfoLoading,
    editInfoError,
    handleActualizarInfo,
  };
}