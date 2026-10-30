// Reglas de validación de los datos de un usuario. Son las mismas que valida el backend y las que
// Pruebas de Software prueba con Jest: el front valida para avisar rápido a quien llena el
// formulario; el backend valida para que nadie se las salte mandando la petición con Postman.

export function validarNombre(nombre) {
  if (typeof nombre !== 'string') return false;
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{2,99}$/.test(nombre.trim());
}

export function validarCorreo(correo) {
  if (typeof correo !== 'string') return false;
  const c = correo.trim();
  return c.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
}

export function validarBoleta(boleta) {
  if (typeof boleta !== 'string') return false;
  return /^20[2-3]\d(0[1-9]|1[0-5])\d{4}$/.test(boleta.trim());
}

export function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string') return false;
  return (
    contrasena.length >= 8 &&
    contrasena.length <= 72 &&
    /[A-Za-z]/.test(contrasena) &&
    /\d/.test(contrasena)
  );
}

export function validarRegistro({ nombre, correo, boleta, contrasena, confirmar }) {
  const errores = {};
  if (!validarNombre(nombre)) {
    errores.nombre = 'Escribe tu nombre completo (3 a 100 caracteres, solo letras y espacios).';
  }
  if (!validarCorreo(correo)) {
    errores.correo = 'El correo no tiene un formato válido.';
  }
  if (!validarBoleta(boleta)) {
    errores.boleta = 'La boleta no es válida (10 dígitos, por ejemplo 2024010123).';
  }
  if (!validarContrasena(contrasena)) {
    errores.contrasena = 'La contraseña debe tener de 8 a 72 caracteres, con al menos una letra y un número.';
  }
  if (confirmar !== contrasena) {
    errores.confirmar = 'Las contraseñas no coinciden.';
  }
  return errores;
}