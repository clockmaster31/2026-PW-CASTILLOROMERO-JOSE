/* las validaciones para este formulario se realizaran mediante el uso de expresiones regulares las cuales vamos a dividir en 3, 1 texto 2 boleta (numerica) 3 patron para la fecha  
 */ 
// buscar mozila (firefox) para las expresiones regulares
//estas son patrones que nos ayudan a validar cadenas bajo ciertas condiciones, 

const patrones = {
    nombre: /^[A-Za-zÁÉÍÓÚÑñáéíóúa\s]{2.60}$/,
    boleta: /^\d{10}$/,
    fecha: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
}
const mensajes = {
    nombre : "solo letras y espacios, entre 2 y 60 caracteres",
    boleta : "Debe tener exactamente 10 digitos",
    fecha : "La fecha debe tener el formato DD/MM/AAAA"

}
function validarCampo(campo,valor){
    return patrones[campo].test(valor.trim());
}

// para validar el formulario tenemos que ocupar los principios de obtencion y manipulacion de los elementos deL DOM(literal cada pagina (lo que interactua))

if(typeof document!== 'undefined') {
    const formulario =
    document.getElementById('formulario-registro');

    formulario.addEventListener('submit', (evento) => {

        evento.preventDefault(); //evito que se envie en automatico


        for(const campo of Object.keys(patrones)){ // keys son los intefecadores 

            const input = document.getElementById(campo);
            const errorSpan = document.getElementById('error -${campo}');

        }

        const esValido = validarCampo(campo, input.value);

        input.classList.toggle ('invalido',!esValido);
        spanError.textContent = esValido ? '' : mensajes[campo];
        if(!esValido) formularioValido = false;


        const mensajeExito = document.getElementById(mensajeExito);
        mensajeExito.textContent = formularioValido ? 'Registro exitoso' :  '';
    });
}