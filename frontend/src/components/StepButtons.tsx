import { motion } from 'framer-motion';

export default function StepButtons({ onStep, step = 50000 }: { onStep: (delta: number) => void; step?: number }) {
  return (
    <div className="flex gap-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        type="button"
        onClick={() => onStep(-step)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70"
        aria-label={`restar ${step}`}
      >
        -
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        type="button"
        onClick={() => onStep(step)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70"
        aria-label={`sumar ${step}`}
      >
        +
      </motion.button>
    </div>
  );
}
