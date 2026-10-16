const pool = require('../bd-local');

//llama base
//objeto usuario

const COLUMNAS_PUBLICAS = 'id,nombre, correo, boleta rol';

//consultar a todos         //llamamos base    //que jala               //donde   y por cual 
async function listar() {
    const[filas] =await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`);

    return filas;
    
}

//obtener por id 

async function obtenerPorId() {
    const[filas] =await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id= ?`);

    return filas[0];
    
}

//REGISTRAR 

async function crear({nombre, correo, contrasenaHash, boleta, rol}) {
    const [info] = await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena_hash), (?, ?, ?, ?, ?)`, [nombre, correo, contrasenaHash, boleta, rol || 'alumno']
    );

    return obtenerPorId(info.insertId);


    
}

async function actualizar(id, {nombre, correo, rol}) {

    const cambios = Object.entries({nombre, correo, rol}).filter(([, valor])=> valor !== undefined);
    if(cambios.length ===0) return obtenerPorId(id);

    const columnas = cambios.map(([columna])=> `${columna} = ?`).join(', ');

    const [info] = await pool.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...cambios.map(([ , valor])=> valor), id]);


    // si lo encuentra

    if(info.affectedRows === 0) return undefined;
    return obtenerPorId(id);
    
  
}

// eliminar 

async function elimnarPorId(id) {
    const[filas] =await pool.query(`DELETE FROM usuarios WHERE id= ? `, [id]);

    return info.affectedRows > 0;
    
}

//buscar por correo hash

async function buscarPorCorreoConHash(correo) {
     const[filas] =await pool.query('SELECT* FROM usuarios WHERE correo = ?', [correo]);

    return filas[0];
    
    
}

//debemos crear los modelos de las tablas talleres y asistencia 
//taller tiene registrar alumno al taller, consultar todos los talleres, 
//asistencia tiene registrar asistencia, consultar asistencia del taller 
// dos archivvvos (talleres y asistencia_modelo)
//base en teams 

//oara hacer esto a una api hay que exportar


module.exports= {listar, obtenerPorId, crear, actualizar, elimnarPorId, buscarPorCorreoConHash}