import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAnimatedNumber } from '../lib/useAnimatedNumber';
import { formatMoney } from '../lib/format';

export default function AnimatedMoney({ value, className = '' }: { value: number; className?: string }) {
  const display = useAnimatedNumber(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value > prevValue.current) setFlash('up');
    else if (value < prevValue.current) setFlash('down');
    prevValue.current = value;

    if (value !== display) {
      const timer = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.span
      className={className}
      animate={{
        color: flash === 'up' ? '#22c55e' : flash === 'down' ? '#ef4444' : '#e8ecff',
      }}
      transition={{ duration: 0.7 }}
    >
      {formatMoney(display)}
    </motion.span>
  );
}
