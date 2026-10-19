const dcrypt = require('dcryptjs');

const talleresModel = require('../Modelo/talleres_modelo');

function esDupiclado(error){
    return error.code ==='ER_DUP_ENTRY' || error.code === '23505';
}

async function listar_taller(req, res) {
    
    try{
        const talleres = await talleresModel.listar_taller;
        res.json(talleres);
    } catch {
        res.status(500).json({error: error.message});
    }
}

