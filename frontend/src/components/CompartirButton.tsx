import { useState } from 'react';
import { motion } from 'framer-motion';
import { generarImagenResumen } from '../lib/exportImage';
import type { Deseo } from '../types';

export default function CompartirButton({ total, pendientes }: { total: number; pendientes: Deseo[] }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const blob = await generarImagenResumen(total, pendientes);
      const file = new File([blob], 'lista-de-deseos.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Lista de deseos de la familia' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista-de-deseos.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // el usuario cancelo el share, o el navegador no soporta descarga silenciosa - no hacer nada
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      disabled={loading}
      className="glass-card flex items-center justify-center gap-2 p-3 text-sm font-semibold disabled:opacity-50"
    >
      {loading ? 'Generando...' : '📤 Compartir resumen'}
    </motion.button>
  );
}
