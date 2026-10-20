const dcrypt = require('dcryptjs');

const asistenciaModel= require ('../Modelo/asistencias_modelo');

function esDupiclado(error){
    return error.code ==='ER_DUP_ENTRY' || error.code === '23505';
}

async function registrarasistencia(req,res) {

    const registrar = await asistenciaModel.introducir_asistencia;
    // no se que haecr aca siendo sincero
    
}

async function consultarasistencia(req, res) {

    try{
    const consultar = await asistenciaModel.cupo_taller_id(req);
    res.json(consultar);
    }   catch {
        res.status(500).json({error: error.message});
    }

    
}

