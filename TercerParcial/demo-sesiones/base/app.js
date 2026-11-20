
const path = require('path');
const express = require('express');

//genera una cookie
const session = require('express-session');

//almacena cookies
const MySQLStore = require('express-mysql-session')(session);

const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const {crearMModeloTokens} = require('./modelos/tokens.modelo');

const NOMBRE_COOKIE = 'connect.sid';



// si es que hay una sesion, hay que extraer del almacen
// (del archivo temporal) si no, crearla

//aqui es resolve reject en vez de req y res
//resolve la encuentra, reject la crea DIRECTAMENTE

//aca la funcion, solo la crea o la extrae
function todasLasSesiones(almacen) {
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) =>
      (error ? reject(error) : resolve(sesiones))
    );

    if (promesa && typeof promesa.then === 'function') {
      promesa.then(resolve, reject);
    }
  });
}

//aqui empezamos a crear los datos para la sesion y cookie

function crearApp(config, pool) {

  const app = express();

  app.use(express.json());

  //obtener modelo de la bd
  const usuarios = crearModeloUsuarios(pool);

  //aqui debemos identificar la sesion sera por tabla en bd
  // o la sesion solo sera una cookie del navegador.
  // o es una mezcla de memoria del servidor y por una tabla de bd
  // y cookie en navegador y en bd
  //depende que tanto te quieras complicar la vida con esto
  // esto sirve mucho para la seguridad si alguien roba una cuenta
  // ej: (eres tu? en este dispositivo: )
  // para esto se requiere almacen

  // existe? sino crear en memoria y se crea en el local storage(server)?
  // conservar y para ver si expira la sesion

  const almacen = config.almacen === 'memoria'
    ? new session.MemoryStore()
    : new MySQLStore(
        {
          createDatabaseTable: false,
          clearExpired: false
        },
        pool
      );

  app.locals.almacen = almacen;

  //si voy a crear sesiones

  app.use(
    session({
      // lo que trae la cookie secret(token unico o para autenticar el usuario)
      // depende del requerimiento

      name: NOMBRE_COOKIE,

      secret: process.env.SESSION_SECRET || 'secreto-solo.para-la-demo',

      store: almacen,

      resave: false, // para si ci cierras guarda lo que andabas haciendo

      //no se crea sesion ni la cookie
      saveUninitialized: false,

      //afuerza siempre
      // es extender la sesion
      // es como cuando estas en checkout y tiene tiempo de vida
      rolling: config.rolling || false,

      //parametros a manejar
      cookie: {
        // Se utiliza maxAgeMs porque es el nombre definido en config.js.
        maxAge: config.maxAgeMs ?? 1000 * 60 * 60 * 24,
        // un dia (en terminos de milisegundos a la sesion)

        httpOnly: config.httpOnly ?? true,
        //en que protocolo nos estamos manejando

        sameSite: config.sameSite || 'lax',
        // solo aqui(vacio/no existe) o en todo el sitio(lax)

        secure: config.secure || false
        //esto es solo para servidor,
        //pasando de http a https
        //(como en local es false, pasar a true)
      }
    })
  );

  //solo por practica, realmente no se hace, no en produccion

  //visualizar el id de la sesion para compararla en la pantalla

  const idCorto = (id) => (id ? `${id.slice(0, 8)}...` : null);

  //esto es para checar el id viendo sus 8 elementos
  //esto es lo que paso por php, que usando el id de cookie
  //se puede aparentar que eres tu por medio de esta,
  //usualmente cifrado y programado, programar contraseña
  //y validacion en bd para evitar lo que paso php

  // nosotros estamos ocupando un middleware el cual se encarga de
  // comunicar el back y front, para ello debemos de regresar la sesion
  // para ello rolling extiende y aunque sea false se tiene que
  // desconfiar de esta, identificar, validar en sus diferentes momentos

  function vencida(sesion) {
    const desde = config.rolling
      ? sesion.ultimoUso
      : sesion.creada;

    const maxAge = config.maxAgeMs ?? 1000 * 60 * 60 * 24;

    return !desde || Date.now() - desde > maxAge;
  }

  //mandar 401 (ni idea de quien madres eres)

  function requiereSession(req, res, next) {

    if (req.session.usuario && vencida(req.session)) {
      return req.session.destroy(() => {
        res.clearCookie(NOMBRE_COOKIE);

        res.status(401).json({
          error: '401, tu sesion ha expirado, vuelve a iniciar sesion'
        });
      });
    }

    //evitar que alguien se cuelgue de una cuenta para abusar permisos admin

    if (!req.session.usuario) {
      return res.status(401).json({
        error: '401 No has iniciado sesion con la cuenta correcta.'
      });
    }

    req.session.ultimoUso = Date.now();

    next();

    //el next es para pasar al siguiente elemento
  }

  // existen tokens fisicos(usb para acceder), unicos(), y doble autenticacion.

  function requiereRol(rol) {
    return (req, res, next) => {

      if (req.session.usuario.rol !== rol) {
        return res.status(403).json({
          error: `Eres ${req.session.usuario.usuario}, pero esta ruta es solo para ${rol}`
        });
      }

      next();
    };
  }

  //vamos a definir rutas de acceso para un usuario visitante,
  //sin que inicie sesion
  //esto fuerza que se tiene que identificar

  app.get('/api/config', (req, res) => {
    res.json(config);
  });

  app.post('/api/visita', (req, res) => {

    if (!req.session) {
      return res.status(401).json({ error: 'no tiene acceso' });
    }

    //de ser asi y entra al identificarse,
    //se genera un contador de cuantas veces entro

    req.session.visitas = (req.session.visitas || 0) + 1;

    //cada que visite se genera una visita

    res.json({
      visitas: req.session.visitas,
      sesion: idCorto(req.sessionID)
    });
  });

  app.post('/api/login', async (req, res, next) => {

    try {

      const { usuario, contrasena } = req.body || {};
      //vacio para prueba en postman

      //verificamos si usuario y contrasena son correctos
      const datos = await usuarios.verificar(usuario, contrasena);

      if (!datos) {
        return res.status(401).json({
          error: 'Usuario o contrasena incorrecto o no encontrado... Intente otra vez'
        });
      }

      //checa si se ha visitado antes de la sesion

      const antes = req.session.visitas !== undefined
        ? idCorto(req.sessionID)
        : null;

      const visitas = req.session.visitas || 0;

      //guardar los datos de la sesion

      const guardar = () => {

        //vamos a crear guardar para guardar los datos de la sesion

        req.session.usuario = datos;
        req.session.visitas = visitas;
        req.session.creada = Date.now();
        req.session.ultimoUso = Date.now();

        //ahora si vamos a guardar

        req.session.save((error) => {

          if (error) return next(error);

          res.json({
            usuario: datos,
            sesionAntes: antes,
            sesionDespues: idCorto(req.sessionID)
          });

        });

      };

      //para regenerar la sesion si se colapsa o algo
      //como si se intenta iniciar sesion

      if (config.regenerarAlEntrar) {

        req.session.regenerate((error) =>
          (error ? next(error) : guardar())
        );

      } else {

        guardar();

      }

    } catch (error) {

      next(error);

    }

  });

  //vamos a cerrar la sesion

  app.post('/api/logout', (req, res, next) => {

    req.session.destroy((error) => {

      if (error) return next(error);

      res.clearCookie(NOMBRE_COOKIE);

      res.json({ message: 'Session cerrada' });

    });

  });

  //verificar la sesion e iniciar sesion

  app.get('/api/sesion', requiereSession, (req, res) => {

    const desde = config.rolling
      ? req.session.ultimoUso
      : req.session.creada;

    res.json({
      usuario: req.session.usuario,
      sesion: idCorto(req.sessionID),

      expiraEnSegundos: Math.round(
        (desde + (config.maxAgeMs ?? 1000 * 60 * 60 * 24) - Date.now()) / 1000
      )
    });

  });

  //ver perfil

  app.get('/api/perfil', requiereSession, (req, res) => {

    req.session.visitas = (req.session.visitas || 0) + 1;

    res.json({
      mensaje: `Hola ${req.session.usuario.nombre}`,
      rol: req.session.usuario.rol,
      visitas: req.session.visitas
    });

  });

  // Ruta exclusiva para administradores.
  // Primero comprueba que haya iniciado sesion y despues verifica su rol.

  app.get(
    '/api/admin/reporte',
    requiereSession,
    requiereRol('admin'),
    (req, res) => {
      res.json({
        mensaje: 'Acceso autorizado al reporte',
        usuario: req.session.usuario.usuario,
        rol: req.session.usuario.rol
      });
    }
  );

  // para pruebas unitarias vamos a poner lo que sigue
  // estas madres para verificar verdadero o falso lo que se ejecuto

  app.get('/api/diagnostico/sesiones', async (req, res, next) => {

    try {

      const sesiones = await todasLasSesiones(almacen);

      const lista = Object.entries(sesiones || {}).map(([id, s]) => ({

        sesion: idCorto(id),

        esLaTuya: id === req.sessionID,

        usuario: s.usuario ? s.usuario : 'Sin iniciar sesion',

        visitas: s.visitas || 0,

        expira: s.cookie && s.cookie.expires

      }));

      res.json({
        almacen: config.almacen,
        sesiones: lista
      });

    } catch (error) {

      next(error);

    }

  });

  app.use(express.static(path.join(__dirname, 'public')));

  app.use((error, req, res, next) => {

    console.error(error);

    res.status(500).json({ error: 'Error del servidor' });

  });

  app.use('/api/', (req, res) =>
    res.status(404).json({ error: 'Ruta no encontrada' })
  );


  //implementar jwt 

  const SECRETO_JWT = config.jwtSecreto || process.env.jwtSecreto||'secreto-jwt-solo-para-esta-demo';

  //vamos a crear una funcion para verrificar que el token sea autentico sino hace kaboom 

  function firmarToken(usuario){
    return jwt.sign(
      {
        //payload, lo que se va a firmar, lo que se va a cifrar
        sub : String(usuario.id),
        usuario : usuario.usuario,
        nombre : usuario.nombre,
        rol: usuario.rol
      },SECRETO_JWT,{
        //ALGORITMO PARA CIFRAR
        algorithm : 'HS256',
        expiresIn : config.jwtExpiraSeg, //5 minutos
        jwtid : crypto.randomUUID() //identificador unico del token
      }
    );
  }


  //HACER UNA FUNCION PARa validar quien requiere o no un token dentro de la app (visitas, admin usuario ) por medio de middleware 

  
  async function requiereJWT(req, res, next){
    const encabezado = req.headers.autorization || '';
    if(!encabezado.startWith('Bearer ')){
      return res.status(401).json({error : 'falta un token asociado'});
    }
    const token = encabezado.slice('Bearer '.length);

    let datos;
    try{
      datos = jwt.verify(token,SECRETO_JWT, {algorithms : ['HS256']});
    } catch(error){
      if (error === 'TokenExpiredError'){
        return res.status(401).json({error : '401 token Expirado, porfavor renuevelo'});
      }
      return res.status(401).json({
        error : '401 Token Invalido'
      });
    }

    try{
      if(config.jwtRevocar && (await token.estaRevocado(datos.jti))){
        return res.status(401).json({error: 'token revocado'});

        }
      }catch(error){
        return next(error);
      }
      req.jwt = datos;
      next();
  }

    //vamos a ser de que no sea del rol
  //403 valido pero no del rol

  function requiereRolJWT(rol){
    return (req, res, next) =>{
      if(req.jwt.rol !== rol){
        return res.status(403).json({error: `Eres ${req.jwt.usuario} pero esta ruta solo accede ${rol}`});
        }
        next();
      };
    
    }

    app.post('/api/jwt/login', async(req,res, next)=>{
      try{
  const {usuario, contrasena} = req.body || {};
  const datos = await usuario.verificar(usuario, contrasena);
  if(!datos) return res.status(401).json({error: 'usuario ocontraseña incorrectos'});
  res.json({token: firmarToken(datos), usuario : datos});
} catch(error){
  next(error);
}
    });


    app.get('/api/jwt/perfil', requiereJWT, (req, res, next)=>{
      res.json({
        mensaje: `hola ${req.jwt.nombre}`,
        rol: req.jwt.rol,
        expiraEnSegundos : Math.max(0, req.jwt.exp - Math.floor(Date.now()/1000)),
        }
      );
      });


      //ruta para admin

      app.get('/api/jwt/admin/reporte', requiereJWT, requiereRol('admin'), (req, res) =>{
        res.json({reporte: 'talleres :3'});
        });

      app.post('/api/jwt/refresh', requiereJWT, (req,res) =>{
        const {sub, usuario, rol} = req.jwtM
        res.json({token : firmarToken({ id: sub, usuario, nombre, rol})});
        });


      app.post('/api/jwt/logout', requiereJWT, async(req, res, next)=>{
        try{
          if(config.jwtRevocar){
            await tokens.revocar(req.jwt.jti, req.jwt.usuario, req.jwt.exp);
            return res.json({mensaje: 'token revocado en el servidor, se registra en la lista negra'});
          }
          res.json({mensaje: 'el server no guarda nada'});
        } catch(error){
          next(error);
        }});

  return app;

}

module.exports = { crearApp, NOMBRE_COOKIE };

//tarea 2, con el uso del archivo que se nos va a proveer,
//completar y realizar pruebas al ejercicio de sesiones
//en el archivo llamado (xxxx)(front) para implementear
//en el archivo demo.js se evaluara la siguiente clase.


