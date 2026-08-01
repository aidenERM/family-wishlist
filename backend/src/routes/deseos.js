const express = require('express');
const Deseo = require('../models/Deseo');
const requireFamilyKey = require('../middleware/auth');
const { parseDeseoFromText } = require('../services/bedrock');

const router = express.Router();

function sortDeseos(a, b) {
  const rank = Deseo.PRIORIDAD_RANK;
  if (rank[a.prioridad] !== rank[b.prioridad]) {
    return rank[a.prioridad] - rank[b.prioridad];
  }
  return b.precio - a.precio;
}

router.get('/', async (req, res) => {
  const deseos = await Deseo.find().lean();
  deseos.sort(sortDeseos);
  res.json(deseos);
});

router.post('/', requireFamilyKey, async (req, res) => {
  const { articulo, precio, prioridad } = req.body;

  if (typeof articulo !== 'string' || !articulo.trim()) {
    return res.status(400).json({ error: 'articulo es requerido' });
  }
  if (typeof precio !== 'number' || precio < 0) {
    return res.status(400).json({ error: 'precio debe ser un numero >= 0' });
  }
  if (prioridad && !['alta', 'media', 'baja'].includes(prioridad)) {
    return res.status(400).json({ error: 'prioridad invalida' });
  }

  const deseo = await Deseo.create({
    articulo: articulo.trim(),
    precio,
    prioridad: prioridad || 'media',
  });

  res.status(201).json(deseo);
});

router.post('/ai', requireFamilyKey, async (req, res) => {
  const { texto } = req.body;
  if (typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ error: 'texto es requerido' });
  }

  try {
    const parsed = await parseDeseoFromText(texto.trim());
    const deseo = await Deseo.create({
      articulo: parsed.articulo,
      precio: parsed.precio,
      prioridad: parsed.prioridad,
      estimado: parsed.estimado,
    });
    res.status(201).json(deseo);
  } catch (error) {
    console.error('Error parsing deseo with Bedrock', error);
    res.status(502).json({ error: 'No se pudo interpretar el texto con IA' });
  }
});

router.patch('/:id', requireFamilyKey, async (req, res) => {
  const updates = {};
  const { articulo, precio, prioridad, estado } = req.body;

  if (articulo !== undefined) updates.articulo = articulo;
  if (precio !== undefined) updates.precio = precio;
  if (prioridad !== undefined) {
    if (!['alta', 'media', 'baja'].includes(prioridad)) {
      return res.status(400).json({ error: 'prioridad invalida' });
    }
    updates.prioridad = prioridad;
  }
  if (estado !== undefined) {
    if (!['pendiente', 'comprado'].includes(estado)) {
      return res.status(400).json({ error: 'estado invalido' });
    }
    updates.estado = estado;
  }

  const deseo = await Deseo.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }
  res.json(deseo);
});

router.delete('/:id', requireFamilyKey, async (req, res) => {
  const deseo = await Deseo.findByIdAndDelete(req.params.id);
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
