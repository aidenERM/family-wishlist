require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./db/mongo');
const familiaRoutes = require('./routes/familia');
const deseosRoutes = require('./routes/deseos');
const configRoutes = require('./routes/config');
const historialRoutes = require('./routes/historial');
const consultaRoutes = require('./routes/consulta');
const snapshotsRoutes = require('./routes/snapshots');
const pushRoutes = require('./routes/push');
const cronJobs = require('./services/cronJobs');

const app = express();

app.use(express.json({ limit: '8mb' }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/familia', familiaRoutes);
app.use('/api/deseos', deseosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/consulta', consultaRoutes);
app.use('/api/snapshots', snapshotsRoutes);
app.use('/api/push', pushRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'JSON invalido en el cuerpo de la solicitud' });
  }
  res.status(500).json({ error: 'internal_error' });
});

const PORT = process.env.PORT || 4000;

connect().then(() => {
  app.listen(PORT, () => console.log(`family-wishlist-api listening on port ${PORT}`));
  cronJobs.start();
});
