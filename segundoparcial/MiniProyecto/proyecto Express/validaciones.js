//tarea 2 de las 3 funciones para validar

function validarBoleta(){

}

function validarCorreo(){

}

function validarContrasena(){
    if (typeof contrasena !== 'string') return false;
    return contrasena >= 8
}

module.exports={validarBoleta, validarContrasena, validarCorreo};

//tarea: