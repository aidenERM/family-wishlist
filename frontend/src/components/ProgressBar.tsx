import { motion } from 'framer-motion';
import type { StatusColor } from '../types';

const COLORS: Record<StatusColor, string> = {
  verde: 'bg-sable-verde',
  naranja: 'bg-sable-naranja',
  rojo: 'bg-sable-rojo',
};

export default function ProgressBar({ percent, status }: { percent: number; status: StatusColor }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className={`h-full rounded-full ${COLORS[status]}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}
