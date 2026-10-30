import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import { validarRegistro } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

const VACIO = { nombre: '', correo: '', boleta: '', contrasena: '', confirmar: '' };

export default function Registro() {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: '' }));
  }

  function revisarCampo(e) {
    const { name } = e.target;
    const error = validarRegistro(datos)[name] || '';
    setErrores((er) => ({ ...er, [name]: error }));
  }

  async function registrar(e) {
    e.preventDefault();
    setErrorServidor('');
    setExito('');

    const errs = validarRegistro(datos);
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    try {
      const usuario = await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: datos.nombre.trim().replace(/\s+/g, ' '),
          correo: datos.correo.trim().toLowerCase(),
          boleta: datos.boleta.trim(),
          contrasena: datos.contrasena,
        }),
      });
      setExito(`¡Listo! ${usuario.nombre} quedó registrado(a).`);
      setDatos(VACIO);
      setErrores({});
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <h1>Crear cuenta</h1>

      <form onSubmit={registrar} className="formulario" noValidate>
        <input
          name="nombre"
          placeholder="Nombre completo"
          autoComplete="name"
          maxLength={100}
          value={datos.nombre}
          onChange={cambiar}
          onBlur={revisarCampo}
        />
        {errores.nombre && <small className="error">{errores.nombre}</small>}

        <input
          name="correo"
          type="email"
          placeholder="Correo"
          autoComplete="email"
          maxLength={254}
          value={datos.correo}
          onChange={cambiar}
          onBlur={revisarCampo}
        />
        {errores.correo && <small className="error">{errores.correo}</small>}

        <input
          name="boleta"
          placeholder="Boleta (10 dígitos)"
          inputMode="numeric"
          maxLength={10}
          value={datos.boleta}
          onChange={cambiar}
          onBlur={revisarCampo}
        />
        {errores.boleta && <small className="error">{errores.boleta}</small>}

        <input
          name="contrasena"
          type="password"
          placeholder="Contraseña"
          autoComplete="new-password"
          maxLength={72}
          value={datos.contrasena}
          onChange={cambiar}
          onBlur={revisarCampo}
        />
        {errores.contrasena && <small className="error">{errores.contrasena}</small>}

        <input
          name="confirmar"
          type="password"
          placeholder="Confirmar contraseña"
          autoComplete="new-password"
          maxLength={72}
          value={datos.confirmar}
          onChange={cambiar}
          onBlur={revisarCampo}
        />
        {errores.confirmar && <small className="error">{errores.confirmar}</small>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrarme'}
        </button>
      </form>

      {errorServidor && <p className="error">{errorServidor}</p>}
      {exito && (
        <>
          <p className={estilos.exito}>{exito}</p>
          <Link className={estilos.volver} href="/talleres">Ir a talleres e inscribirme →</Link>
        </>
      )}
    </main>
  );
}