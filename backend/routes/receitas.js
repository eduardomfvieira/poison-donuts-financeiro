const router = require('express').Router();
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/receitas — retorna todas (todas as datas, para gráfico comparativo)
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query('SELECT * FROM receitas ORDER BY data DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receitas — upsert por data (cria ou atualiza)
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { data, loja_fisica, metro, delivery } = req.body;
  if (!data) return res.status(400).json({ error: 'data obrigatória' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO receitas (data, loja_fisica, metro, delivery, criado_por)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (data) DO UPDATE SET
         loja_fisica = EXCLUDED.loja_fisica,
         metro = EXCLUDED.metro,
         delivery = EXCLUDED.delivery
       RETURNING *`,
      [data, Number(loja_fisica) || 0, Number(metro) || 0, Number(delivery) || 0, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/receitas/:id
router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM receitas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
