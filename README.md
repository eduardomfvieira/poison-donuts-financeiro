# 🍩 Poison Donuts — Sistema Financeiro

Sistema de controle de **despesas** e **contas a pagar** da Poison Donuts (Ipanema, RJ).

Construído com React + Vite. Identidade visual: tema escuro, rosa `#FF3D8A`, fonte Bricolage Grotesque.

---

## Funcionalidades

- **Dashboard** — KPIs do mês (total gasto, contas em aberto, vencidas), gráfico de área diária, pizza por categoria e ranking
- **Despesas** — Cadastro com data, descrição, categoria, fornecedor, forma de pagamento e observação. Exportação CSV compatível com Excel
- **Contas a Pagar** — Cards com status automático (em aberto / próxima / vencida / paga), campo de boleto com formatação e botão Copiar, edição via modal, fluxo de pagamento com data

### Destaques

- Ao marcar uma conta como paga → cria despesa vinculada automaticamente (tag 🔗 boleto)
- Ao reabrir uma conta paga → remove a despesa vinculada
- Edição de conta atualiza a despesa vinculada se já estiver paga
- Armazenamento local via `localStorage` (ver seção abaixo sobre próximos passos)

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

---

## Estrutura do projeto

```
poison-donuts-financeiro/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── main.jsx       # Entrada da aplicação
    └── App.jsx        # Componente principal (Dashboard, Despesas, Contas)
```

---

## Próximos passos — migração para produção

O app atualmente usa `localStorage`, o que significa que **os dados ficam apenas no navegador de quem está usando**. Para uso real com a equipe (dados compartilhados, acesso pelo celular), o plano é:

1. **Backend Node.js/Express** — API REST para salvar e buscar dados
2. **Banco de dados PostgreSQL** — tabelas: `despesas`, `contas_pagar`, `usuarios`, `categorias`
3. **Autenticação JWT** — login por email e senha
4. **Deploy no Railway** — frontend + backend + banco na mesma plataforma

A camada de persistência foi isolada no objeto `storage` dentro de `App.jsx` para facilitar essa migração — basta substituir `localStorage.getItem/setItem` por chamadas `fetch()` à API.

---

## Categorias de despesas

| Categoria | Grupo |
|---|---|
| Insumos | Produção |
| Embalagens | Produção |
| Fornecedores | Operacional |
| Aluguel | Fixos |
| Energia | Fixos |
| Água | Fixos |
| Internet/Telefone | Fixos |
| Salários | RH |
| Benefícios | RH |
| Vale Transporte | RH |
| Férias | RH |
| 13º Salário | RH |
| Pró-labore | Sócios |
| Dividendos | Sócios |
| Impostos | Fiscal |
| Marketing | Comercial |
| Manutenção | Operacional |
| Delivery/iFood | Comercial |
| Cartão de Crédito | Financeiro |
| Royalties | Financeiro |
| Outras | Geral |
