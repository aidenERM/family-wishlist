const Historial = require('../models/Historial');

async function logHistorial(deseo_id, accion, detalle = '') {
  await Historial.create({ deseo_id, accion, detalle });
}

module.exports = { logHistorial };
