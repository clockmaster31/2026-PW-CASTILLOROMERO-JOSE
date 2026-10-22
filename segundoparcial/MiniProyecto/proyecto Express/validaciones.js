//tarea 2 de las 3 funciones para validar

function validarCorreo(correo){
    if(typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

function validarBoleta(boleta){
    if(typeof boleta !== 'string' && typeof boleta !== 'number') return false;
    return /^\d{10}$/.test(String(boleta));
}

function validarContrasena(contrasena){
    if(typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}
//tarea: