const mongoose = require('mongoose');

const deseoSchema = new mongoose.Schema(
  {
    articulo: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    prioridad: { type: String, enum: ['alta', 'media', 'baja'], required: true, default: 'media' },
    estado: { type: String, enum: ['pendiente', 'comprado'], required: true, default: 'pendiente' },
    estimado: { type: Boolean, default: false },
    fecha_creado: { type: Date, default: Date.now },
    orden: { type: Number, required: true, default: 0 },
    descripcion: { type: String, default: '' },
    imagenes: { type: [String], default: [] },
    comprado_en: { type: Date, default: null },
    pagos: { type: Map, of: Number, default: undefined },
  },
  { collection: 'wishlist_deseos' }
);

const prioridadRank = { alta: 0, media: 1, baja: 2 };
deseoSchema.statics.PRIORIDAD_RANK = prioridadRank;

module.exports = mongoose.model('Deseo', deseoSchema);
