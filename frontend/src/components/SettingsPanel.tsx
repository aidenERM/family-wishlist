import { useEffect, useState } from 'react';
import type { Persona } from '../types';
import { getIdentity, setIdentity } from '../lib/identity';
import { getExistingSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from '../lib/push';

export default function SettingsPanel({ personas }: { personas: Persona[] }) {
  const [open, setOpen] = useState(false);
  const [quienSoy, setQuienSoy] = useState(getIdentity());
  const [pushSupported, setPushSupported] = useState(false);
  const [pushActivo, setPushActivo] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    isPushSupported().then(setPushSupported);
    getExistingSubscription().then((sub) => setPushActivo(!!sub));
  }, []);

  function handleIdentity(nombre: string) {
    setQuienSoy(nombre);
    setIdentity(nombre);
    window.location.reload();
  }

  async function togglePush() {
    setPushLoading(true);
    try {
      if (pushActivo) {
        await unsubscribeFromPush();
        setPushActivo(false);
      } else {
        const ok = await subscribeToPush();
        setPushActivo(ok);
      }
    } finally {
      setPushLoading(false);
    }
  }

  return (
    <div className="glass-card p-4">
      <button className="text-sm font-semibold text-white/70" onClick={() => setOpen((o) => !o)} type="button">
        {open ? '- Cerrar ajustes' : '⚙️ Ajustes'}
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <p className="mb-1 text-xs text-white/60">¿Quien eres? (para el modo sorpresa)</p>
            <select
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              value={quienSoy}
              onChange={(e) => handleIdentity(e.target.value)}
            >
              <option value="">Nadie / no filtrar</option>
              {personas.map((p) => (
                <option key={p.nombre} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {pushSupported && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Avisar cuando algo se pueda comprar</span>
              <button
                type="button"
                onClick={togglePush}
                disabled={pushLoading}
                className={`min-h-[36px] rounded-full px-4 text-xs font-semibold ${
                  pushActivo ? 'bg-sable-verde/80' : 'bg-white/10'
                }`}
              >
                {pushLoading ? '...' : pushActivo ? 'Activado' : 'Activar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
