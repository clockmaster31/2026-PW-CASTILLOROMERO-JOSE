const asistenciaModel = require('../Modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    const {usuario_id, taller_id, fecha} = req.body;
    if(!usuario_id || !taller_id){
        return res.status(400).json({error: 'usuario_id y taller_id son obligatorios'});
    }
    try{
        const asistencia = await asistenciaModel.registrarAsistencia({usuario_id, taller_id, fecha});
        res.status(201).json(asistencia);
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error: 'La asistencia de ese día ya está registrada'});
        if(error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).json({error: 'Alumno o taller no encontrado'});
        res.status(500).json({error: error.message});
    }
}

async function consultarAsistenciaTaller(req, res) {
    try{
        const asistencia = await asistenciaModel.consultarAsistenciaTaller(req.params.id);
        res.json(asistencia);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function consultarAsistenciaAlumno(req, res) {
    try{
        const asistencia = await asistenciaModel.consultarAsistenciaAlumno(req.params.id);
        res.json(asistencia);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function eliminarAsistencia(req, res) {
    try{
        const eliminado = await asistenciaModel.eliminarAsistencia(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'No se encontro la asistencia'});
        res.status(204).send();
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

module.exports = {registrarAsistencia, consultarAsistenciaTaller, consultarAsistenciaAlumno, eliminarAsistencia}
