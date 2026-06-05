const router = require('express').Router();
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/categorias
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query('SELECT nome, grupo FROM categorias ORDER BY grupo, nome');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
