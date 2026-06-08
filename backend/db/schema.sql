-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  grupo TEXT NOT NULL DEFAULT 'Geral'
);

-- Insere categorias padrão (ignora se já existirem)
INSERT INTO categorias (nome, grupo) VALUES
  ('Insumos', 'Produção'), ('Embalagens', 'Produção'),
  ('Fornecedores', 'Operacional'), ('Aluguel', 'Fixos'),
  ('Energia', 'Fixos'), ('Água', 'Fixos'),
  ('Internet/Telefone', 'Fixos'), ('Salários', 'RH'),
  ('Benefícios', 'RH'), ('Vale Transporte', 'RH'),
  ('Férias', 'RH'), ('13º Salário', 'RH'),
  ('Rescisão', 'RH'), ('FGTS Rescisório', 'RH'),
  ('Pró-labore', 'Sócios'), ('Dividendos', 'Sócios'),
  ('Impostos', 'Fiscal'), ('Marketing', 'Comercial'),
  ('Manutenção', 'Operacional'), ('Delivery/iFood', 'Comercial'),
  ('Cartão de Crédito', 'Financeiro'), ('Royalties', 'Financeiro'),
  ('Outras', 'Geral')
ON CONFLICT (nome) DO NOTHING;

-- Despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outras',
  valor NUMERIC(12,2) NOT NULL,
  fornecedor TEXT,
  forma_pagamento TEXT NOT NULL DEFAULT 'PIX',
  observacao TEXT,
  conta_origem_id UUID,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Contas a pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  fornecedor TEXT,
  valor NUMERIC(12,2) NOT NULL,
  data_emissao DATE,
  vencimento DATE NOT NULL,
  codigo_barras TEXT,
  categoria TEXT,
  observacao TEXT,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  despesa_vinculada_id UUID REFERENCES despesas(id) ON DELETE SET NULL,
  valor_pago NUMERIC(12,2),
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Migração segura: adiciona coluna se a tabela já existia antes desta versão
ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(12,2);
