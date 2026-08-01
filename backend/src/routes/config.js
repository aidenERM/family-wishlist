const express = require('express');
const Config = require('../models/Config');
const requireFamilyKey = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const config = await Config.findByIdAndUpdate(
    'singleton',
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(config);
});

router.put('/', requireFamilyKey, async (req, res) => {
  const { ahorro_mensual, fecha_inicio } = req.body;
  const updates = {};

  if (ahorro_mensual !== undefined) {
    if (typeof ahorro_mensual !== 'number' || ahorro_mensual < 0) {
      return res.status(400).json({ error: 'ahorro_mensual debe ser un numero >= 0' });
    }
    updates.ahorro_mensual = ahorro_mensual;
  }

  if (fecha_inicio !== undefined) {
    const date = new Date(fecha_inicio);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ error: 'fecha_inicio invalida' });
    }
    updates.fecha_inicio = date;
  }

  const config = await Config.findByIdAndUpdate('singleton', updates, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
  res.json(config);
});

module.exports = router;
