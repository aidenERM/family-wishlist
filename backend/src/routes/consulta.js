const express = require('express');
const Deseo = require('../models/Deseo');
const Persona = require('../models/Persona');
const Config = require('../models/Config');
const requireFamilyKey = require('../middleware/auth');
const { extractMonto, narrarConsulta } = require('../services/bedrock');
const { buildPlan } = require('../services/planning');

const router = express.Router();

router.post('/', requireFamilyKey, async (req, res) => {
  const { texto } = req.body;
  if (typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ error: 'texto es requerido' });
  }

  try {
    let monto = await extractMonto(texto.trim());

    if (!monto) {
      const personas = await Persona.find();
      monto = personas.reduce((sum, p) => sum + p.plata_actual, 0);
    }

    const config = await Config.findById('singleton').lean();
    const ahorroMensual = config?.ahorro_mensual ?? 0;

    const pendientes = await Deseo.find({ estado: 'pendiente' }).lean();
    const plan = buildPlan(pendientes, monto, ahorroMensual);

    const respuesta = await narrarConsulta(monto, plan);
    res.json({ monto, respuesta, plan });
  } catch (error) {
    console.error('Error en consulta con Bedrock', error);
    res.status(502).json({ error: 'No se pudo procesar la consulta con IA' });
  }
});

module.exports = router;
