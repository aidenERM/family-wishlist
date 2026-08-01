const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema(
  {
    deseo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deseo', default: null },
    accion: {
      type: String,
      enum: [
        'creado',
        'editado',
        'prioridad_cambiada',
        'reordenado',
        'comprado',
        'eliminado',
        'ahorro_automatico',
      ],
      required: true,
    },
    detalle: { type: String, default: '' },
    fecha: { type: Date, default: Date.now },
  },
  { collection: 'wishlist_historial' }
);

module.exports = mongoose.model('Historial', historialSchema);
