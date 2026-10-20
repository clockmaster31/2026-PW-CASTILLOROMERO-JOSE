//tarea 2 de las 3 funciones para validar

function validarBoleta(){
if(typeof boleta !== 'string') return false;
const numeros_permitidos = [1,2,3,4,5,6,7,8,9,0];
return boleta.includes(numeros_permitidos) = 10;
}

function validarCorreo(){
if(typeof correo !== 'string') return false;
return correo.includes("@");
}

function validarContrasena(){
    if (typeof contrasena !== 'string') return false;
    return contrasena >= 8;
}

module.exports={validarBoleta, validarContrasena, validarCorreo};

//tarea: