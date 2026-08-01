import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney } from '../lib/format';
import { nextUncrossedMilestone } from '../lib/insights';
import { celebrar } from '../lib/confetti';

const STORAGE_KEY = 'wishlist_last_milestone';

export default function MilestoneBanner({ total }: { total: number }) {
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(STORAGE_KEY) || '0');
    const crossed = nextUncrossedMilestone(total, lastSeen);
    if (crossed) {
      setMilestone(crossed);
      localStorage.setItem(STORAGE_KEY, String(crossed));
      celebrar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card flex items-center justify-between gap-3 border-sable-verde/30 p-4"
        >
          <p className="text-sm font-semibold">
            🎉 ¡La familia ya ahorró <span className="text-sable-verde">{formatMoney(milestone)}</span>!
          </p>
          <button onClick={() => setMilestone(null)} className="flex h-8 w-8 items-center justify-center text-white/40">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
