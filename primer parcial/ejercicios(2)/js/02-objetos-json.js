// 02-objetos-json.js
// Object.keys/values/entries y JSON.stringify/parse. Completa cada TODO.

const taller = {
  nombre: 'Introducción a Python',
  instructor: 'Ing. María López',
  cupo: 25,
  inscritos: 25,
};

// TODO: Object.keys — imprime solo los nombres de las propiedades de `taller`
//obtiene los atributos de un objeto 
console.log('Manejo de keys');
console.log(Object.keys(taller));

// TODO: Object.values — imprime solo los valores
console.log('Manejo de valores segun objeto');
console.log(Object.values(taller));
// TODO: Object.entries — recorre con for..of e imprime "campo: valor" de cada propiedad
console.log('Manejo de propiedades de un objeto');
for(const [Campo, valor] of Object.entries(taller)){
console.log( `${Campo}: ${valor}`);
}

// TODO: JSON.stringify — convierte `taller` a texto (guárdalo en `textoJson`) e imprímelo

console.log('transformasion de json a una cadena')
const textoJson = JSON.stringify(taller, null, 2);
console.log (textoJson);
console.log('Tipos: ', typeof textoJson);

// TODO: JSON.parse — convierte `textoJson` de vuelta a objeto (guárdalo en `objetoDeVuelta`)

console.log('ahora de json a objeto')
const objetoDeVuelta = JSON.parse(textoJson);
console.log('tipo: ', typeof objetoDeVuelta);
console.log(objetoDeVuelta.nombre);
//       e imprime `objetoDeVuelta.nombre`
