require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./db/mongo');
const familiaRoutes = require('./routes/familia');
const deseosRoutes = require('./routes/deseos');
const configRoutes = require('./routes/config');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/familia', familiaRoutes);
app.use('/api/deseos', deseosRoutes);
app.use('/api/config', configRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = process.env.PORT || 4000;

connect().then(() => {
  app.listen(PORT, () => console.log(`family-wishlist-api listening on port ${PORT}`));
});
