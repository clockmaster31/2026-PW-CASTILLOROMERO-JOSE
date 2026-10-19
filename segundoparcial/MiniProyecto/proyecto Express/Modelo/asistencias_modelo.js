const pool = require('../bd-local');
const { listar } = require('./usuarios_modelo');

async function cupo_taller_id() {
    const[cupo] =await pool.query(`SELECT cupo FROM talleres WHERE id = "?"`);

    return cupo[0];
}

async function introducir_asistencia({id, taller_id, nombre_alumno, boleta}) {
    const [info] = await pool.query(
            `INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta), (?, ?, ?, ?, ?)`, [id, taller_id, nombre_alumno, boleta]
        );
    
        return listar(info.insertId);
    
}
module.exports= {cupo_taller_id, introducir_asistencia}