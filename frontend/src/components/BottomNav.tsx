import { motion } from 'framer-motion';

export type Tab = 'inicio' | 'lista' | 'plan' | 'ajustes';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'lista', label: 'Lista', icon: '🎁' },
  { id: 'plan', label: 'Plan', icon: '📅' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0d1230]/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-sable-verde"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={isActive ? 'font-semibold text-white' : 'text-white/50'}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
