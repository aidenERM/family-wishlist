import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Deseo, Persona, Prioridad } from '../types';
import { formatMoney } from '../lib/format';
import { imageUrl } from '../lib/images';
import PrioridadBadge from './PrioridadBadge';

const PRIORIDADES: Prioridad[] = ['alta', 'media', 'baja'];

export default function DeseoModal({
  deseo,
  personas,
  onClose,
  onChangePrioridad,
  onComprar,
  onDelete,
}: {
  deseo: Deseo;
  personas: Persona[];
  onClose: () => void;
  onChangePrioridad: (id: string, prioridad: Prioridad) => Promise<void>;
  onComprar: (id: string, pagos: Record<string, number>) => Promise<void>;
  onDelete: (id: string) => void;
  }) {
  const imagenes = deseo.imagenes ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const [comprando, setComprando] = useState(false);
  const [pagos, setPagos] = useState<Record<string, string>>(() =>
    Object.fromEntries(personas.map((p) => [p.nombre, '']))
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalPagos = Object.values(pagos).reduce((sum, v) => sum + (Number(v) || 0), 0);

  async function submitComprar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (Math.abs(totalPagos - deseo.precio) > 0.01) {
      setError(`Los pagos deben sumar exactamente ${formatMoney(deseo.precio)} (llevas ${formatMoney(totalPagos)})`);
      return;
    }
    setSaving(true);
    try {
      const parsed = Object.fromEntries(
        Object.entries(pagos)
          .map(([k, v]) => [k, Number(v) || 0])
          .filter(([, v]) => (v as number) > 0)
      ) as Record<string, number>;
      await onComprar(deseo._id, parsed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="glass-card max-h-[90vh] w-full max-w-md overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{deseo.articulo}</h2>
          <button onClick={onClose} className="text-white/50" aria-label="cerrar">
            ✕
          </button>
        </div>

        {imagenes.length > 0 && (
          <div className="mt-3">
            <img
              src={imageUrl(imagenes[activeImg])}
              alt={deseo.articulo}
              className="h-48 w-full rounded-2xl object-cover"
            />
            {imagenes.length > 1 && (
              <div className="mt-2 flex gap-2">
                {imagenes.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(i)}
                    className={`h-12 w-12 overflow-hidden rounded-lg border ${
                      i === activeImg ? 'border-white/60' : 'border-white/10'
                    }`}
                  >
                    <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {deseo.descripcion && <p className="mt-3 text-sm text-white/70">{deseo.descripcion}</p>}

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-semibold">{formatMoney(deseo.precio)}</span>
          <PrioridadBadge prioridad={deseo.prioridad} />
          {deseo.estado === 'comprado' && <span className="text-white/40">comprado</span>}
        </div>

        {deseo.estado === 'comprado' && deseo.pagos && (
          <div className="mt-2 text-xs text-white/50">
            Pagado por: {Object.entries(deseo.pagos).map(([n, m]) => `${n} ${formatMoney(m)}`).join(', ')}
          </div>
        )}

        {deseo.estado === 'pendiente' && (
          <div className="mt-4">
            <p className="mb-1 text-xs text-white/60">Prioridad</p>
            <div className="flex gap-2">
              {PRIORIDADES.map((p) => (
                <button
                  key={p}
                  disabled={p === deseo.prioridad}
                  onClick={() => onChangePrioridad(deseo._id, p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p === deseo.prioridad ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'
                  }`}
                >
                  {p === 'alta' ? 'Alta' : p === 'media' ? 'Media' : 'Baja'}
                </button>
              ))}
            </div>
          </div>
        )}

        {deseo.estado === 'pendiente' && (
          <div className="mt-4">
            {!comprando ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setComprando(true)}
                className="w-full rounded-xl bg-sable-verde/20 px-4 py-2 text-sm font-semibold text-green-300"
              >
                Marcar comprado
              </motion.button>
            ) : (
              <form onSubmit={submitComprar} className="rounded-xl bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">
                  Cuanto pone cada quien (debe sumar {formatMoney(deseo.precio)}):
                </p>
                <div className="flex flex-col gap-2">
                  {personas.map((p) => (
                    <label key={p.nombre} className="flex items-center justify-between gap-2 text-sm">
                      <span>{p.nombre}</span>
                      <input
                        inputMode="decimal"
                        className="w-28 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-right text-sm outline-none focus:border-white/30"
                        value={pagos[p.nombre] ?? ''}
                        onChange={(e) => setPagos((prev) => ({ ...prev, [p.nombre]: e.target.value }))}
                        placeholder="0"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/50">Llevas: {formatMoney(totalPagos)}</p>
                {error && <p className="mt-1 text-xs text-sable-rojo">{error}</p>}
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-sable-verde/80 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Confirmar compra
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setComprando(false)}
                    className="rounded-xl bg-white/5 px-3 py-2 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-4 border-t border-white/10 pt-3">
          <AnimatePresence mode="wait">
            {!confirmDelete ? (
              <motion.button
                key="ask"
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-white/40"
              >
                Eliminar este deseo
              </motion.button>
            ) : (
              <motion.div key="confirm" className="flex items-center gap-2 text-xs">
                <span className="text-white/60">¿Seguro?</span>
                <button
                  onClick={() => {
                    onDelete(deseo._id);
                    onClose();
                  }}
                  className="rounded-lg bg-sable-rojo/20 px-2 py-1 font-medium text-red-300"
                >
                  Si, eliminar
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-white/40">
                  Cancelar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
