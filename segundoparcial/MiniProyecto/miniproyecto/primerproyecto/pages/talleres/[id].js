import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import { formatearFecha, ocultarBoleta } from '../../lib/formato';
import { validarBoleta, validarNombre } from '../../lib/validaciones';
import estilos from '../../styles/Talleres.module.css';

export default function DetalleTaller() {
  const router = useRouter();
  const { id } = router.query;

  const [taller, setTaller] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  const [nombre, setNombre] = useState('');
  const [boleta, setBoleta] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [nuevoId, setNuevoId] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.boleta) setBoleta(String(router.query.boleta));
    if (router.query.nombre) setNombre(String(router.query.nombre));
    cargar();
  }, [router.isReady, id]);

  async function cargar() {
    try {
      const datosTaller = await pedirJSON(`/talleres/${id}`);
      const datosAsistencias = await pedirJSON(`/talleres/${id}/asistencias`);
      const datosUsuarios = await pedirJSON('/usuarios').catch(() => []);
      setTaller(datosTaller);
      setAsistencias(Array.isArray(datosAsistencias) ? datosAsistencias : []);
      setUsuarios(Array.isArray(datosUsuarios) ? datosUsuarios : []);
      setErrorCarga('');
    } catch (err) {
      setErrorCarga(err.message);
    }
  }

  const ocupados = asistencias.length;
  const cupo = taller ? Number(taller.cupo) || 0 : 0;
  const libres = taller ? Math.max(0, cupo - ocupados) : 0;
  const lleno = taller !== null && libres === 0;

  function buscarUsuario(b) {
    return usuarios.find((u) => u.boleta === b);
  }

  function cambiarBoleta(e) {
    const valor = e.target.value;
    setBoleta(valor);
    const registrado = buscarUsuario(valor.trim());
    if (registrado && !nombre.trim()) setNombre(registrado.nombre);
  }

  async function inscribir(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const boletaLimpia = boleta.trim();
    if (!validarNombre(nombreLimpio)) {
      return setErrorForm('Escribe tu nombre completo (3 a 100 caracteres, solo letras y espacios).');
    }
    if (!validarBoleta(boletaLimpia)) {
      return setErrorForm('La boleta no es válida (10 dígitos, por ejemplo 2024010123).');
    }
    if (asistencias.some((a) => a.boleta === boletaLimpia)) {
      return setErrorForm('Esa boleta ya está inscrita en este taller.');
    }
    if (lleno) return setErrorForm('El taller ya no tiene lugares.');

    setEnviando(true);
    try {
      const creada = await pedirJSON('/asistencias', {
        method: 'POST',
        body: JSON.stringify({ taller_id: id, nombre_alumno: nombreLimpio, boleta: boletaLimpia }),
      });
      const registrado = buscarUsuario(boletaLimpia);
      setExito(
        registrado
          ? `¡Listo! ${registrado.nombre} (cuenta registrada) quedó inscrito(a) en el taller.`
          : `¡Listo! ${nombreLimpio} quedó inscrito(a) en el taller.`
      );
      setNuevoId(creada && creada.id ? creada.id : null);
      setNombre('');
      setBoleta('');
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (errorCarga) {
    return (
      <main>
        <p className="error">{errorCarga}</p>
        <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
      </main>
    );
  }
  if (!taller) return <main><p>Cargando taller…</p></main>;

  const porcentaje = cupo > 0 ? Math.min(100, (ocupados / cupo) * 100) : 100;

  return (
    <main className={estilos.contenedor}>
      <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
      <h1>{taller.nombre}</h1>

      <section className={estilos.panel}>
        <p><strong>Instructor:</strong> {taller.instructor || 'Por confirmar'}</p>
        <p><strong>Fecha:</strong> {formatearFecha(taller.fecha)}</p>
        <div className={estilos.barra}>
          <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </div>
        <p>
          {ocupados} de {cupo} lugares ocupados ·{' '}
          {lleno ? (
            <span className={estilos.lleno}>Taller lleno</span>
          ) : (
            `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`
          )}
        </p>
      </section>

      <section className={estilos.panel}>
        <h2>Inscribirme</h2>
        <form onSubmit={inscribir} className="formulario">
          <input
            placeholder="Nombre completo"
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Boleta (10 dígitos)"
            maxLength={10}
            inputMode="numeric"
            value={boleta}
            onChange={cambiarBoleta}
          />
          <button type="submit" disabled={lleno || enviando}>
            {lleno ? 'Sin lugares' : enviando ? 'Inscribiendo…' : 'Inscribirme'}
          </button>
        </form>
        {errorForm && <p className="error">{errorForm}</p>}
        {exito && <p className={estilos.exito}>{exito}</p>}
      </section>

      <h2>Inscritos ({ocupados})</h2>
      {ocupados === 0 ? (
        <p>Todavía no hay inscritos. ¡Sé el primero!</p>
      ) : (
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Boleta</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a, i) => (
              <tr key={a.id} className={a.id === nuevoId ? estilos.nuevo : undefined}>
                <td>{i + 1}</td>
                <td>
                  {a.nombre_alumno}
                  {buscarUsuario(a.boleta) && <span className={estilos.insignia}>Registrado</span>}
                  {a.id === nuevoId && <span className={estilos.insignia}>Recién inscrito</span>}
                </td>
                <td>{ocultarBoleta(a.boleta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}