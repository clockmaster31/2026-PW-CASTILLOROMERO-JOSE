// La página solo hace fetch a la API. El navegador manda la cookie solo (misma página, mismo servidor).

const $ = (id) => document.getElementById(id);

//Esta es una sola funcion que habla con la API para que no se repita el fetch en cada boton. Siempre regresa {status, datos} ya que fetch no marca error con 401 o 403
//Solo mando Content-Type cuando hay cuerpo, porque sin él express.json() no lee el body del login.
// No uso credentials: 'include' porque la página y la API están en el mismo servidor y el navegador manda la cookie solo.
async function llamar(metodo,url,body)
{
    const options={method: metodo,headers:{}};

    if(body!==undefined){
        options.headers['Content-Type']='application/json';
        options.body=JSON.stringify(body);
    }
    const respuesta=await fetch(url,options);

    let datos=null;

    try{
        datos=await respuesta.json();
    }catch{
        datos=null;
    }
    return {status:respuesta.status,datos};
}

//En esta funcion separo la elección del color para que la bitácora muestre de un vistazo si fue éxito, 401, 403 u otro error,
//usando las clases que ya existen en estilos.css.
function claseDelCodigo(status){
    if(status>=200&&status<300)return 'ok';
    if(status===401)return 'e401';
    if(status===403)return 'e403';
    return 'error';
}

//En esta funcion creo los elementos con createElement y textContent (no innerHTML) porque los datos vienen del servidor
//y podrían traer código; con innerHTML se ejecutaría  y podría robar la cookie si no fuera httpOnly.
//Uso prepend para que la respuesta más nueva quede arriba.
function anotar(method,url,status,datos){
    const li=document.createElement('li');

    const codigo=document.createElement('span');
    codigo.className=`codigo ${claseDelCodigo(status)}`;
    codigo.textContent=status;

    const ruta=document.createElement('span');
    
    ruta.textContent=`${method} ${url}`;

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(datos, null, 2);

    li.append(codigo, ruta, pre);

    $('bitacora').prepend(li);
}

//Esta funcion le pregunta al servidor quién soy porque mi JS no puede saberlo por sí mismo ya que la cookie es httpOnly.
//Muestro document.cookie para comprobar que, aunque haya sesión, JavaScript no ve la cookie.
async function refrescarEstado() {
    const { status, datos } = await llamar('GET', '/api/sesion');
  const estado = $('estado');

  if (status === 200) {
    const u = datos.usuario;
    estado.textContent = `Con sesión: ${u.nombre} (rol: ${u.rol}) · sesión ${datos.sesion} · vence en ${datos.expiraEnSegundos} s`;
    estado.className = 'estado con-sesion';
  } else {
    estado.textContent = `Sin sesión (el servidor responde ${status})`;
    estado.className = 'estado sin-sesion';
  }

  $('cookie-js').textContent = document.cookie || '(vacío)';
    
}

//Esta funcion la necesito porque si no hay sesiones o algo falla, pongo un mensaje que ocupa toda la fila de la tabla.
function filaUnica(tbody,texto){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.colSpan = 4;
    td.textContent = texto;
    tr.append(td);
    tbody.append(tr);
}

//Esta funcion muestra lo que el servidor tiene guardado para comparar mi cookie con las sesiones reales.
//Vacío el tbody antes de llenarlo para que las filas no se dupliquen al actualizar.
//Convierto expira a hora local porque el servidor la manda en UTC.
async function refrescarTabla() {
  const { status, datos } = await llamar('GET', '/api/diagnostico/sesiones');
  const tbody = $('tabla-sesiones');

  tbody.replaceChildren();

  if (status !== 200 || !datos) {
    $('donde').textContent = `No se pudo leer el diagnóstico (código ${status})`;
    filaUnica(tbody, '(sin datos)');
    return;
  }

  if (datos.almacen === 'memoria') {
    $('donde').textContent = 'En la MEMORIA del servidor (se pierden al reiniciar)';
  } else {
    $('donde').textContent = 'En MySQL, tabla sessions (sobreviven a un reinicio)';
  }

  if (datos.sesiones.length === 0) {
    filaUnica(tbody, '(sin sesiones)');
    return;
  }

  for (const s of datos.sesiones) {
    const tr = document.createElement('tr');

    if (s.esLaTuya) {
      tr.className = 'tuya';
    }

    let vence = '—';
    if (s.expira) {
      vence = new Date(s.expira).toLocaleTimeString();
    }

    let textoSesion = s.sesion;
    if (s.esLaTuya) {
      textoSesion = `${s.sesion} (la tuya)`;
    }

    const valores = [textoSesion, s.usuario, s.visitas, vence];

    for (const valor of valores) {
      const td = document.createElement('td');
      td.textContent = valor;
      tr.append(td);
    }

    tbody.append(tr);
  }
}

//Esta funcion junta estado y tabla porque después de cada acción de los botones hay que actualizar los dos, así no repito las dos llamadas en cada evento.
async function refrescarTodo() {
  await refrescarEstado();
  await refrescarTabla();
}

// Uso preventDefault para evitar que el formulario recargue la página, así hago el login con fetch y no pierdo la bitácora.
$('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const cuerpo = {
    usuario: $('usuario').value,
    contrasena: $('contrasena').value,
  };

  const { status, datos } = await llamar('POST', '/api/login', cuerpo);
  anotar('POST', '/api/login', status, datos);
  await refrescarTodo();
});

//Al cambiar de usuario pongo su contraseña de ejemplo para no escribirla a mano en cada prueba.
$('usuario').addEventListener('change', () => {
  $('contrasena').value = `${$('usuario').value}12345`;
});

//En lugar de un addEventListener por botón, recorro todos los que tienen data-url y leo método y URL con dataset, 
// así si se agrega otro botón en el HTML.
document.querySelectorAll('button[data-url]').forEach((boton) => {
  boton.addEventListener('click', async () => {
    const metodo = boton.dataset.metodo;
    const url = boton.dataset.url;

    const { status, datos } = await llamar(metodo, url);
    anotar(metodo, url, status, datos);
    await refrescarTodo();
  });
});

//Paso la función sin paréntesis para que se ejecute en cada clic y no una sola vez al cargar.
$('btn-refrescar').addEventListener('click', refrescarTodo);
$('btn-sesiones').addEventListener('click', refrescarTabla);

//Con esta funcion al abrir la página muestro la configuración y el estado sin esperar un clic.
//Como el <script> está al final del <body> y los elementos ya existen.
async function iniciar() {
    const{datos}=await llamar('GET','/api/config');
    $('config').textContent = JSON.stringify(datos, null, 2);

  await refrescarTodo();
}

iniciar();
    