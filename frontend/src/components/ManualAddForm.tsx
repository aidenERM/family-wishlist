import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Prioridad } from '../types';
import { resizeImageFile } from '../lib/photo';
import { DuplicadoException } from '../api';
import MoneyInput from './MoneyInput';

export interface ManualAddFields {
  articulo: string;
  precio: number;
  prioridad: Prioridad;
  razon?: string;
  fecha_objetivo?: string | null;
  imagenes?: string[];
  forzar?: boolean;
}

export default function ManualAddForm({ onSubmit }: { onSubmit: (fields: ManualAddFields) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [articulo, setArticulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [razon, setRazon] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duplicado, setDuplicado] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setArticulo('');
    setPrecio('');
    setPrioridad('media');
    setRazon('');
    setFechaObjetivo('');
    setFoto(null);
    setDuplicado(null);
    setOpen(false);
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageFile(file);
      setFoto(resized);
    } catch {
      // si falla el resize, simplemente no se adjunta foto
    }
  }

  async function submit(forzar: boolean) {
    const precioNum = Number(precio);
    if (!articulo.trim() || Number.isNaN(precioNum) || precioNum < 0 || loading) return;
    setLoading(true);
    try {
      await onSubmit({
        articulo: articulo.trim(),
        precio: precioNum,
        prioridad,
        razon: razon.trim() || undefined,
        fecha_objetivo: fechaObjetivo || null,
        imagenes: foto ? [foto] : undefined,
        forzar,
      });
      reset();
    } catch (err) {
      if (err instanceof DuplicadoException) {
        setDuplicado(err.data.existente.articulo);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-4">
      <button className="text-sm font-semibold text-white/70" onClick={() => setOpen((o) => !o)} type="button">
        {open ? '- Cerrar' : '+ Agregar manual'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              submit(false);
            }}
            className="mt-3 flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
                placeholder="articulo"
                value={articulo}
                onChange={(e) => setArticulo(e.target.value)}
              />
              <MoneyInput
                className="w-full sm:w-32 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
                placeholder="precio"
                value={precio}
                onChange={setPrecio}
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
            </div>

            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              placeholder="¿por que lo quieren? (opcional)"
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex flex-col gap-1 text-xs text-white/50">
                Fecha especial (opcional)
                <input
                  type="date"
                  className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  value={fechaObjetivo}
                  onChange={(e) => setFechaObjetivo(e.target.value)}
                />
              </label>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFoto}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70"
                >
                  📷 {foto ? 'Foto lista' : 'Tomar foto'}
                </button>
                {foto && <img src={foto} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              </div>
            </div>

            {duplicado && (
              <div className="rounded-xl bg-white/5 p-3 text-xs">
                <p className="text-white/70">
                  Ya existe <strong>"{duplicado}"</strong> en la lista.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 font-medium"
                  >
                    Agregar de todos modos
                  </button>
                  <button type="button" onClick={() => setDuplicado(null)} className="text-white/40">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

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
