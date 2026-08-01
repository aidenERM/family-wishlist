const express = require('express');
const Deseo = require('../models/Deseo');
const Persona = require('../models/Persona');
const requireFamilyKey = require('../middleware/auth');
const { parseDeseoFromText } = require('../services/bedrock');
const { logHistorial } = require('../services/historial');
const { recordSnapshot } = require('../services/snapshot');

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

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

async function buscarSimilar(articulo) {
  const objetivo = normalizar(articulo);
  const pendientes = await Deseo.find({ estado: 'pendiente' }).lean();
  return pendientes.find((d) => {
    const actual = normalizar(d.articulo);
    return actual === objetivo || actual.includes(objetivo) || objetivo.includes(actual);
  });
}

router.get('/', async (req, res) => {
  const deseos = await Deseo.find().lean();
  deseos.sort(sortDeseos);
  res.json(deseos);
});

router.post('/', requireFamilyKey, async (req, res) => {
  const { articulo, precio, prioridad, descripcion, razon, fecha_objetivo, imagenes } = req.body;

  if (typeof articulo !== 'string' || !articulo.trim()) {
    return res.status(400).json({ error: 'articulo es requerido' });
  }
  if (typeof precio !== 'number' || precio < 0) {
    return res.status(400).json({ error: 'precio debe ser un numero >= 0' });
  }
  if (prioridad && !['alta', 'media', 'baja'].includes(prioridad)) {
    return res.status(400).json({ error: 'prioridad invalida' });
  }

  if (!req.body.forzar) {
    const similar = await buscarSimilar(articulo.trim());
    if (similar) {
      return res.status(409).json({
        duplicado: true,
        existente: similar,
        error: `ya existe "${similar.articulo}" en la lista`,
      });
    }
  }

  const deseo = await Deseo.create({
    articulo: articulo.trim(),
    precio,
    prioridad: prioridad || 'media',
    descripcion: typeof descripcion === 'string' ? descripcion.trim() : '',
    razon: typeof razon === 'string' ? razon.trim() : '',
    fecha_objetivo: fecha_objetivo ? new Date(fecha_objetivo) : null,
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    orden: await nextOrden(),
  });

  await logHistorial(deseo._id, 'creado', `"${deseo.articulo}" agregado manualmente`);
  res.status(201).json(deseo);
});

router.post('/ai', requireFamilyKey, async (req, res) => {
  const { texto, forzar } = req.body;
  if (typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ error: 'texto es requerido' });
  }

  try {
    const parsed = await parseDeseoFromText(texto.trim());

    if (!forzar) {
      const similar = await buscarSimilar(parsed.articulo);
      if (similar) {
        return res.status(409).json({
          duplicado: true,
          existente: similar,
          propuesto: parsed,
          error: `ya existe "${similar.articulo}" en la lista`,
        });
      }
    }

    const deseo = await Deseo.create({
      articulo: parsed.articulo,
      precio: parsed.precio,
      prioridad: parsed.prioridad,
      estimado: parsed.estimado,
      orden: await nextOrden(),
    });
    await logHistorial(deseo._id, 'creado', `"${deseo.articulo}" agregado con IA desde: "${texto.trim()}"`);
    res.status(201).json({ ...deseo.toObject(), mensaje: parsed.mensaje || null });
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
  const uniqueIds = new Set(ids);

  if (
    ids.length !== pendienteIds.size ||
    uniqueIds.size !== ids.length ||
    !ids.every((id) => pendienteIds.has(id))
  ) {
    return res.status(400).json({ error: 'ids no coincide con los deseos pendientes actuales' });
  }

  await Promise.all(ids.map((id, index) => Deseo.findByIdAndUpdate(id, { orden: index + 1 })));
  await logHistorial(null, 'reordenado', `orden actualizado para ${ids.length} deseos`);

  const deseos = await Deseo.find().lean();
  deseos.sort(sortDeseos);
  res.json(deseos);
});

router.patch('/:id/comprar', requireFamilyKey, async (req, res) => {
  const { pagos, foto_comprado } = req.body;
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
  if (typeof foto_comprado === 'string' && foto_comprado) {
    deseo.foto_comprado = foto_comprado;
  }
  await deseo.save();
  await recordSnapshot();

  const detalle = entries.map(([nombre, monto]) => `${nombre}: ${monto}`).join(', ');
  await logHistorial(deseo._id, 'comprado', `"${deseo.articulo}" comprado (${detalle})`);

  res.json(deseo);
});

router.patch('/:id/revisar-precio', requireFamilyKey, async (req, res) => {
  const deseo = await Deseo.findByIdAndUpdate(req.params.id, { revisado_en: new Date() }, { new: true });
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }
  res.json(deseo);
});

router.patch('/:id', requireFamilyKey, async (req, res) => {
  const updates = {};
  const { articulo, precio, prioridad, estado, descripcion, razon, fecha_objetivo, oculto_para, imagenes } =
    req.body;

  const deseo = await Deseo.findById(req.params.id);
  if (!deseo) {
    return res.status(404).json({ error: 'deseo no encontrado' });
  }

  if (articulo !== undefined) updates.articulo = articulo;
  if (precio !== undefined) updates.precio = precio;
  if (descripcion !== undefined) updates.descripcion = descripcion;
  if (razon !== undefined) updates.razon = razon;
  if (fecha_objetivo !== undefined) updates.fecha_objetivo = fecha_objetivo ? new Date(fecha_objetivo) : null;
  if (oculto_para !== undefined) updates.oculto_para = oculto_para || null;
  if (Array.isArray(imagenes)) updates.imagenes = imagenes;
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

  if (estado === 'comprado') {
    await recordSnapshot();
  }

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
