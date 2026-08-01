const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    ahorro_mensual: { type: Number, required: true, default: 0, min: 0 },
    fecha_inicio: { type: Date, required: true, default: () => new Date('2026-08-31') },
  },
  { collection: 'wishlist_config' }
);

module.exports = mongoose.model('Config', configSchema);
