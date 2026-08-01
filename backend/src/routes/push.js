const express = require('express');
const PushSubscription = require('../models/PushSubscription');
const requireFamilyKey = require('../middleware/auth');

const router = express.Router();

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

router.post('/subscribe', requireFamilyKey, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (typeof endpoint !== 'string' || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'suscripcion invalida' });
  }

  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
    { upsert: true }
  );

  res.status(201).json({ ok: true });
});

router.post('/unsubscribe', requireFamilyKey, async (req, res) => {
  const { endpoint } = req.body;
  if (typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint es requerido' });
  }
  await PushSubscription.deleteOne({ endpoint });
  res.json({ ok: true });
});

module.exports = router;
