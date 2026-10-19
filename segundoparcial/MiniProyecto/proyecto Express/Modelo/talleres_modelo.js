const pool = require('../bd-local');

const COLUMNAS_TALLERES = 'id, nombre, instructor, fecha, cupo';

//listar todos los talleres

async function listar_taller() {
    const[filas] =await pool.query(`SELECT ${COLUMNAS_TALLERES} FROM talleres ORDER BY id`);

    return filas;
    
}
async function listar_alumno() {
    const[filas] =await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`);

    return filas;
    
}

//agregar a taller 
//se pone el nombre del taller al cual se inscribe 
async function obtener_id_taller() {
    const[id_taller] = await pool.query(`SELECT id FROM talleres WHERE nombre = "?"`)

    return id_taller[0];
}
async function obtener_nombre_taller() {
    const[nombre_taller] = await pool.query(`SELECT nombre FROM talleres WHERE id = "?"`)

    return nombre_taller[0];
}

module.exports= {listar_alumno, listar_taller, obtener_id_taller, obtener_nombre_taller}



