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

// existen tokens fisicos(usb para acceder), unicos(), y doble autenticacion.
function requereRol(rol){
  return (req, res, next) =>{
    if(req.sesion.usuario.rol !== rol){
      return res.status(403).json({error: ` Eres ${req.session.usuario.usuario}, pero esta ruta es solo para ${rol}`});
        }
        next();
  };


}

//vamos a definir rutas de acceso para un usuario visitante, sin que inicie sesion 
//esto fuerza que se tiene que identificar 

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/visita',(req,res)=>{
  if(!req.sesion) return res.status(401).json({error: 'no tiene acceso'});

  //de ser asi y entra al idenfificarse, se genera un contador de cuantas veces entro
  req.sesion.visitas = (req.session.visitas || 0) + 1;
  //cada que visite se genera una visita
  res.json({visitas: req.sesion.visitas, sesion: idCorto(req.session.id)});


});

app.post('/api/login', async (req, res) => {
  try{
    const {usuario, contrasena} = req.body || {}; //vacio para pureba en postman
    //verificamos que el usuario y contrasena sean correctos, si no, regresamos 401
    const datos = await usuarios.verificar(usuario,contrasena);
    if(!datos) return res.status(401).json({error: 'Usuario o contrasena incorrecto o no encontrado... Intente otravez'});

    //checa si se ha visitados antes de lasesion
    const antes = req.sesion.visitas !== undefined ? idCorto(req.session.id) : null;
    const visitas = req.sesion.visitas || 0;

    //guardar los datos de la sesion

    const guardar = () => {
      //vamos a crear guardar para guardar los datos de la sesion 
      req.sesion.usuario = datos;
      req.sesion.visitas = visitas;
      req.sesion.creada = Date.now();
      req.sesion.ultimoUso = Date.now();

      //ahora si vanmos a guardar

      req.sesion.save((error) =>{
        if(error) return next(error);
        res.json({usuarios:datos, sesionAntes:antes, sesionDespues : idCorto(req.sesionID)});
      });


    };

    //para regenerar la sesion si se colapsa o algo como sis e
    if(config.regenerarAlEntrar){
      
      req.sesion.regenerate((error) => (error ? next(error) : guardar()));
      } else{
        guardar();
      }

  }catch(error){
    next(error);
  }

  });

//vamos a cerrar la sesion

app.post('/api/logout',(req, res, next) => {
  req.sesion.destroy((error) => {
    if(error) return next(error);
    res.clearCookie(NOMBRE_COOKIE);
    res.json({message: 'Session cerrada'});
  });
});

//verificar la sesion y iniciar sesion

app.get('/api/sesion', requiereSesion, (req,res)=>{
const desde = config.rolling ? req.sesion.ultimoUso : req.sesion.creada;
res.json({usuario: req.sesion.usuario, sesion : idCorto(req.sesionID),
  expiraEnSegundos : Math.round((desde + config.maxAge - Date.now())/1000),
});
});

//ver perfil 

app.get('/api/perfil', requiereSesion, (req,res)=>{
  req.sesion.visitas=(req.sesion.visitas || 0) + 1;
  res.json({message: `Hola ${req.sesion.usuario.nombre} rol: ${req.sesion.usuario.rol}, visitas: ${req.sesion.visitas}`});
  });

  // para pruebas unitarias vamos a poner lo que sigue estas madres para verificar 
  //verdadero o falso lo que se ejecuto 

  app.get('/api/diagnostico/sesiones', async(req,res,next)=>{
    try{
      const sesiones = await todasLasSesiones(almacen);
      const lista = Object.entries(sesiones || {}).map(([id, s])=>({
        sesion : idCorto(id), 
        esLaTuya : id=== req.sesionID,
        usuario : s.usuario ? s.usuario : 'Sin iniciar sesion',
        visitas: s.visitas || 0,
        expira: s.cookie && s.cookie.expires,

      }));
      res.json({almacen: config.almacen, sesiones : lista });

    } catch (error){
      next(error);
    }
  });


  app.use(express.static(path.join(__dirname, 'public')));

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({error: 'Error del servidor'});
  });

app.use('/api/', (req, res) => res.status(404).json({error: 'Ruta no encontrada'}));


return app;

module.exports = {crearApp, NOMBRE_COOKIE}

//TAREA, realizar INFOGRAFIA, sobre la autentificacion con el uso de jwt, como se implenta en js 




