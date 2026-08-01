import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'wishlist_install_dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      setVisible(true);
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleInstalled() {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setShowIOSHelp(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  async function handleInstallClick() {
    if (isIOS()) {
      setShowIOSHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="glass-card fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 p-4"
        >
          {!showIOSHelp ? (
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}pwa/icon-any-192.png`}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">Instala la app en tu celular</p>
                <p className="text-xs text-white/60">Se abre como una app, sin buscar el link cada vez.</p>
              </div>
              <button onClick={dismiss} className="shrink-0 self-start text-white/40" aria-label="cerrar">
                ✕
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="shrink-0 rounded-xl bg-sable-verde/80 px-4 py-2 text-sm font-semibold"
              >
                Instalar
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Para instalarla en iPhone:</p>
                <button onClick={dismiss} className="text-white/40" aria-label="cerrar">
                  ✕
                </button>
              </div>
              <ol className="flex flex-col gap-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                    1
                  </span>
                  Toca el botón de <strong>Compartir</strong> (el cuadrito con la flecha hacia arriba) en Safari.
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                    2
                  </span>
                  Busca y toca <strong>"Agregar a inicio"</strong>.
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                    3
                  </span>
                  Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo!
                </li>
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
