// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
//genera una cokkie
const session = require('express-session');
//almacena cokkies 
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');

const NOMBRE_COOKIE = 'connect.sid';

// si es que hay una sesion, hay que extraer del allamcaen (del archivo temporal) si no, crearla

function todasLasSesiones(almacen){
  //aqui es resolve reject en vez de req y res
  //resolve la encuentra, reject la crea DIRECTAMENTE

  //aca la funcion, solo la crea o la extrae 
  return new Promise((resolve, reject) => {
const promesa = almacen.all((error, sesiones) => (error ? reject(error) : 
resolve(sesiones)));
if (promesa && typeof promesa.then === 'function') promesa.then(resolve,reject);

  });
 
}

//aqui empezamos a crear los datos para la sesion y cookie 

function crearApp(config, pool){
  const app = express();
  app.use(express.json());
  //obtener modelo de la bd
  const usuarios = crearModeloUsuario(pool);

  //aqui demedos identificar la sesion sera por tabla en bd o la sesion solo sera una cookie del navegador.
  //  o es una mezcla de memoria del servisor y por una tabla de bd y cookie en navegador y en bd 
  //depende que tanto te quiera complicar la vida con esto 
  

}

