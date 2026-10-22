const pool = require('../bd-local');

const COLUMNAS_TALLER = 'id, nombre, descripcion, cupo';

//consultar todos los talleres
async function listarTalleres() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_TALLER} FROM talleres ORDER BY id`);
    return filas;
}

//obtener taller por id
async function obtenerTallerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_TALLER} FROM talleres WHERE id = ?`, [id]);
    return filas[0];
}

//crear taller
async function crearTaller({nombre, descripcion, cupo}) {
    const [info] = await pool.query(
        'INSERT INTO talleres (nombre, descripcion, cupo) VALUES (?, ?, ?)', [nombre, descripcion ?? null, cupo ?? null]
    );
    return obtenerTallerPorId(info.insertId);
}

//actualizar taller
async function actualizarTaller(id, {nombre, descripcion, cupo}) {
    const cambios = Object.entries({nombre, descripcion, cupo}).filter(([, valor]) => valor !== undefined);
    if(cambios.length === 0) return obtenerTallerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');

    const [info] = await pool.query(`UPDATE talleres SET ${columnas} WHERE id = ?`, [...cambios.map(([, valor]) => valor), id]);
    if(info.affectedRows === 0) return undefined;
    return obtenerTallerPorId(id);
}

//eliminar taller
async function eliminarTaller(id) {
    const [info] = await pool.query('DELETE FROM talleres WHERE id = ?', [id]);
    return info.affectedRows > 0;
}

//registrar alumno al taller
async function registrarAlumno({usuario_id, taller_id}) {
    const [info] = await pool.query(
        'INSERT INTO taller_alumnos (usuario_id, taller_id) VALUES (?, ?)', [usuario_id, taller_id]
    );
    return {id: info.insertId, usuario_id, taller_id};
}

//consultar alumnos inscritos en un taller
async function listarAlumnosTaller(taller_id) {
    const [filas] = await pool.query(`
        SELECT u.id, u.nombre, u.correo, u.boleta
        FROM taller_alumnos ta
        JOIN usuarios u ON u.id = ta.usuario_id
        WHERE ta.taller_id = ?
        ORDER BY u.nombre`, [taller_id]);
    return filas;
}

module.exports = {listarTalleres, obtenerTallerPorId, crearTaller, actualizarTaller, eliminarTaller, registrarAlumno, listarAlumnosTaller}



