const router = require('express').Router();
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/despesas?mes=2026-06
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { mes } = req.query;
  try {
    let query = 'SELECT * FROM despesas';
    const params = [];
    if (mes) {
      query += ' WHERE to_char(data, \'YYYY-MM\') = $1';
      params.push(mes);
    }
    query += ' ORDER BY data DESC, criado_em DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/despesas
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { data, descricao, categoria, valor, fornecedor, forma_pagamento, observacao, conta_origem_id } = req.body;
  if (!data || !descricao || !valor) return res.status(400).json({ error: 'Campos obrigatórios: data, descricao, valor' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO despesas (data, descricao, categoria, valor, fornecedor, forma_pagamento, observacao, conta_origem_id, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [data, descricao, categoria || 'Outras', valor, fornecedor || null, forma_pagamento || 'PIX', observacao || null, conta_origem_id || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/despesas/:id
router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { data, descricao, categoria, valor, fornecedor, forma_pagamento, observacao } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE despesas SET data=$1, descricao=$2, categoria=$3, valor=$4, fornecedor=$5, forma_pagamento=$6, observacao=$7
       WHERE id=$8 RETURNING *`,
      [data, descricao, categoria, valor, fornecedor, forma_pagamento, observacao, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/despesas/:id
router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM despesas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
