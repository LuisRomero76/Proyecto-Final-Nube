import validator from "validator";

export const validateAdminData = (data) => {
  const { nombre, apellido, direccion, sexo, cargo,  email, passwordAdmin, telefono, nombre_usuario } = data;

  if (!nombre || !apellido || !direccion || !sexo || !nombre_usuario || !telefono || !email || !passwordAdmin) {
    return { valid: false, message: "Faltan datos obligatorios" };
  }

  if (!validator.isEmail(email)) {
    return { valid: false, message: "El correo electrónico no es válido" };
  }

  if (!/^[67]\d{7}$/.test(telefono + '')) {
    return { valid: false, message: "El número no es válido, verifique nuevamente.." };
  }

  if (!validator.isStrongPassword(passwordAdmin, { minLength: 6 })) {
    return {
      valid: false,
      message: "La contraseña debe tener al menos 6 caracteres y contener letras, números y símbolos",
    };
  }

  return { valid: true };
};
