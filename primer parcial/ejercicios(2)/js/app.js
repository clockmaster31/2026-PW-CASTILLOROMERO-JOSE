

const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];


function pintarTabla(nombre, instructor, cupo, inscritos){
    //debe de obtener la tabla y rellenarla con los datos de talleres
     const tablaTalleres = document.getElementById("tabla-talleres").getElementsByTagName('tbody')[0];
    const nuevaFila = tablaTalleres.insertRow(-1);

    const celdaNombre = nuevaFila.insertCell(0);
    const celdaInstructor = nuevaFila.insertCell(1);
    const celdaCupo = nuevaFila.insertCell(2);
    const celdaInscritos = nuevaFila.insertCell(3);

    celdaNombre.textContent = nombre;
    celdaInstructor.textContent = instructor;
    celdaCupo.textContent = cupo;
    celdaInscritos.textContent = inscritos;
    
}

function borrarTabla() {
    const body = document.getElementById("tabla-talleres").getElementsByTagName('tbody')[0];
    body.innerHTML = "";
}


const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    borrarTabla();
    const operacion = selectOperacionArreglo.value;

    let resultado;

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            talleres.forEach(taller => {
                pintarTabla(taller.nombre, taller.instructor, taller.cupo, taller.inscritos);
            });
            break;
        case 'map' :
             talleres.map((t)=> pintarTabla(t.nombre, "","",""));
            resultado = talleres.map((t) => t.nombre);
            break;
        case'find':
         const busqueda = talleres.find(taller => taller.instructor === 'Ing. María López')
            pintarTabla(busqueda.nombre,busqueda.instructor,busqueda.cupo,busqueda.inscritos);
            resultado = busqueda.nombre;
            break;
        case 'filter':
         const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
            llenos.forEach(taller =>{pintarTabla(taller.nombre,taller.instructor, taller.cupo,taller.inscritos)});
            resultado = llenos.map((t)=> t.nombre);
            break;
    }



    resultadoArreglos.textContent = resultado;
});

// segunda parte 

const formularioobjeto = document.getElementById('formulario-objeto');
const resultadoobjeto = document.getElementById('resultado-objeto');

    formularioobjeto.addEventListener('submit', (evento) => {
        evento.preventDefault();
       

        const taller = {

    nombre : document.getElementById('obj-nombre').value,
    instructor : document.getElementById('obj-instructor').value,
    cupo : Number(document.getElementById('obj-cupo').value),
    inscritos : Number(document.getElementById('obj-inscritos').value)
     };

     const operacion = document.getElementById('operacion-objeto1').value;
     alert(operacion); 
     let resultado;

     switch(operacion){
        //alert(operacion);

        case 'keys':    
            resultado=JSON.stringify(Object.keys(taller));
             alert(12);
            break;
        case 'values':
            resultado=JSON.stringify(Object.values(taller));
            break;
        case 'entries':
            resultado= Object.entries(taller).map(([campo, valor]) => `${campo}: ${valor}`).join('\n');
            break;
        case 'stringify':
            const textoJsonstring = JSON.stringify(taller, null, 2);
            resultado = [ '', textoJsonstring ].join('\n');
            break;
        case 'roundTrip':
            const textoJson = JSON.stringify(taller, null, 2);
            const objetoDeVuelta = JSON.parse(textoJson);

            resultado   = [
                '',
                textoJson,
                '',
                `tipo: ${typeof objetoDeVuelta}`,
                objetoDeVuelta.nombre
            ].join('\n');

            break;

            default:
                alert("no hay nada");
            break;
     }

     

     resultadoobjeto.textContent = resultado;
});
