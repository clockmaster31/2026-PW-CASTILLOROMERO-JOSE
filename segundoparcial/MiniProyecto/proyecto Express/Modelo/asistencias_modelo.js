const pool = require('../bd-local');

//registrar asistencia
async function registrarAsistencia({usuario_id, taller_id, fecha}) {
    const [info] = await pool.query(
        'INSERT INTO asistencia (usuario_id, taller_id, fecha) VALUES (?, ?, COALESCE(?, CURDATE()))',
        [usuario_id, taller_id, fecha || null]
    );
    const [filas] = await pool.query('SELECT * FROM asistencia WHERE id = ?', [info.insertId]);
    return filas[0];
}

//consultar asistencia de un taller
async function consultarAsistenciaTaller(taller_id) {
    const [filas] = await pool.query(`
        SELECT a.id, a.fecha, u.id AS usuario_id, u.nombre, u.boleta
        FROM asistencia a
        JOIN usuarios u ON u.id = a.usuario_id
        WHERE a.taller_id = ?
        ORDER BY a.fecha DESC, u.nombre`, [taller_id]);
    return filas;
}

//consultar asistencia de un alumno
async function consultarAsistenciaAlumno(usuario_id) {
    const [filas] = await pool.query(`
        SELECT a.id, a.fecha, t.id AS taller_id, t.nombre AS taller
        FROM asistencia a
        JOIN talleres t ON t.id = a.taller_id
        WHERE a.usuario_id = ?
        ORDER BY a.fecha DESC, t.nombre`, [usuario_id]);
    return filas;
}

//eliminar asistencia
async function eliminarAsistencia(id) {
    const [info] = await pool.query('DELETE FROM asistencia WHERE id = ?', [id]);
    return info.affectedRows > 0;
}

module.exports = {registrarAsistencia, consultarAsistenciaTaller, consultarAsistenciaAlumno, eliminarAsistencia}