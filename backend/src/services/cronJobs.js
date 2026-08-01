const cron = require('node-cron');
const Persona = require('../models/Persona');
const Config = require('../models/Config');
const Deseo = require('../models/Deseo');
const { logHistorial } = require('./historial');
const { recordSnapshot } = require('./snapshot');
const { computeStatuses } = require('./planning');
const { sendNotificationToAll } = require('./push');

async function aplicarAhorroMensual() {
  const config = await Config.findById('singleton');
  const ahorroMensual = config?.ahorro_mensual ?? 0;
  if (ahorroMensual <= 0) return;

  const personas = await Persona.find();
  if (personas.length === 0) return;

  const porPersona = Math.round(ahorroMensual / personas.length);

  await Promise.all(
    personas.map((p) =>
      Persona.updateOne(
        { _id: p._id },
        { $inc: { plata_actual: porPersona }, updated_at: new Date() }
      )
    )
  );

  await logHistorial(
    null,
    'ahorro_automatico',
    `ahorro mensual (${ahorroMensual}) repartido automaticamente entre ${personas.length} personas`
  );
  await recordSnapshot();
  console.log(`[cron] ahorro mensual automatico aplicado: +${porPersona} a cada una de ${personas.length} personas`);
}

async function revisarTransicionesVerde() {
  const [personas, pendientes, config] = await Promise.all([
    Persona.find(),
    Deseo.find({ estado: 'pendiente' }),
    Config.findById('singleton'),
  ]);

  const total = personas.reduce((sum, p) => sum + p.plata_actual, 0);
  const ahorroMensual = config?.ahorro_mensual ?? 0;
  const statuses = computeStatuses(pendientes, total, ahorroMensual);
  const statusMap = new Map(statuses.map((s) => [s._id, s.status]));

  const nuevosVerdes = [];

  for (const deseo of pendientes) {
    const nuevoEstado = statusMap.get(deseo._id.toString());
    if (nuevoEstado === 'verde' && deseo.ultimo_estado_visual !== 'verde') {
      nuevosVerdes.push(deseo.articulo);
    }
    if (nuevoEstado !== deseo.ultimo_estado_visual) {
      await Deseo.updateOne({ _id: deseo._id }, { ultimo_estado_visual: nuevoEstado });
    }
  }

  if (nuevosVerdes.length > 0) {
    await sendNotificationToAll({
      title: nuevosVerdes.length === 1 ? '¡Ya pueden comprarlo!' : '¡Ya pueden comprar varios!',
      body: `Ya alcanza para: ${nuevosVerdes.join(', ')}`,
    });
    console.log('[cron] notificacion enviada por nuevos items en verde:', nuevosVerdes.join(', '));
  }
}

function start() {
  // 1st of every month at 6am server time
  cron.schedule('0 6 1 * *', () => {
    aplicarAhorroMensual().catch((err) => console.error('[cron] error aplicando ahorro mensual', err));
  });

  // every 15 minutes, check for items that just became affordable
  cron.schedule('*/15 * * * *', () => {
    revisarTransicionesVerde().catch((err) => console.error('[cron] error revisando transiciones', err));
  });
}

module.exports = { start, aplicarAhorroMensual, revisarTransicionesVerde };
