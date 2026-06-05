const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Preencha todos os campos' });

  const pool = req.app.locals.pool;
  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows.length > 0) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email.toLowerCase(), hash]
    );
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, usuario: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Preencha e-mail e senha' });

  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

    const ok = await bcrypt.compare(senha, rows[0].senha_hash);
    if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, usuario: { id: rows[0].id, nome: rows[0].nome, email: rows[0].email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const pool = req.app.locals.pool;
  const { rows } = await pool.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
});

module.exports = router;
