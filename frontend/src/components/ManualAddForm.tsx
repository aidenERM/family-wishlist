import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Prioridad } from '../types';

export default function ManualAddForm({
  onSubmit,
}: {
  onSubmit: (articulo: string, precio: number, prioridad: Prioridad) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [articulo, setArticulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const precioNum = Number(precio);
    if (!articulo.trim() || Number.isNaN(precioNum) || precioNum < 0 || loading) return;
    setLoading(true);
    try {
      await onSubmit(articulo.trim(), precioNum, prioridad);
      setArticulo('');
      setPrecio('');
      setPrioridad('media');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-4">
      <button
        className="text-sm font-semibold text-white/70"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {open ? '- Cerrar' : '+ Agregar manual'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mt-3 flex flex-col gap-2 overflow-hidden sm:flex-row"
          >
            <input
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              placeholder="articulo"
              value={articulo}
              onChange={(e) => setArticulo(e.target.value)}
            />
            <input
              className="w-full sm:w-32 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              placeholder="precio"
              inputMode="decimal"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
            <select
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Prioridad)}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Agregar
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
