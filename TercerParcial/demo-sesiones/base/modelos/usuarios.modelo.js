
// Consultas a la tabla usuarios. Siempre con ? (consulta parametrizada),
// nunca pegando texto en el SQL.
const bcrypt = require('bcryptjs');

function crearModeloUsuarios(pool) {
  // Regresa el usuario (sin el hash) si la contraseña es correcta,
  // o null si no existe o la contraseña es incorrecta.
  async function verificar(usuario, contrasena) {
    // Buscar al usuario en la base de datos.
    const [filas] = await pool.query(
      `SELECT id, usuario, nombre, rol, contrasena_hash
       FROM usuarios
       WHERE usuario = ?
       LIMIT 1`,
      [usuario]
    );

    // Comprobar si existe el usuario.
    if (filas.length === 0) {
      return null;
    }

    const encontrado = filas[0];

    // Comparar la contraseña ingresada con el hash de MySQL.
    const contraseñaCorrecta = await bcrypt.compare(
      contrasena,
      encontrado.contrasena_hash
    );

    // Si la contraseña no coincide, rechazar el acceso.
    if (!contraseñaCorrecta) {
      return null;
    }

    // Devolver los datos sin incluir la contraseña ni su hash.
    return {
      id: encontrado.id,
      usuario: encontrado.usuario,
      nombre: encontrado.nombre,
      rol: encontrado.rol
    };
  }

  return { verificar };
}

module.exports = { crearModeloUsuarios };