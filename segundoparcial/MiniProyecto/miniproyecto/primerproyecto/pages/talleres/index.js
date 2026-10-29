import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import TarjetaTaller from '../../components/TarjetaTaller';
import estilos from '../../styles/Talleres.module.css';
// /talleres — lista de talleres (GET /api/talleres).
// PASO 2: lista sencilla con estados de carga y error.
// PASO 3: cambia la lista por tarjetas (components/TarjetaTaller.js) en una rejilla.
// PASO 7: agrega el buscador.
export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('fecha');


  useEffect(() => { 
    cargarTalleres(); 
  }, []);

  async function cargarTalleres() {
    try { 
      const lista = await pedirJSON('/talleres');
      const asistencias = await Promise.all(
      lista.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`).catch(() => null))
      );
    setTalleres(
    lista.map((t, i) => ({ ...t, inscritos: asistencias[i] ? asistencias[i].length : null }))
    );
     } catch (err) { 
      setError(err.message); 
     } finally { 
      setCargando(false);
      }  
    }

    const texto = busqueda.trim().toLowerCase();
    const visibles = talleres.filter((t) =>
    `${t.nombre} ${t.instructor || ''}`.toLowerCase().includes(texto)
    );

    const ordenados = [...visibles].sort((a, b) =>
    orden === 'nombre'
      ? a.nombre.localeCompare(b.nombre, 'es')
      : String(a.fecha).localeCompare(String(b.fecha))
    );

  return (
    <main className={estilos.contenedor}>
      <h1>Talleres</h1>

    <div className={estilos.controles}>
      <input
        className={estilos.buscador}
        placeholder="Buscar por nombre o instructor"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

    <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="fecha">Ordenar por fecha</option>
          <option value="nombre">Ordenar por nombre (A-Z)</option>
        </select>
    </div>
        {cargando && <p>Cargando talleres…</p>}
        {error && <p className="error">{error}</p>}
        {!cargando && !error && talleres.length === 0 && <p>No hay talleres registrados.</p>}
        {!cargando && !error && talleres.length > 0 && visibles.length === 0 && (
        <p>No hay talleres que coincidan con la búsqueda.</p>
        )}


        <div className={estilos.rejilla}>
        {ordenados.map((t) => (
        <TarjetaTaller key={t.id} taller={t} />
        ))}
      </div>
    </main>
  );
}