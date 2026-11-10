// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
//genera una cokkie
const session = require('express-session');
//almacena cokkies 
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');
const { almacen } = require('./config');
const { config } = require('dotenv');

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
  // esto sire por mucho para la seguridad si alguien roba uan cuenta ej: (eres tu? en este dispositivo: )
// para esto se requiere almacen

//  existe ?sino crear en memoria y se crea en el local storage(server) ?           //conservar                     //para ver si xpira la sesion
const almacen = config.almacen ==='memoria' 
? new session.MemoryStore() 
: new MySQLStore({createDatabaseTable: false, clearExpired: false} , pool);
app.locals.almacen = almacen;
}

//si voy a crear sesiones 

app.use (
  session({ // lo que trae la cookie secret(token unico o para autenticar el usuario //depende del requerimiento )
    name : NOMBRE_COOKIE, secret : process.env.SESSION_SECRET || 'secreto-solo.para-la-demo',
    store : almacen,
    resave : false, // para ci cierras guarda lo que andabas haciendo
    //no se crea sesion ni la cookie
    saveUninitialized : false,
    //afuerza siempre
    // es extender la sesion 
    //como cuando estas en checkout y tiene tiempo de vida 
    rolling : config.rolling || false, 
    //parametros a manejar
    cookie : {
      maxAge : config.maxAge || 1000 * 60 * 60 *24, // un dia (en terminos de milisegundos a la sesion)
      httpOnly : config.httpOnly || true, //en que protocolo nos estamos manejando
      sameSite : config.sameSite || 'lax', // solo aqui(vacio/ no existe) o en todo el sitio(lax)
      secure : config.secure || false, //esto es solo para servidor, //pasando de http a https (como en local es false, pasar a true )

    }
  })
);

//solo por practica, realmente no se hace, no en produccion 

//visualizar el id de la sesion para compararla en la pantalla 

const corotrId = (id) => (id ? `${id.slice(0,8)}...` : null); // esto es para checar el id viendo sus 8 elementos 
//esto es lo que paso por php, que suando el id de cookie se puede aparentar que eres tu por medio de esta,
//  usualmente cifrado y programado, programar contraseña y validacion en bd para evitar lo que paso php




// nosotros estamos ocupando un middle ware el cual es el que se encarga de 
// comunicar el back y front, para ello debemos de obtener la sesion a partir de express,
// pero en cada una debemos de regresar la sesion  para ello rollingextiende y aunque sea false se tiene que
//  deconfiar de esta, identificar, validar en sus diferentes momentos 

function vencida(sesion){ // si y 
  const desde = config.rolling ? sesion.ultimoUso : sesion.creada;

  //regresa fecha actual, ver si aun es valida
  return Date.now() - desde > config.maxAge
}

//mandar 401 (ni idea de quien madres eres)

function requereSession(req, res, next){
  if(req.session.usuario && vencida(req.sesion)){
    return req.session.destroy(()=>{
      res.clearCookie(NOMBRE_COOKIE);
      res.status(401).json({error: '401, tu sesion ha expirado, vuelve a iniciar sesion'})
    });
  }
  //evitar que alguien se cuelge de una cuenta para abusar permisos admin
  if(!req.session.usuario){
    return res.status(401).json({error: '401 No has iniciado sesion con la cuenta correcta.'})
  }
  req.sesion.ultimoUso =Date.now();
  next();
  //el next es para pasar pasar al siguiente elemnto 

}



