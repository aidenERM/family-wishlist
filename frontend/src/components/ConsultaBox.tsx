import { useState } from 'react';
import { motion } from 'framer-motion';
import * as api from '../api';

export default function ConsultaBox() {
  const [texto, setTexto] = useState('');
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || loading) return;
    setLoading(true);
    setError(null);
    setRespuesta(null);
    try {
      const { respuesta } = await api.consultar(texto.trim());
      setRespuesta(respuesta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card flex flex-col gap-2 p-4"
    >
      <label className="text-xs text-white/60">Pregunta a la IA</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder='ej. "tengo 2 millones, que me alcanza?"'
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={loading}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? '...' : 'Preguntar'}
        </motion.button>
      </div>
      {error && <p className="text-xs text-sable-rojo">{error}</p>}
      {respuesta && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/90"
        >
          {respuesta}
        </motion.p>
      )}
    </motion.form>
  );
}
