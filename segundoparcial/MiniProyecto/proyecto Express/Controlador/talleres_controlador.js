const talleresModel = require('../Modelo/talleres_modelo');

async function listarTalleres(req, res) {
    try{
        const talleres = await talleresModel.listarTalleres();
        res.json(talleres);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function obtenerTaller(req, res) {
    try{
        const taller = await talleresModel.obtenerTallerPorId(req.params.id);
        if(!taller) return res.status(404).json({error: 'Taller no encontrado'});
        res.json(taller);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function crearTaller(req, res) {
    const {nombre, descripcion, cupo} = req.body;
    if(!nombre){
        return res.status(400).json({error: 'El nombre del taller es obligatorio'});
    }
    if(cupo !== undefined && (!Number.isInteger(cupo) || cupo <= 0)){
        return res.status(400).json({error: 'El cupo debe ser un número entero mayor a 0'});
    }
    try{
        const taller = await talleresModel.crearTaller({nombre, descripcion, cupo});
        res.status(201).json(taller);
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error: 'Ya existe un taller con ese nombre'});
        res.status(500).json({error: error.message});
    }
}

async function actualizarTaller(req, res) {
    const {nombre, descripcion, cupo} = req.body;
    if(nombre === undefined && descripcion === undefined && cupo === undefined){
        return res.status(400).json({error: 'Se debe de llenar al menos uno de los campos nombre, descripcion o cupo'});
    }
    if(cupo !== undefined && (!Number.isInteger(cupo) || cupo <= 0)){
        return res.status(400).json({error: 'El cupo debe ser un número entero mayor a 0'});
    }
    try{
        const taller = await talleresModel.actualizarTaller(req.params.id, {nombre, descripcion, cupo});
        if(!taller) return res.status(404).json({error: 'Taller no encontrado'});
        res.json(taller);
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error: 'Ya existe un taller con ese nombre'});
        res.status(500).json({error: error.message});
    }
}

async function eliminarTaller(req, res) {
    try{
        const eliminado = await talleresModel.eliminarTaller(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'No se encontro el taller'});
        res.status(204).send();
    }catch(error){
        if(error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({error: 'El taller tiene alumnos o asistencias registradas'});
        res.status(500).json({error: error.message});
    }
}

async function registrarAlumno(req, res) {
    const {usuario_id, taller_id} = req.body;
    if(!usuario_id || !taller_id){
        return res.status(400).json({error: 'usuario_id y taller_id son obligatorios'});
    }
    try{
        const inscripcion = await talleresModel.registrarAlumno({usuario_id, taller_id});
        res.status(201).json(inscripcion);
    }catch(error){
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error: 'El alumno ya está inscrito en este taller'});
        if(error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).json({error: 'Alumno o taller no encontrado'});
        res.status(500).json({error: error.message});
    }
}

async function listarAlumnosTaller(req, res) {
    try{
        const taller = await talleresModel.obtenerTallerPorId(req.params.id);
        if(!taller) return res.status(404).json({error: 'Taller no encontrado'});
        const alumnos = await talleresModel.listarAlumnosTaller(req.params.id);
        res.json(alumnos);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

module.exports = {listarTalleres, obtenerTaller, crearTaller, actualizarTaller, eliminarTaller, registrarAlumno, listarAlumnosTaller}

