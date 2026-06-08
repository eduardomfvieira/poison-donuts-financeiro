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
// Usa COALESCE para não sobrescrever campos não enviados (ex: ao marcar como paga)
router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { descricao, fornecedor, valor, data_emissao, vencimento, codigo_barras, categoria, observacao, pago, data_pagamento, despesa_vinculada_id, valor_pago } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE contas_pagar
       SET descricao        = COALESCE($1,  descricao),
           fornecedor       = COALESCE($2,  fornecedor),
           valor            = COALESCE($3,  valor),
           data_emissao     = COALESCE($4,  data_emissao),
           vencimento       = COALESCE($5,  vencimento),
           codigo_barras    = COALESCE($6,  codigo_barras),
           categoria        = COALESCE($7,  categoria),
           observacao       = COALESCE($8,  observacao),
           pago             = COALESCE($9,  pago),
           data_pagamento   = COALESCE($10, data_pagamento),
           despesa_vinculada_id = COALESCE($11, despesa_vinculada_id),
           valor_pago       = COALESCE($13, valor_pago)
       WHERE id=$12 RETURNING *`,
      [
        descricao   ?? null,
        fornecedor  ?? null,
        valor       ?? null,
        data_emissao      ?? null,
        vencimento        ?? null,
        codigo_barras     ?? null,
        categoria         ?? null,
        observacao        ?? null,
        pago        !== undefined ? pago : null,
        data_pagamento    ?? null,
        despesa_vinculada_id ?? null,
        req.params.id,
        valor_pago  ?? null,
      ]
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
