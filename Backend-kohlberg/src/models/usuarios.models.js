import validator from "validator";

export const validateUserData = (data) => {
  const { nombre, apellido, username, telefono, direccion, email, password_hash, estado } = data;

  if (!nombre || !apellido || !username || !telefono || !direccion || !email || !password_hash) {
    return { valid: false, message: "Faltan datos obligatorios" };
  }

  if (!validator.isEmail(email)) {
    return { valid: false, message: "El correo electrónico no es válido" };
  }

  if (!/^[67]\d{7}$/.test(telefono + '')) {
    return { valid: false, message: "El número no es válido, verifique nuevamente.." };
  }

  if (!validator.isStrongPassword(password_hash, { minLength: 6 })) {
    return {
      valid: false,
      message: "La contraseña debe tener al menos 6 caracteres y contener letras, números y símbolos",
    };
  }

  return { valid: true };
};
