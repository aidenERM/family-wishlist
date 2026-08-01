import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '../lib/haptics';

const THRESHOLD = 70;

export default function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const buzzed = useRef(false);

  function handleTouchStart(e: React.TouchEvent) {
    if (window.scrollY <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      buzzed.current = false;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      const damped = Math.min(delta * 0.5, 100);
      setPull(damped);
      if (damped > THRESHOLD && !buzzed.current) {
        haptic(15);
        buzzed.current = true;
      }
    }
  }

  async function handleTouchEnd() {
    if (pull > THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <motion.div
        className="pointer-events-none flex items-center justify-center overflow-hidden text-xs text-white/50"
        animate={{ height: pull, opacity: pull > 10 ? 1 : 0 }}
        transition={{ type: refreshing ? 'tween' : false }}
      >
        {refreshing ? '⟳ Actualizando...' : pull > THRESHOLD ? '↑ Suelta para actualizar' : '↓ Desliza para actualizar'}
      </motion.div>
      {children}
    </div>
  );
}
