

const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];


function pintarTabla(){
    //debe de obtener la tabla y rellenarla con los datos de talleres
    const tbody = document.querySelector("#tabla-talleres tbody");
    tbody.innerHTML = "";
     listaTalleres.forEach((taller) => {
         const fila = document.createElement("tr");
         fila.innerHTML = `
      <td>${taller.nombre}</td>
      <td>${taller.instructor}</td>
      <td>${taller.cupo}</td>
      <td>${taller.inscritos}</td>
    `;
       tbody.appendChild(fila);
    });

}

const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (evento) =>{
    evento.preventDefault();
    const operacion = selectOperacionArreglo.value;

    let resultado;

    switch(operacion){
        case 'forEach':
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;
        
        case 'map' :
            resultado = talleres.map((t)=> t.nombre).join('\n');
            break;
        case'find':
         resultado = talleres.map((t)=>     `- ${t.instructor == "Ing. María López"}  `).join('\n');
         break;
        case 'filter':
        resultado = talleres.map((t) => t.inscritos >= t.cupo).join('\n');
        break;
    }



    resultadoArreglos.textContent = resultado;
});