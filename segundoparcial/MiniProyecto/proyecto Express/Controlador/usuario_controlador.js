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