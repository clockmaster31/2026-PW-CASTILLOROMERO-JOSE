const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexBoleta = /^20[2-3]\d(0[1-9]|1[0-5])\d{4}$/;
const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{2,99}$/;

function validarNombre(nombre) {
    return typeof nombre === "string" && regexNombre.test(nombre.trim())
}

function validarCorreo(correo) {
    if (typeof correo !== "string") return false
    const c = correo.trim()
    return c.length <= 254 && regexEmail.test(c)
}

function validarBoleta(boleta) {
    return typeof boleta === "string" && regexBoleta.test(boleta.trim())
}

function validarContrasena(contrasena) {
    return (
        typeof contrasena === "string" &&
        contrasena.length >= 8 &&
        contrasena.length <= 72 &&
        /[A-Za-z]/.test(contrasena) &&
        /\d/.test(contrasena)
    )
}

module.exports = { validarNombre, validarBoleta, validarContrasena, validarCorreo }