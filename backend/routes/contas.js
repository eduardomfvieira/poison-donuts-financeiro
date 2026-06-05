const router = require('express').Router();
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/contas
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { rows } = await pool.query('SELECT * FROM contas_pagar ORDER BY vencimento ASC, criado_em DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contas
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { descricao, fornecedor, valor, data_emissao, vencimento, codigo_barras, categoria, observacao } = req.body;
  if (!descricao || !valor || !vencimento) return res.status(400).json({ error: 'Campos obrigatórios: descricao, valor, vencimento' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO contas_pagar (descricao, fornecedor, valor, data_emissao, vencimento, codigo_barras, categoria, observacao, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [descricao, fornecedor || null, valor, data_emissao || null, vencimento, codigo_barras || null, categoria || null, observacao || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contas/:id
router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { descricao, fornecedor, valor, data_emissao, vencimento, codigo_barras, categoria, observacao, pago, data_pagamento, despesa_vinculada_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE contas_pagar
       SET descricao=$1, fornecedor=$2, valor=$3, data_emissao=$4, vencimento=$5,
           codigo_barras=$6, categoria=$7, observacao=$8, pago=$9, data_pagamento=$10, despesa_vinculada_id=$11
       WHERE id=$12 RETURNING *`,
      [descricao, fornecedor, valor, data_emissao, vencimento, codigo_barras, categoria, observacao, pago, data_pagamento, despesa_vinculada_id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contas/:id
router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    await pool.query('DELETE FROM contas_pagar WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
