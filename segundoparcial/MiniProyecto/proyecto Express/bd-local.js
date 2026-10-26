const mysql = require('mysql2/promise');
//instalar dependencia npm install mysql2

/**
 * La base de datos local la usaremos para verificar pruebas internas, se buscaran que deben de crear cada uno una cuenta en supabase.com y generaremos una api para podenr conectarnos a un servicio de bd en la nube, para ello debemos configurar el archivo. env 
 */
// al hacer un pool hace una conexion en cache 
const pool = mysql.createPool({
    host:'localhost',
    port:3306,
    user:'root',
    password:'MJ15JE31',//arreglado
    database:'cecyt9_local',
    dateStrings:true,
});