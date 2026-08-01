const Persona = require('../models/Persona');
const Snapshot = require('../models/Snapshot');

async function recordSnapshot() {
  const personas = await Persona.find();
  const total = personas.reduce((sum, p) => sum + p.plata_actual, 0);
  await Snapshot.create({ total });
  return total;
}

module.exports = { recordSnapshot };
