const dcrypt = require('dcryptjs');

const usuariosModel = require('../Modelo/usuarios_modelo')

const {validarCorreo, validarBoleta, validarContrasena} = require('../validaciones');
//llamas el modulo de validaciones 

//aqui se pone el controlador 

function esDupiclado(error){
    return error.code ==='ER_DUP_ENTRY' || error.code === '23505';
}

async function listarUsuarios(req, res) {
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    } catch {
        res.status(500).json({error: error.message});
    }
    
}

//esto es lo que ce va a conectar al front 

async function obtenerUsuario(req, res) {
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'usuario no encontrado'});
        res.json(usuario);
    }catch(error){
        res.status(500).json({error: error.message});
    }
    
}

// para crear usuario

async function crearUsuario(req ,res) {

    const {nombre, correo, contrasena, boleta, rol} = req.body;

     if(!nombre || !correo || !contrasena||!boleta || !rol){
        return res.status(400).json({error: 'los campos nombre, correo, contraseña, boleta, rol son obligatorio '});
     }   
     if (!validarCorreo(correo)) return res.status(400).json({error: 'el correo no tiene un formato valido'});
     if (!validarBoleta(boleta)) return res.status(400).json({error: 'la boleta tiene que tener 10 digitos'});
     if (!validarContrasena(contrasena)) return res.status(400).json({error: ' la contraseña tiene que tener al menos 8 caracteres'});

     try {
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModel.crear({nombre, correo, contrasenaHash, boleta, rol});
        res.status(201).json(usuario);
     }catch{
        if(esDupiclado(error)) return res.status(400).json({error: 'ya existe un usario con el mismo correo o boleta registrado'});
        res.status(500).json({error: error.message});
     }


}

async function actualizarUsuario(req, res) {

    const {nombre, correo, rol} = req.body;

    if(nombre=== undefined && correo === undefined && rol === undefined){
        return res.status(400).json({error: 'Se debe de llenar al menos uno de los campos de nombre, correo, o rol para actualizar los datos '});
    }
    if(correo !== undefined &&  !validarCorreo(correo)){
        return res.status(400).json({error: 'El correo no tiene un formato valido'});
    }

    //llamamos la funcion de nombre ?? y correo 


    








    try{
        const usuario = await usuariosModel.actualizar(req.params.id, {nombre, correo, rol});
        if(!usuario) return res.status(404).json({error: 'usuario no enontrado'});
        res.json(usuario);
    } catch(error) {
        if(esDupiclado(error)) return res.status(400).json({error: 'Ya exsite un usuario con ese correo'});
        res.status(500).json({error: error.message});
    }
}

async function eliminarUsuario(req, res) {

    try{

        const eliminado = await usuariosModel.elimnarPorId(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'no se encontro el usuario'});
        res.status(204).send();
    }catch(error){
        res.status(500).json({error : error.message});
    }
    
}

module.exports = {listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario}