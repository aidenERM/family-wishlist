function requireFamilyKey(req, res, next) {
  const key = req.header('x-family-key');
  if (!key || key !== process.env.FAMILY_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

module.exports = requireFamilyKey;
