import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DuplicadoException } from '../api';

export default function AiInput({
  onSubmit,
}: {
  onSubmit: (texto: string, forzar?: boolean) => Promise<{ mensaje: string | null }>;
}) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicado, setDuplicado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function submit(forzar: boolean) {
    if (!texto.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDuplicado(null);
    try {
      const result = await onSubmit(texto.trim(), forzar);
      setTexto('');
      if (result.mensaje) {
        setMensaje(result.mensaje);
        setTimeout(() => setMensaje(null), 6000);
      }
    } catch (err) {
      if (err instanceof DuplicadoException) {
        setDuplicado(err.data.existente.articulo);
      } else {
        setError(err instanceof Error ? err.message : 'Error inesperado');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="glass-card flex flex-col gap-2 p-4"
    >
      <label className="text-xs text-white/60">Agregar con IA</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder='escribe lo que quieres agregar... ej. "agrega un tv samsung 3 millones"'
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={loading}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sable-verde/80 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? '...' : 'Enviar'}
        </motion.button>
      </div>
      {error && <p className="text-xs text-sable-rojo">{error}</p>}
      {duplicado && (
        <div className="rounded-xl bg-white/5 p-3 text-xs">
          <p className="text-white/70">
            Ya existe <strong>"{duplicado}"</strong> en la lista. ¿Es lo mismo o algo distinto?
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
      <AnimatePresence>
        {mensaje && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs italic text-sable-verde"
          >
            ✨ {mensaje}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
