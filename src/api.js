// Camada de API — substitui localStorage por chamadas ao backend
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function token() {
  return localStorage.getItem('pd_token');
}

function headers() {
  return {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
  };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

export const api = {
  // Auth
  login: (email, senha) => req('POST', '/api/auth/login', { email, senha }),
  register: (nome, email, senha) => req('POST', '/api/auth/register', { nome, email, senha }),
  me: () => req('GET', '/api/auth/me'),

  // Despesas
  getDespesas: (mes) => req('GET', `/api/despesas${mes ? `?mes=${mes}` : ''}`),
  addDespesa: (d) => req('POST', '/api/despesas', d),
  updateDespesa: (id, d) => req('PUT', `/api/despesas/${id}`, d),
  deleteDespesa: (id) => req('DELETE', `/api/despesas/${id}`),

  // Contas a pagar
  getContas: () => req('GET', '/api/contas'),
  addConta: (c) => req('POST', '/api/contas', c),
  updateConta: (id, c) => req('PUT', `/api/contas/${id}`, c),
  deleteConta: (id) => req('DELETE', `/api/contas/${id}`),

  // Categorias
  getCategorias: () => req('GET', '/api/categorias'),
};
