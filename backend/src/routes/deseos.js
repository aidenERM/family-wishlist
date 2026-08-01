const express = require('express');
const Deseo = require('../models/Deseo');
const Persona = require('../models/Persona');
const requireFamilyKey = require('../middleware/auth');
const { parseDeseoFromText } = require('../services/bedrock');
const { logHistorial } = require('../services/historial');

const router = express.Router();

function sortDeseos(a, b) {
  if (a.estado !== b.estado) {
    return a.estado === 'pendiente' ? -1 : 1;
  }
  if (a.estado === 'pendiente') {
    return a.orden - b.orden;
  }
  return new Date(b.comprado_en || 0) - new Date(a.comprado_en || 0);
}

async function nextOrden() {
  const last = await Deseo.findOne({ estado: 'pendiente' }).sort({ orden: -1 });
  return last ? last.orden + 1 : 1;
}

router.get('/', async (req, res) => {
  const deseos = await Deseo.find().lean();
  deseos.sort(sortDeseos);
  res.json(deseos);
});

router.post('/', requireFamilyKey, async (req, res) => {
  const { articulo, precio, prioridad, descripcion } = req.body;

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
    descripcion: typeof descripcion === 'string' ? descripcion.trim() : '',
    orden: await nextOrden(),
  });

  await logHistorial(deseo._id, 'creado', `"${deseo.articulo}" agregado manualmente`);
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
      orden: await nextOrden(),
    });
    await logHistorial(deseo._id, 'creado', `"${deseo.articulo}" agregado con IA desde: "${texto.trim()}"`);
    res.status(201).json(deseo);
  } catch (error) {
    console.error('Error parsing deseo with Bedrock', error);
    res.status(502).json({ error: 'No se pudo interpretar el texto con IA' });
  }
});

router.patch('/reorder', requireFamilyKey, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === 'string')) {
    return res.status(400).json({ error: 'ids debe ser un arreglo de ids' });
  }

  const pendientes = await Deseo.find({ estado: 'pendiente' }).select('_id');
  const pendienteIds = new Set(pendientes.map((d) => d._id.toString()));

  if (ids.length !== pendienteIds.size || !ids.every((id) => pendienteIds.has(id))) {
    return res.status(400).json({ error: 'ids no coincide con los deseos pendientes actuales' });
  }

  await Promise.all(ids.map((id, index) => Deseo.findByIdAndUpdate(id, { orden: index + 1 })));
  await logHistorial(null, 'reordenado', `orden actualizado para ${ids.length} deseos`);

  const deseos = await Deseo.find().lean();
  deseos.sort(sortDeseos);
  res.json(deseos);
});

router.patch('/:id/comprar', requireFamilyKey, async (req, res) => {
  const { pagos } = req.body;
  if (typeof pagos !== 'object' || pagos === null || Array.isArray(pagos)) {
    return res.status(400).json({ error: 'pagos debe ser un objeto persona -> monto' });
  }

  const deseo = await Deseo.findById(req.params.id);
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }
  if (deseo.estado === 'comprado') {
    return res.status(400).json({ error: 'este deseo ya esta marcado como comprado' });
  }

  const entries = Object.entries(pagos).filter(([, monto]) => typeof monto === 'number' && monto > 0);
  if (entries.length === 0) {
    return res.status(400).json({ error: 'pagos debe tener al menos un monto positivo' });
  }

  const total = entries.reduce((sum, [, monto]) => sum + monto, 0);
  if (Math.abs(total - deseo.precio) > 0.01) {
    return res.status(400).json({ error: `los pagos deben sumar exactamente el precio (${deseo.precio})` });
  }

  const personas = await Persona.find({ nombre: { $in: entries.map(([nombre]) => nombre) } });
  const personaMap = new Map(personas.map((p) => [p.nombre, p]));

  for (const [nombre, monto] of entries) {
    const persona = personaMap.get(nombre);
    if (!persona) {
      return res.status(400).json({ error: `persona desconocida: ${nombre}` });
    }
    if (persona.plata_actual < monto) {
      return res.status(400).json({ error: `${nombre} no tiene suficiente plata para aportar ${monto}` });
    }
  }

  await Promise.all(
    entries.map(([nombre, monto]) =>
      Persona.updateOne({ nombre }, { $inc: { plata_actual: -monto }, updated_at: new Date() })
    )
  );

  deseo.estado = 'comprado';
  deseo.comprado_en = new Date();
  deseo.pagos = new Map(entries);
  await deseo.save();

  const detalle = entries.map(([nombre, monto]) => `${nombre}: ${monto}`).join(', ');
  await logHistorial(deseo._id, 'comprado', `"${deseo.articulo}" comprado (${detalle})`);

  res.json(deseo);
});

router.patch('/:id', requireFamilyKey, async (req, res) => {
  const updates = {};
  const { articulo, precio, prioridad, estado, descripcion } = req.body;

  const deseo = await Deseo.findById(req.params.id);
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }

  if (articulo !== undefined) updates.articulo = articulo;
  if (precio !== undefined) updates.precio = precio;
  if (descripcion !== undefined) updates.descripcion = descripcion;
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
    if (estado === 'comprado') {
      updates.comprado_en = new Date();
    } else {
      updates.comprado_en = null;
      updates.orden = await nextOrden();
    }
  }

  Object.assign(deseo, updates);
  await deseo.save();

  if (prioridad !== undefined) {
    await logHistorial(deseo._id, 'prioridad_cambiada', `"${deseo.articulo}" ahora es prioridad ${prioridad}`);
  } else if (estado === 'comprado') {
    await logHistorial(deseo._id, 'comprado', `"${deseo.articulo}" marcado como comprado (sin desglose de pagos)`);
  } else {
    await logHistorial(deseo._id, 'editado', `"${deseo.articulo}" editado`);
  }

  res.json(deseo);
});

router.delete('/:id', requireFamilyKey, async (req, res) => {
  const deseo = await Deseo.findByIdAndDelete(req.params.id);
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }
  await logHistorial(null, 'eliminado', `"${deseo.articulo}" eliminado`);
  res.status(204).send();
});

module.exports = router;
