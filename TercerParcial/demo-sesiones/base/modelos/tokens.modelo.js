function crearModeloTokens(pool) {

    //necesitamos una funcion que se encargue de poder insertar dentro de la base los revocados
    //para evitar su uso

    async function revocar(jti, usuario, exp){
        await pool.query(
            'INSERT INTO tokens_revokados (jti, usuario, expira) VALUES (?, ?, FROM_UNIXTIME(?))', [jti, usuario, exp]
        );

    }

    //una funcion para verificar si el token esta revocado 

    async function estaRevocado(jti){
        const [filas] = await pool.query(
            'SELECT 1 FROM tokens_revokados WHERE jti = ?',[String(jti || '')]
        );

        return filas.length > 0;

    }
    
    //una funcion parar poder consultar todos los tokens baneados

    async function listar(){

        const [filas] = await pool.query('SELECT jti, usuario, expira, revocado_en FROM tokens_revocados ORDER BY revocado_en DESC, jti');
        return filas;
    };

    return { revocar, estaRevocado, listar };


}

module.exports={ crearModeloTokens };
