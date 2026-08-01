import { useEffect, useMemo, useState } from 'react';
import * as api from './api';
import type { Config, Deseo, Persona, Prioridad } from './types';
import { computePlan } from './lib/planning';
import Header from './components/Header';
import AiInput from './components/AiInput';
import ManualAddForm from './components/ManualAddForm';
import ConfigPanel from './components/ConfigPanel';
import DeseoList from './components/DeseoList';

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [total, setTotal] = useState(0);
  const [deseos, setDeseos] = useState<Deseo[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [familia, deseosData, configData] = await Promise.all([
          api.getFamilia(),
          api.getDeseos(),
          api.getConfig(),
        ]);
        setPersonas(familia.personas);
        setTotal(familia.total);
        setDeseos(deseosData);
        setConfig(configData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const plan = useMemo(
    () => computePlan(deseos, total, config?.ahorro_mensual ?? 0),
    [deseos, total, config]
  );

  async function handleSavePersona(nombre: string, plataActual: number) {
    const updated = await api.updatePersona(nombre, plataActual);
    setPersonas((prev) => prev.map((p) => (p.nombre === nombre ? updated : p)));
    setTotal((prev) => prev - (personas.find((p) => p.nombre === nombre)?.plata_actual ?? 0) + plataActual);
  }

  async function handleAddAi(texto: string) {
    const deseo = await api.addDeseoAi(texto);
    setDeseos((prev) => [...prev, deseo]);
  }

  async function handleAddManual(articulo: string, precio: number, prioridad: Prioridad) {
    const deseo = await api.addDeseoManual(articulo, precio, prioridad);
    setDeseos((prev) => [...prev, deseo]);
  }

  async function handleMarcarComprado(id: string) {
    const updated = await api.updateDeseo(id, { estado: 'comprado' });
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
  }

  async function handleDelete(id: string) {
    await api.deleteDeseo(id);
    setDeseos((prev) => prev.filter((d) => d._id !== id));
  }

  async function handleSaveAhorro(ahorro: number) {
    const updated = await api.updateConfig({ ahorro_mensual: ahorro });
    setConfig(updated);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        Cargando...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="orb h-72 w-72 bg-blue-500/20 animate-float-orb" style={{ top: '5%', left: '10%' }} />
      <div className="orb h-96 w-96 bg-purple-500/15 animate-float-orb" style={{ top: '40%', right: '5%' }} />
      <div className="orb h-64 w-64 bg-pink-500/10 animate-float-orb" style={{ bottom: '5%', left: '30%' }} />

      <main className="relative z-10 mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
        <Header personas={personas} total={total} onSavePersona={handleSavePersona} />

        {error && (
          <div className="glass-card border-sable-rojo/40 p-3 text-sm text-red-300">{error}</div>
        )}

        <AiInput onSubmit={handleAddAi} />
        <ManualAddForm onSubmit={handleAddManual} />
        {config && <ConfigPanel ahorroMensual={config.ahorro_mensual} onSave={handleSaveAhorro} />}

        <DeseoList
          deseos={deseos}
          plan={plan}
          onMarcarComprado={handleMarcarComprado}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
