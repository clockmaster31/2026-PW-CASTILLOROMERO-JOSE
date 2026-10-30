const AsistenciaModel = require('../Modelo/asistencia_modelo');
const { validarNombre, validarBoleta } = require('../validaciones');

async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body ?? {};
    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }
    if (!validarNombre(nombre_alumno)) {
        return res.status(400).json({ error: 'El nombre debe tener de 3 a 100 caracteres, solo letras y espacios' });
    }
    if (!validarBoleta(boleta)) {
        return res.status(400).json({ error: 'La boleta no es válida (10 dígitos, formato 20XX...)' });
    }

    try {
        const asistencia = await AsistenciaModel.registrarAsistencia({
            tallerId: taller_id,
            nombreAlumno: nombre_alumno.trim().replace(/\s+/g, ' '),
            boleta: boleta.trim()
        });
        res.status(201).json(asistencia);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Esa boleta ya está inscrita en este taller' });
        }
        res.status(500).json({ error: error.message });
    }
}

async function listarAsistenciasDeTaller(req, res) {
    try {
        const tallerId = req.params.id;
        const asistencias = await AsistenciaModel.consultarAsistenciasPorTaller(tallerId);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {registrarAsistencia, listarAsistenciasDeTaller};