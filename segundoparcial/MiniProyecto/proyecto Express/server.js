const express = require('express');

const app = express();

app.use(express.json());

const PORT = 4000;

//ejemplo de una peticion por medio de ruta principal GET 
//ruta principal(web)
//despues del/ es la direccion de la peticion
//req= request, res=response 
app.get('/saludo', (req, res) =>{
    res.json({mensaje:'hola, esto es una pueba en GET'})

});

//solicitud de tipo post (Cambio)
app.post('/eco', (req, res)=>{
    const {texto} = req.body;
    if(!texto){
        return res.status(400).json({Error:'El texto es obligatorio'});

        }

        res.status(201).json({eco:texto})
});

//levantar el servicio

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Registro de Asistencia - CECyT 9 funcionando correctamente",
  });
});

app.listen(PORT, () =>{
    console.log(`Sevidor escuchando en el puerto: ${PORT}`);
});

//PARA LLAMARLO VAS CTRL Ñ y npm nombre de este archivo