import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col items-center gap-2 p-8 text-center"
    >
      <span className="text-4xl">🎁</span>
      <p className="text-sm font-semibold text-white/80">Todavia no hay deseos aqui</p>
      <p className="text-xs text-white/50">
        Toca el botón <span className="font-semibold text-sable-verde">+</span> arriba y cuentale a la IA que
        quiere la familia.
      </p>
    </motion.div>
  );
}
