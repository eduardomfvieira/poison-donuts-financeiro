require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Banco de dados ----------
// Railway PostgreSQL não requer SSL na conexão Node.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Testa a conexão e cria as tabelas se não existirem
pool.connect()
  .then(client => {
    console.log('✅ Conectado ao PostgreSQL');
    return client.query(require('fs').readFileSync(__dirname + '/db/schema.sql', 'utf8'))
      .finally(() => client.release());
  })
  .then(() => console.log('✅ Schema aplicado'))
  .catch(err => console.error('❌ Erro no banco:', err.message));

// Exporta o pool para as rotas
app.locals.pool = pool;

// ---------- Middlewares ----------
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ---------- Rotas ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/despesas', require('./routes/despesas'));
app.use('/api/contas', require('./routes/contas'));
app.use('/api/categorias', require('./routes/categorias'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date() }));

// ---------- Start ----------
app.listen(PORT, () => console.log(`🍩 Poison Donuts API rodando na porta ${PORT}`));
