const express = require('express');
const Snapshot = require('../models/Snapshot');

const router = express.Router();

router.get('/', async (req, res) => {
  const dias = Math.min(Number(req.query.dias) || 180, 730);
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const snapshots = await Snapshot.find({ fecha: { $gte: desde } }).sort({ fecha: 1 });
  res.json(snapshots);
});

module.exports = router;
