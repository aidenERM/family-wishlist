const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    plata_actual: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: 'updated_at' }, collection: 'wishlist_personas' }
);

module.exports = mongoose.model('Persona', personaSchema);
