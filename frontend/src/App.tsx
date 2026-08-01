import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as api from './api';
import type { Config, Deseo, Persona, Prioridad } from './types';
import { computePlan, buildMonthlyPlan } from './lib/planning';
import Header from './components/Header';
import AiInput from './components/AiInput';
import ManualAddForm from './components/ManualAddForm';
import ConfigPanel from './components/ConfigPanel';
import DeseoList from './components/DeseoList';
import DeseoModal from './components/DeseoModal';
import CalendarioTimeline from './components/CalendarioTimeline';
import PlanMensualTable from './components/PlanMensualTable';
import ConsultaBox from './components/ConsultaBox';
import UndoToast from './components/UndoToast';

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [total, setTotal] = useState(0);
  const [deseos, setDeseos] = useState<Deseo[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalDeseo, setModalDeseo] = useState<Deseo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Deseo | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const monthlyPlan = useMemo(
    () => buildMonthlyPlan(deseos, total, config?.ahorro_mensual ?? 0, 12),
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

  async function handleReorder(ids: string[]) {
    const updated = await api.reordenarDeseos(ids);
    setDeseos(updated);
  }

  async function handleChangePrioridad(id: string, prioridad: Prioridad) {
    const updated = await api.updateDeseo(id, { prioridad });
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setModalDeseo((prev) => (prev && prev._id === id ? updated : prev));
  }

  async function handleComprar(id: string, pagos: Record<string, number>) {
    const updated = await api.comprarDeseo(id, pagos);
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setPersonas((prev) =>
      prev.map((p) => (pagos[p.nombre] ? { ...p, plata_actual: p.plata_actual - pagos[p.nombre] } : p))
    );
    setTotal((prev) => prev - Object.values(pagos).reduce((s, v) => s + v, 0));
  }

  function handleDeleteRequest(id: string) {
    const deseo = deseos.find((d) => d._id === id);
    if (!deseo) return;
    setDeseos((prev) => prev.filter((d) => d._id !== id));
    setPendingDelete(deseo);
    deleteTimer.current = setTimeout(async () => {
      setPendingDelete(null);
      try {
        await api.deleteDeseo(id);
      } catch {
        setDeseos((prev) => [...prev, deseo]);
      }
    }, 5000);
  }

  function handleUndoDelete() {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    if (pendingDelete) {
      setDeseos((prev) => [...prev, pendingDelete]);
      setPendingDelete(null);
    }
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
        <ConsultaBox />
        <ManualAddForm onSubmit={handleAddManual} />
        {config && <ConfigPanel ahorroMensual={config.ahorro_mensual} onSave={handleSaveAhorro} />}

        <CalendarioTimeline rows={monthlyPlan} />
        <PlanMensualTable rows={monthlyPlan} />

        <DeseoList deseos={deseos} plan={plan} onOpen={setModalDeseo} onReorder={handleReorder} />
      </main>

      <AnimatePresence>
        {modalDeseo && (
          <DeseoModal
            deseo={modalDeseo}
            personas={personas}
            onClose={() => setModalDeseo(null)}
            onChangePrioridad={handleChangePrioridad}
            onComprar={handleComprar}
            onDelete={handleDeleteRequest}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDelete && <UndoToast articulo={pendingDelete.articulo} onUndo={handleUndoDelete} />}
      </AnimatePresence>
    </div>
  );
}
