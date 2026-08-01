import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as api from './api';
import type { Config, Deseo, Persona, Prioridad, Snapshot } from './types';
import { computePlan, buildMonthlyPlan } from './lib/planning';
import { getIdentity } from './lib/identity';
import { celebrar } from './lib/confetti';
import { haptic } from './lib/haptics';
import type { ManualAddFields } from './components/ManualAddForm';
import Header from './components/Header';
import ManualAddForm from './components/ManualAddForm';
import ConfigPanel from './components/ConfigPanel';
import DeseoList from './components/DeseoList';
import DeseoModal from './components/DeseoModal';
import CalendarioTimeline from './components/CalendarioTimeline';
import PlanMensualTable from './components/PlanMensualTable';
import ConsultaBox from './components/ConsultaBox';
import UndoToast from './components/UndoToast';
import InstallBanner from './components/InstallBanner';
import MilestoneBanner from './components/MilestoneBanner';
import ProgresoPanel from './components/ProgresoPanel';
import QueSiSlider from './components/QueSiSlider';
import SettingsPanel from './components/SettingsPanel';
import CompartirButton from './components/CompartirButton';
import SkeletonCards from './components/SkeletonCards';
import TopBar from './components/TopBar';
import BottomNav, { type Tab } from './components/BottomNav';
import PullToRefresh from './components/PullToRefresh';

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [total, setTotal] = useState(0);
  const [deseos, setDeseos] = useState<Deseo[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalDeseo, setModalDeseo] = useState<Deseo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Deseo | null>(null);
  const [ahorroPreview, setAhorroPreview] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const identity = useMemo(() => getIdentity(), []);
  const prevStatuses = useRef<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    try {
      const [familia, deseosData, configData, snapshotsData] = await Promise.all([
        api.getFamilia(),
        api.getDeseos(),
        api.getConfig(),
        api.getSnapshots().catch(() => []),
      ]);
      setPersonas(familia.personas);
      setTotal(familia.total);
      setDeseos(deseosData);
      setConfig(configData);
      setSnapshots(snapshotsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const deseosVisibles = useMemo(
    () => deseos.filter((d) => !identity || d.oculto_para !== identity),
    [deseos, identity]
  );

  const ahorroEfectivo = ahorroPreview ?? config?.ahorro_mensual ?? 0;

  const plan = useMemo(
    () => computePlan(deseosVisibles, total, ahorroEfectivo),
    [deseosVisibles, total, ahorroEfectivo]
  );

  const monthlyPlan = useMemo(
    () => buildMonthlyPlan(deseosVisibles, total, ahorroEfectivo, 12),
    [deseosVisibles, total, ahorroEfectivo]
  );

  useEffect(() => {
    let huboNuevoVerde = false;
    plan.forEach((p, id) => {
      const anterior = prevStatuses.current.get(id);
      if (anterior && anterior !== 'verde' && p.status === 'verde') {
        huboNuevoVerde = true;
      }
      prevStatuses.current.set(id, p.status);
    });
    if (huboNuevoVerde) {
      celebrar();
      haptic([15, 40, 15]);
    }
  }, [plan]);

  async function handleSavePersona(nombre: string, plataActual: number) {
    const updated = await api.updatePersona(nombre, plataActual);
    setPersonas((prev) => prev.map((p) => (p.nombre === nombre ? updated : p)));
    setTotal((prev) => prev - (personas.find((p) => p.nombre === nombre)?.plata_actual ?? 0) + plataActual);
  }

  async function handleAddAi(texto: string, forzar?: boolean) {
    const deseo = await api.addDeseoAi(texto, forzar);
    setDeseos((prev) => [...prev, deseo]);
    return { mensaje: deseo.mensaje ?? null };
  }

  async function handleAddManual(fields: ManualAddFields) {
    const deseo = await api.addDeseoManual(fields);
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

  async function handleComprar(id: string, pagos: Record<string, number>, foto_comprado?: string) {
    const updated = await api.comprarDeseo(id, pagos, foto_comprado);
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setPersonas((prev) =>
      prev.map((p) => (pagos[p.nombre] ? { ...p, plata_actual: p.plata_actual - pagos[p.nombre] } : p))
    );
    setTotal((prev) => prev - Object.values(pagos).reduce((s, v) => s + v, 0));
    api.getSnapshots().then(setSnapshots).catch(() => {});
  }

  async function handleConfirmarPrecio(id: string) {
    const updated = await api.revisarPrecio(id);
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setModalDeseo((prev) => (prev && prev._id === id ? updated : prev));
  }

  async function handleChangeOcultoPara(id: string, nombre: string | null) {
    const updated = await api.updateDeseo(id, { oculto_para: nombre });
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setModalDeseo((prev) => (prev && prev._id === id ? updated : prev));
  }

  async function handleAddFoto(id: string, dataUri: string) {
    const existing = deseos.find((d) => d._id === id);
    const imagenes = [...(existing?.imagenes ?? []), dataUri];
    const updated = await api.updateDeseo(id, { imagenes });
    setDeseos((prev) => prev.map((d) => (d._id === id ? updated : d)));
    setModalDeseo((prev) => (prev && prev._id === id ? updated : prev));
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
    return <SkeletonCards />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="orb h-72 w-72 bg-blue-500/20 animate-float-orb" style={{ top: '5%', left: '10%' }} />
      <div className="orb h-96 w-96 bg-purple-500/15 animate-float-orb" style={{ top: '40%', right: '5%' }} />
      <div className="orb h-64 w-64 bg-pink-500/10 animate-float-orb" style={{ bottom: '5%', left: '30%' }} />

      <TopBar total={total} onAddAi={handleAddAi} />

      <PullToRefresh onRefresh={load}>
      <main className="relative z-10 mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 pb-24">
        {error && <div className="glass-card border-sable-rojo/40 p-3 text-sm text-red-300">{error}</div>}

        <MilestoneBanner total={total} />

        {activeTab === 'inicio' && (
          <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            <Header personas={personas} total={total} onSavePersona={handleSavePersona} />
            <ConsultaBox />
            <ManualAddForm onSubmit={handleAddManual} />
            <ProgresoPanel deseos={deseosVisibles} snapshots={snapshots} ahorroMensual={config?.ahorro_mensual ?? 0} />
          </motion.div>
        )}

        {activeTab === 'lista' && (
          <motion.div key="lista" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeseoList
              deseos={deseosVisibles}
              plan={plan}
              onOpen={setModalDeseo}
              onReorder={handleReorder}
              onDelete={handleDeleteRequest}
            />
          </motion.div>
        )}

        {activeTab === 'plan' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            {config && <ConfigPanel ahorroMensual={config.ahorro_mensual} onSave={handleSaveAhorro} />}
            <QueSiSlider ahorroMensual={config?.ahorro_mensual ?? 0} onPreview={setAhorroPreview} />
            <CalendarioTimeline rows={monthlyPlan} />
            <PlanMensualTable rows={monthlyPlan} />
          </motion.div>
        )}

        {activeTab === 'ajustes' && (
          <motion.div key="ajustes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            <CompartirButton total={total} pendientes={deseosVisibles.filter((d) => d.estado === 'pendiente')} />
            <SettingsPanel personas={personas} />
          </motion.div>
        )}
      </main>
      </PullToRefresh>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <AnimatePresence>
        {modalDeseo && (
          <DeseoModal
            deseo={modalDeseo}
            personas={personas}
            onClose={() => setModalDeseo(null)}
            onChangePrioridad={handleChangePrioridad}
            onComprar={handleComprar}
            onDelete={handleDeleteRequest}
            onConfirmarPrecio={handleConfirmarPrecio}
            onChangeOcultoPara={handleChangeOcultoPara}
            onAddFoto={handleAddFoto}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDelete && <UndoToast articulo={pendingDelete.articulo} onUndo={handleUndoDelete} />}
      </AnimatePresence>

      <InstallBanner />
    </div>
  );
}
