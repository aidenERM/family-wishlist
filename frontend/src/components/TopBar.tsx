import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney } from '../lib/format';
import AiInput from './AiInput';

export default function TopBar({
  total,
  onAddAi,
}: {
  total: number;
  onAddAi: (texto: string, forzar?: boolean) => Promise<{ mensaje: string | null }>;
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div
      className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#0d1230]/85 px-4 py-2 backdrop-blur-xl"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/40">Ahorrado</p>
          <p className="text-lg font-bold leading-tight">{formatMoney(total)}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowAdd((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sable-verde/80 text-xl font-bold"
          aria-label="agregar deseo"
        >
          {showAdd ? '✕' : '+'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto max-w-2xl overflow-hidden pt-2"
          >
            <AiInput
              onSubmit={async (texto, forzar) => {
                const result = await onAddAi(texto, forzar);
                return result;
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
