import { motion } from 'framer-motion';

export default function UndoToast({ articulo, onUndo }: { articulo: string; onUndo: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 px-4 py-3 text-sm"
    >
      <span>Eliminado: {articulo}</span>
      <button onClick={onUndo} className="font-semibold text-sable-verde">
        Deshacer
      </button>
    </motion.div>
  );
}
