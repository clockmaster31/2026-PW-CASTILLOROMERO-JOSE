const mysql = require('mysql2/promise');
//instalar dependencia npm install mysql2


const pool = mysql.createPool({
    host:'localhost',
    port:3306,
    user:'root',
    password:'MJ15JE31',//arreglado
    database:'cecyt9_local',
    dateStrings:true,
});

module.exports = pool;