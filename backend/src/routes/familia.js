const express = require('express');
const Persona = require('../models/Persona');
const requireFamilyKey = require('../middleware/auth');
const { recordSnapshot } = require('../services/snapshot');

const router = express.Router();

router.get('/', async (req, res) => {
  const personas = await Persona.find().sort({ nombre: 1 });
  const total = personas.reduce((sum, p) => sum + p.plata_actual, 0);
  res.json({ personas, total });
});

router.put('/:persona', requireFamilyKey, async (req, res) => {
  const { plata_actual } = req.body;
  if (typeof plata_actual !== 'number' || plata_actual < 0) {
    return res.status(400).json({ error: 'plata_actual debe ser un numero >= 0' });
  }

  const persona = await Persona.findOneAndUpdate(
    { nombre: req.params.persona },
    { plata_actual, updated_at: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await recordSnapshot();

  res.json(persona);
});

module.exports = router;
