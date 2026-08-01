const express = require('express');
const Historial = require('../models/Historial');

const router = express.Router();

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const entradas = await Historial.find().sort({ fecha: -1 }).limit(limit);
  res.json(entradas);
});

module.exports = router;
