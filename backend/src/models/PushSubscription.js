const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    creado_en: { type: Date, default: Date.now },
  },
  { collection: 'wishlist_push_subscriptions' }
);

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
