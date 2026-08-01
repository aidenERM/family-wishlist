const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema(
  {
    fecha: { type: Date, default: Date.now },
    total: { type: Number, required: true },
  },
  { collection: 'wishlist_snapshots' }
);

module.exports = mongoose.model('Snapshot', snapshotSchema);
