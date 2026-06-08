import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingDown, AlertCircle, CheckCircle2, Clock, Plus, Trash2, Download, FileText, BarChart3, CreditCard, Copy, Check, Pencil, LogOut } from 'lucide-react';

const TOKEN_KEY = 'pd_token';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CATEGORIAS = ['Insumos', 'Embalagens', 'Fornecedores', 'Aluguel', 'Energia', 'Água', 'Internet/Telefone', 'Salários', 'Benefícios', 'Vale Transporte', 'Férias', '13º Salário', 'Rescisão', 'FGTS Rescisório', 'Pró-labore', 'Dividendos', 'Impostos', 'Marketing', 'Manutenção', 'Delivery/iFood', 'Cartão de Crédito', 'Royalties', 'Outras'];

const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const formatDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};
const today = () => new Date().toISOString().slice(0, 10);

const formatBoleto = (codigo) => {
  if (!codigo) return '';
  const clean = codigo.replace(/\D/g, '');
  if (clean.length === 47) return `${clean.slice(0,5)}.${clean.slice(5,10)} ${clean.slice(10,15)}.${clean.slice(15,21)} ${clean.slice(21,26)}.${clean.slice(26,32)} ${clean.slice(32,33)} ${clean.slice(33)}`;
  if (clean.length === 48) return `${clean.slice(0,11)} ${clean.slice(11,23)} ${clean.slice(23,35)} ${clean.slice(35)}`;
  return clean;
};

// ---------------------------------------------------------------------------
// Camada de API
// ---------------------------------------------------------------------------
function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function apiFetch(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

// Normaliza campos snake_case do banco para camelCase
function mapDespesa(d) {
  return {
    id: d.id,
    data: d.data ? d.data.slice(0, 10) : '',
    descricao: d.descricao,
    categoria: d.categoria,
    valor: Number(d.valor),
    fornecedor: d.fornecedor || '',
    formaPagamento: d.forma_pagamento || 'PIX',
    observacao: d.observacao || '',
    contaOrigemId: d.conta_origem_id || null,
  };
}

function mapConta(c) {
  return {
    id: c.id,
    descricao: c.descricao,
    fornecedor: c.fornecedor || '',
    valor: Number(c.valor),
    dataEmissao: c.data_emissao ? c.data_emissao.slice(0, 10) : '',
    vencimento: c.vencimento ? c.vencimento.slice(0, 10) : '',
    codigoBarras: c.codigo_barras || '',
    categoria: c.categoria || '',
    observacao: c.observacao || '',
    pago: c.pago,
    dataPagamento: c.data_pagamento ? c.data_pagamento.slice(0, 10) : null,
    despesaVinculadaId: c.despesa_vinculada_id || null,
  };
}

// ---------------------------------------------------------------------------
// Tela de login / cadastro
// ---------------------------------------------------------------------------
function AuthScreen({ screen, setScreen, onLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      let res;
      if (screen === 'login') {
        res = await apiFetch('POST', '/api/auth/login', { email, senha });
      } else {
        res = await apiFetch('POST', '/api/auth/register', { nome, email, senha });
      }
      onLogin(res.token);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <style>{styles}</style>
      <div className="auth-card">
        <div className="auth-brand">
          <svg viewBox="0 0 40 40" width="48" height="48">
            <circle cx="20" cy="20" r="16" fill="#ff3d8a" />
            <circle cx="20" cy="20" r="6" fill="#1a0a14" />
            <circle cx="14" cy="14" r="1.5" fill="#fde047" />
            <circle cx="26" cy="13" r="1.5" fill="#22d3ee" />
            <circle cx="27" cy="25" r="1.5" fill="#fde047" />
            <circle cx="13" cy="26" r="1.5" fill="#a3e635" />
            <circle cx="20" cy="11" r="1.5" fill="#22d3ee" />
          </svg>
          <div>
            <div className="auth-title">POISON DONUTS</div>
            <div className="auth-sub">Financeiro · Ipanema</div>
          </div>
        </div>
        <form onSubmit={submit} className="auth-form">
          <h2 className="auth-h2">{screen === 'login' ? 'Entrar' : 'Criar conta'}</h2>
          {screen === 'register' && (
            <div className="form-field">
              <label>Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>
          )}
          <div className="form-field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required />
          </div>
          <div className="form-field">
            <label>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          {erro && <div className="auth-erro">{erro}</div>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Aguarde...' : screen === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <div className="auth-toggle">
          {screen === 'login' ? (
            <>Ainda não tem conta? <button className="link-btn" onClick={() => { setScreen('register'); setErro(''); }}>Criar conta</button></>
          ) : (
            <>Já tem conta? <button className="link-btn" onClick={() => { setScreen('login'); setErro(''); }}>Entrar</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App principal
// ---------------------------------------------------------------------------
export default function App() {
  const [authToken, setAuthToken] = useState(getToken());
  const [authScreen, setAuthScreen] = useState('login');

  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [tab, setTab] = useState('dashboard');
  const [filtroMes, setFiltroMes] = useState(today().slice(0, 7));

  const loadAll = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [d, c] = await Promise.all([
        apiFetch('GET', `/api/despesas`),
        apiFetch('GET', '/api/contas'),
      ]);
      setDespesas(d.map(mapDespesa));
      setContas(c.map(mapConta));
    } catch (e) {
      if (e.message.toLowerCase().includes('token') || e.message.includes('401')) {
        logout();
      } else {
        setApiError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [authToken]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setDespesas([]);
    setContas([]);
  };

  const onLogin = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="donut-loader"><div className="donut-ring"></div></div>
        <div>Carregando dados da Poison...</div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!authToken) {
    return <AuthScreen screen={authScreen} setScreen={setAuthScreen} onLogin={onLogin} />;
  }

  const despesasFiltradas = despesas.filter(d => d.data && d.data.startsWith(filtroMes));
  const totalMes = despesasFiltradas.reduce((s, d) => s + Number(d.valor), 0);
  const contasAbertas = contas.filter(c => !c.pago);

  return (
    <div className="app">
      <style>{styles}</style>

      <header className="header">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 40 40" width="40" height="40">
              <circle cx="20" cy="20" r="16" fill="#ff3d8a" />
              <circle cx="20" cy="20" r="6" fill="#1a0a14" />
              <circle cx="14" cy="14" r="1.5" fill="#fde047" />
              <circle cx="26" cy="13" r="1.5" fill="#22d3ee" />
              <circle cx="27" cy="25" r="1.5" fill="#fde047" />
              <circle cx="13" cy="26" r="1.5" fill="#a3e635" />
              <circle cx="20" cy="11" r="1.5" fill="#22d3ee" />
            </svg>
          </div>
          <div>
            <h1>POISON DONUTS</h1>
            <p>Financeiro · Ipanema · <span className={syncing ? 'sync-saving' : 'sync-ok'}>{syncing ? 'salvando…' : 'sincronizado'}</span></p>
          </div>
        </div>
        <div className="header-actions">
          <input
            type="month"
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            className="month-picker"
          />
          <button className="btn-soft" onClick={logout} title="Sair"><LogOut size={14} /></button>
        </div>
      </header>

      <nav className="tabs">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'despesas', label: 'Despesas', icon: FileText },
          { id: 'contas', label: 'Contas a Pagar', icon: CreditCard },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={16} /><span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {apiError && (
        <div className="api-error">
          <AlertCircle size={16} /> Erro ao carregar dados: {apiError}
          <button className="link-btn" onClick={loadAll} style={{ marginLeft: 12 }}>Tentar novamente</button>
        </div>
      )}

      <main className="main">
        {tab === 'dashboard' && (
          <Dashboard
            despesasFiltradas={despesasFiltradas}
            totalMes={totalMes}
            contasAbertas={contasAbertas}
            filtroMes={filtroMes}
          />
        )}
        {tab === 'despesas' && (
          <Despesas
            despesas={despesas}
            setDespesas={setDespesas}
            setSyncing={setSyncing}
            despesasFiltradas={despesasFiltradas}
            totalMes={totalMes}
            filtroMes={filtroMes}
          />
        )}
        {tab === 'contas' && (
          <Contas
            contas={contas}
            setContas={setContas}
            despesas={despesas}
            setDespesas={setDespesas}
            setSyncing={setSyncing}
          />
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ despesasFiltradas, totalMes, contasAbertas }) {
  const porCategoria = useMemo(() => {
    const map = {};
    despesasFiltradas.forEach(d => { map[d.categoria] = (map[d.categoria] || 0) + Number(d.valor); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [despesasFiltradas]);

  const evolucaoDiaria = useMemo(() => {
    const days = {};
    despesasFiltradas.forEach(d => { const dia = d.data.slice(8, 10); days[dia] = (days[dia] || 0) + Number(d.valor); });
    return Object.entries(days).map(([dia, valor]) => ({ dia, valor })).sort((a, b) => a.dia.localeCompare(b.dia));
  }, [despesasFiltradas]);

  const COLORS = ['#ff3d8a', '#ff7eb6', '#fde047', '#22d3ee', '#a3e635', '#c084fc', '#fb923c', '#f472b6'];
  const contasVencidas = contasAbertas.filter(c => c.vencimento < today());
  const contasProximas = contasAbertas.filter(c => c.vencimento >= today() && c.vencimento <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const totalContasAbertas = contasAbertas.reduce((s, c) => s + Number(c.valor), 0);
  const totalVencidas = contasVencidas.reduce((s, c) => s + Number(c.valor), 0);

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <div className="kpi kpi-main">
          <div className="kpi-label">Total gasto no mês</div>
          <div className="kpi-value-big">{formatBRL(totalMes)}</div>
          <div className="kpi-sub">{despesasFiltradas.length} lançamento{despesasFiltradas.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon kpi-icon-warn"><Clock size={18} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Contas em aberto</div>
            <div className="kpi-value">{formatBRL(totalContasAbertas)}</div>
            <div className="kpi-sub">{contasAbertas.length} conta{contasAbertas.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-icon kpi-icon-danger"><AlertCircle size={18} /></div>
          <div className="kpi-content">
            <div className="kpi-label">Vencidas</div>
            <div className="kpi-value">{formatBRL(totalVencidas)}</div>
            <div className="kpi-sub">{contasVencidas.length} conta{contasVencidas.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {(contasVencidas.length > 0 || contasProximas.length > 0) && (
        <div className="alerts">
          {contasVencidas.length > 0 && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <div><strong>{contasVencidas.length} conta(s) vencida(s)</strong> — {formatBRL(totalVencidas)}</div>
            </div>
          )}
          {contasProximas.length > 0 && (
            <div className="alert alert-warning">
              <Clock size={18} />
              <div><strong>{contasProximas.length} conta(s) vencem em 7 dias</strong> — {formatBRL(contasProximas.reduce((s, c) => s + Number(c.valor), 0))}</div>
            </div>
          )}
        </div>
      )}

      <div className="cards-row">
        <div className="card">
          <h3>Gastos por dia</h3>
          {evolucaoDiaria.length === 0 ? (
            <div className="empty">Sem despesas neste mês</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={evolucaoDiaria}>
                <defs>
                  <linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff3d8a" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#ff3d8a" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a24" />
                <XAxis dataKey="dia" stroke="#8a7080" style={{ fontSize: 12 }} />
                <YAxis stroke="#8a7080" style={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ background: '#1a0a14', border: '1px solid #ff3d8a', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="valor" stroke="#ff3d8a" fill="url(#gPink)" strokeWidth={2} name="Gasto" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3>Por categoria</h3>
          {porCategoria.length === 0 ? (
            <div className="empty">Sem despesas neste mês</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>
                  {porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#1a0a14" strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ background: '#1a0a14', border: '1px solid #ff3d8a', borderRadius: 8, color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#d4c4cf' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Top categorias do mês</h3>
        {porCategoria.length === 0 ? (
          <div className="empty">Sem dados</div>
        ) : (
          <div className="ranking">
            {porCategoria.slice(0, 6).map((c, i) => {
              const pct = (c.value / totalMes) * 100;
              return (
                <div key={c.name} className="rank-row">
                  <div className="rank-pos" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</div>
                  <div className="rank-content">
                    <div className="rank-header">
                      <span className="rank-name">{c.name}</span>
                      <span className="rank-value">{formatBRL(c.value)}</span>
                    </div>
                    <div className="rank-bar">
                      <div className="rank-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}></div>
                    </div>
                    <div className="rank-pct">{pct.toFixed(1)}% do total</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Despesas
// ---------------------------------------------------------------------------
function Despesas({ despesas, setDespesas, setSyncing, despesasFiltradas, totalMes, filtroMes }) {
  const [form, setForm] = useState({ data: today(), descricao: '', categoria: '', valor: '', fornecedor: '', formaPagamento: 'PIX', observacao: '' });
  const [confirmar, setConfirmar] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const add = async () => {
    if (!form.descricao || !form.valor || !form.categoria) return;
    setSalvando(true);
    setSyncing(true);
    try {
      const nova = await apiFetch('POST', '/api/despesas', {
        data: form.data,
        descricao: form.descricao,
        categoria: form.categoria,
        valor: Number(form.valor),
        fornecedor: form.fornecedor || null,
        forma_pagamento: form.formaPagamento,
        observacao: form.observacao || null,
      });
      setDespesas([mapDespesa(nova), ...despesas]);
      setForm({ ...form, descricao: '', valor: '', fornecedor: '', observacao: '' });
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSalvando(false);
      setSyncing(false);
    }
  };

  const remover = async () => {
    if (!confirmar) return;
    setSyncing(true);
    try {
      await apiFetch('DELETE', `/api/despesas/${confirmar.id}`);
      setDespesas(despesas.filter(d => d.id !== confirmar.id));
      setConfirmar(null);
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Fornecedor', 'Forma Pagamento', 'Valor', 'Observacao'];
    const rows = despesasFiltradas.map(d =>
      [d.data, `"${d.descricao}"`, d.categoria, `"${d.fornecedor || ''}"`, d.formaPagamento, Number(d.valor).toFixed(2).replace('.', ','), `"${d.observacao || ''}"`].join(';')
    );
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `poison_despesas_${filtroMes}.csv`; a.click();
  };

  return (
    <div>
      <div className="card">
        <h3>Nova despesa</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Data</label>
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
          </div>
          <div className="form-field flex-2">
            <label>Descrição</label>
            <input type="text" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Farinha de trigo, açúcar" />
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              <option value="">Selecione</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Fornecedor</label>
            <input type="text" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} placeholder="Opcional" />
          </div>
          <div className="form-field">
            <label>Valor (R$)</label>
            <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
          </div>
          <div className="form-field">
            <label>Pagamento</label>
            <select value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })}>
              <option>PIX</option><option>Dinheiro</option><option>Débito</option><option>Crédito</option><option>Boleto</option><option>Transferência</option>
            </select>
          </div>
          <div className="form-field flex-2">
            <label>Observação</label>
            <input type="text" value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} placeholder="Opcional" />
          </div>
          <button className="btn-primary" onClick={add} disabled={salvando}><Plus size={16} /> {salvando ? 'Salvando...' : 'Adicionar'}</button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 0 }}>Despesas do mês — {formatBRL(totalMes)}</h3>
          {despesasFiltradas.length > 0 && <button className="btn-soft" onClick={exportCSV}><Download size={14} /> CSV</button>}
        </div>
        {despesasFiltradas.length === 0 ? (
          <div className="empty">Nenhuma despesa neste período</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Fornecedor</th><th>Pgto</th><th>Valor</th><th></th></tr></thead>
              <tbody>
                {despesasFiltradas.map(d => (
                  <tr key={d.id}>
                    <td>{formatDate(d.data)}</td>
                    <td>
                      <div>{d.descricao}{d.contaOrigemId && <span className="auto-tag" title="Gerada ao marcar conta como paga">🔗 boleto</span>}</div>
                      {d.observacao && <div className="muted">{d.observacao}</div>}
                    </td>
                    <td><span className="tag">{d.categoria}</span></td>
                    <td>{d.fornecedor || '—'}</td>
                    <td><span className="pgto-tag">{d.formaPagamento}</span></td>
                    <td className="val-neg">{formatBRL(d.valor)}</td>
                    <td><button className="icon-btn" onClick={() => setConfirmar(d)} title="Excluir"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmar && (
        <div className="modal-overlay" onClick={() => setConfirmar(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Excluir despesa?</h3>
            <p className="modal-text"><strong>{confirmar.descricao}</strong><br /><span className="muted">{formatDate(confirmar.data)} · {formatBRL(confirmar.valor)}</span></p>
            <p className="modal-warn">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn-soft" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button className="btn-danger" onClick={remover}><Trash2 size={14} /> Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contas a pagar
// ---------------------------------------------------------------------------
function Contas({ contas, setContas, despesas, setDespesas, setSyncing }) {
  const [form, setForm] = useState({ descricao: '', fornecedor: '', valor: '', dataEmissao: today(), vencimento: today(), codigoBarras: '', categoria: '', observacao: '' });
  const [copiado, setCopiado] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [pagarModal, setPagarModal] = useState(null);
  const [dataPagamentoInput, setDataPagamentoInput] = useState(today());
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const add = async () => {
    if (!form.descricao || !form.valor) return;
    setSalvando(true);
    setSyncing(true);
    try {
      const nova = await apiFetch('POST', '/api/contas', {
        descricao: form.descricao,
        fornecedor: form.fornecedor || null,
        valor: Number(form.valor),
        data_emissao: form.dataEmissao || null,
        vencimento: form.vencimento,
        codigo_barras: form.codigoBarras.replace(/\D/g, '') || null,
        categoria: form.categoria || null,
        observacao: form.observacao || null,
      });
      setContas([mapConta(nova), ...contas]);
      setForm({ descricao: '', fornecedor: '', valor: '', dataEmissao: today(), vencimento: today(), codigoBarras: '', categoria: '', observacao: '' });
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSalvando(false);
      setSyncing(false);
    }
  };

  const confirmarPagamento = async () => {
    if (!pagarModal) return;
    const conta = pagarModal;
    const dataPag = dataPagamentoInput || today();
    setSyncing(true);
    try {
      // Cria a despesa vinculada
      const novaDespesa = await apiFetch('POST', '/api/despesas', {
        data: dataPag,
        descricao: conta.descricao,
        categoria: conta.categoria || 'Outras',
        valor: Number(conta.valor),
        fornecedor: conta.fornecedor || null,
        forma_pagamento: conta.codigoBarras ? 'Boleto' : 'PIX',
        observacao: conta.observacao || null,
      });
      // Atualiza a conta como paga
      const contaAtualizada = await apiFetch('PUT', `/api/contas/${conta.id}`, {
        pago: true,
        data_pagamento: dataPag,
        despesa_vinculada_id: novaDespesa.id,
      });
      setContas(contas.map(c => c.id === conta.id ? mapConta(contaAtualizada) : c));
      setDespesas([mapDespesa(novaDespesa), ...despesas]);
      setPagarModal(null);
    } catch (e) {
      alert('Erro ao confirmar pagamento: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const reabrirConta = async (id) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;
    setSyncing(true);
    try {
      const atualizada = await apiFetch('PUT', `/api/contas/${id}`, {
        pago: false,
        data_pagamento: null,
        despesa_vinculada_id: null,
      });
      setContas(contas.map(c => c.id === id ? mapConta(atualizada) : c));
      if (conta.despesaVinculadaId) {
        await apiFetch('DELETE', `/api/despesas/${conta.despesaVinculadaId}`);
        setDespesas(despesas.filter(d => d.id !== conta.despesaVinculadaId));
      }
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const salvarEdicao = async () => {
    if (!editando || !editando.descricao || !editando.valor) return;
    setSyncing(true);
    try {
      const atualizada = await apiFetch('PUT', `/api/contas/${editando.id}`, {
        descricao: editando.descricao,
        fornecedor: editando.fornecedor || null,
        valor: Number(editando.valor),
        data_emissao: editando.dataEmissao || null,
        vencimento: editando.vencimento,
        codigo_barras: (editando.codigoBarras || '').replace(/\D/g, '') || null,
        categoria: editando.categoria || null,
        observacao: editando.observacao || null,
        pago: editando.pago,
        data_pagamento: editando.dataPagamento || null,
      });
      setContas(contas.map(c => c.id === editando.id ? mapConta(atualizada) : c));
      // Se conta paga, também atualiza a despesa vinculada
      if (editando.pago && editando.despesaVinculadaId) {
        const despAtualizada = await apiFetch('PUT', `/api/despesas/${editando.despesaVinculadaId}`, {
          data: editando.dataPagamento,
          descricao: editando.descricao,
          categoria: editando.categoria || 'Outras',
          valor: Number(editando.valor),
          fornecedor: editando.fornecedor || null,
          observacao: editando.observacao || null,
        });
        setDespesas(despesas.map(d => d.id === editando.despesaVinculadaId ? mapDespesa(despAtualizada) : d));
      }
      setEditando(null);
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const removerConta = async () => {
    if (!confirmar) return;
    setSyncing(true);
    try {
      await apiFetch('DELETE', `/api/contas/${confirmar.id}`);
      setContas(contas.filter(c => c.id !== confirmar.id));
      setConfirmar(null);
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const copiarBoleto = async (codigo, id) => {
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = codigo; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiado(id);
    setTimeout(() => setCopiado(null), 1500);
  };

  const abertas = contas.filter(c => !c.pago).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const pagas = contas.filter(c => c.pago).sort((a, b) => (b.dataPagamento || '').localeCompare(a.dataPagamento || ''));

  return (
    <div>
      <div className="card">
        <h3>Nova conta a pagar</h3>
        <div className="form-grid">
          <div className="form-field flex-2">
            <label>Descrição</label>
            <input type="text" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Boleto fornecedor X — NF 1234" />
          </div>
          <div className="form-field">
            <label>Fornecedor</label>
            <input type="text" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              <option value="">Selecione</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Valor (R$)</label>
            <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Data de emissão</label>
            <input type="date" value={form.dataEmissao} onChange={e => setForm({ ...form, dataEmissao: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Vencimento</label>
            <input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
          </div>
          <div className="form-field flex-full">
            <label>Código de barras (boleto)</label>
            <input type="text" value={form.codigoBarras} onChange={e => setForm({ ...form, codigoBarras: e.target.value })} placeholder="Cole aqui o código do boleto (47 ou 48 dígitos)" className="mono" />
            {form.codigoBarras && <div className="boleto-preview">{formatBoleto(form.codigoBarras)}</div>}
          </div>
          <div className="form-field flex-2">
            <label>Observação</label>
            <input type="text" value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} placeholder="Opcional" />
          </div>
          <button className="btn-primary" onClick={add} disabled={salvando}><Plus size={16} /> {salvando ? 'Salvando...' : 'Adicionar'}</button>
        </div>
      </div>

      <div className="card">
        <h3>Em aberto ({abertas.length}) — {formatBRL(abertas.reduce((s, c) => s + Number(c.valor), 0))}</h3>
        {abertas.length === 0 ? (
          <div className="empty">Nenhuma conta em aberto 🎉</div>
        ) : (
          <div className="contas-list">
            {abertas.map(c => {
              const vencida = c.vencimento < today();
              const proxima = !vencida && c.vencimento <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
              return (
                <div key={c.id} className={`conta-card ${vencida ? 'conta-vencida' : proxima ? 'conta-proxima' : ''}`}>
                  <div className="conta-header">
                    <div>
                      <div className="conta-desc">{c.descricao}</div>
                      {c.fornecedor && <div className="muted">{c.fornecedor}</div>}
                    </div>
                    <div className="conta-valor">{formatBRL(c.valor)}</div>
                  </div>
                  <div className="conta-meta">
                    <span className={`status-pill ${vencida ? 'pill-vencida' : proxima ? 'pill-proxima' : 'pill-aberta'}`}>
                      {vencida ? '⚠ Vencida' : proxima ? '⏰ Próxima' : 'Em aberto'}
                    </span>
                    {c.dataEmissao && <span className="data-info">Emissão: <strong>{formatDate(c.dataEmissao)}</strong></span>}
                    <span className="data-info">Vence: <strong>{formatDate(c.vencimento)}</strong></span>
                    {c.categoria && <span className="tag-small">{c.categoria}</span>}
                  </div>
                  {c.codigoBarras && (
                    <div className="boleto-row">
                      <div className="boleto-code">{formatBoleto(c.codigoBarras)}</div>
                      <button className="btn-copy" onClick={() => copiarBoleto(c.codigoBarras, c.id)}>
                        {copiado === c.id ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                      </button>
                    </div>
                  )}
                  {c.observacao && <div className="conta-obs">{c.observacao}</div>}
                  <div className="conta-actions">
                    <button className="btn-pay" onClick={() => { setDataPagamentoInput(today()); setPagarModal(c); }}><CheckCircle2 size={14} /> Marcar como paga</button>
                    <button className="btn-edit" onClick={() => setEditando({ ...c })}><Pencil size={14} /> Editar</button>
                    <button className="icon-btn" onClick={() => setConfirmar(c)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagas.length > 0 && (
        <div className="card">
          <h3>Pagas recentemente ({pagas.length})</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Pago em</th><th>Descrição</th><th>Emissão</th><th>Vencimento</th><th>Valor</th><th></th></tr></thead>
              <tbody>
                {pagas.slice(0, 30).map(c => {
                  const atrasado = c.dataPagamento && c.vencimento && c.dataPagamento > c.vencimento;
                  return (
                    <tr key={c.id}>
                      <td><strong>{formatDate(c.dataPagamento || c.vencimento)}</strong>{atrasado && <div className="muted-warn">após vencimento</div>}</td>
                      <td><div>{c.descricao}</div>{c.fornecedor && <div className="muted">{c.fornecedor}</div>}</td>
                      <td>{c.dataEmissao ? formatDate(c.dataEmissao) : '—'}</td>
                      <td>{formatDate(c.vencimento)}</td>
                      <td>{formatBRL(c.valor)}</td>
                      <td>
                        <button className="btn-soft" onClick={() => reabrirConta(c.id)}>Reabrir</button>
                        <button className="btn-soft" onClick={() => setEditando({ ...c })}><Pencil size={12} /></button>
                        <button className="icon-btn" onClick={() => setConfirmar(c)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <h3>Editar conta</h3>
            <div className="form-grid">
              <div className="form-field flex-full"><label>Descrição</label><input type="text" value={editando.descricao || ''} onChange={e => setEditando({ ...editando, descricao: e.target.value })} /></div>
              <div className="form-field"><label>Fornecedor</label><input type="text" value={editando.fornecedor || ''} onChange={e => setEditando({ ...editando, fornecedor: e.target.value })} /></div>
              <div className="form-field"><label>Categoria</label>
                <select value={editando.categoria || ''} onChange={e => setEditando({ ...editando, categoria: e.target.value })}>
                  <option value="">Selecione</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field"><label>Valor (R$)</label><input type="number" step="0.01" value={editando.valor} onChange={e => setEditando({ ...editando, valor: e.target.value })} /></div>
              <div className="form-field"><label>Data de emissão</label><input type="date" value={editando.dataEmissao || ''} onChange={e => setEditando({ ...editando, dataEmissao: e.target.value })} /></div>
              <div className="form-field"><label>Vencimento</label><input type="date" value={editando.vencimento || ''} onChange={e => setEditando({ ...editando, vencimento: e.target.value })} /></div>
              {editando.pago && <div className="form-field"><label>Data do pagamento</label><input type="date" value={editando.dataPagamento || ''} onChange={e => setEditando({ ...editando, dataPagamento: e.target.value })} /></div>}
              <div className="form-field flex-full"><label>Código de barras (boleto)</label><input type="text" value={editando.codigoBarras || ''} onChange={e => setEditando({ ...editando, codigoBarras: e.target.value })} className="mono" placeholder="Opcional" />{editando.codigoBarras && <div className="boleto-preview">{formatBoleto(editando.codigoBarras)}</div>}</div>
              <div className="form-field flex-full"><label>Observação</label><input type="text" value={editando.observacao || ''} onChange={e => setEditando({ ...editando, observacao: e.target.value })} /></div>
            </div>
            {editando.pago && editando.despesaVinculadaId && <p className="modal-info" style={{ marginTop: 16 }}>Esta conta está paga. A despesa vinculada será atualizada automaticamente.</p>}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn-soft" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn-primary" onClick={salvarEdicao}><Check size={14} /> Salvar alterações</button>
            </div>
          </div>
        </div>
      )}

      {pagarModal && (
        <div className="modal-overlay" onClick={() => setPagarModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar pagamento</h3>
            <p className="modal-text"><strong>{pagarModal.descricao}</strong><br /><span className="muted">Vencimento: {formatDate(pagarModal.vencimento)} · {formatBRL(pagarModal.valor)}</span></p>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Data do pagamento</label>
              <input type="date" value={dataPagamentoInput} onChange={e => setDataPagamentoInput(e.target.value)} />
              {dataPagamentoInput && pagarModal.vencimento && dataPagamentoInput > pagarModal.vencimento && <div className="muted-warn" style={{ marginTop: 6 }}>⚠ Pagamento após o vencimento</div>}
            </div>
            <p className="modal-info">Uma despesa será criada automaticamente na data informada.</p>
            <div className="modal-actions">
              <button className="btn-soft" onClick={() => setPagarModal(null)}>Cancelar</button>
              <button className="btn-pay" onClick={confirmarPagamento}><CheckCircle2 size={14} /> Confirmar pagamento</button>
            </div>
          </div>
        </div>
      )}

      {confirmar && (
        <div className="modal-overlay" onClick={() => setConfirmar(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Excluir conta?</h3>
            <p className="modal-text"><strong>{confirmar.descricao}</strong><br /><span className="muted">Venc.: {formatDate(confirmar.vencimento)} · {formatBRL(confirmar.valor)}</span></p>
            <p className="modal-warn">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn-soft" onClick={() => setConfirmar(null)}>Cancelar</button>
              <button className="btn-danger" onClick={removerConta}><Trash2 size={14} /> Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    font-family: 'Inter', system-ui, sans-serif;
    background:
      radial-gradient(circle at 15% 10%, rgba(255, 61, 138, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 85% 80%, rgba(253, 224, 71, 0.08) 0%, transparent 40%),
      linear-gradient(180deg, #1a0a14 0%, #0f0509 100%);
    min-height: 100vh;
    color: #f4e8ee;
    padding: 24px;
  }

  .auth-bg {
    min-height: 100vh;
    background: radial-gradient(circle at 30% 20%, rgba(255,61,138,0.18) 0%, transparent 50%), linear-gradient(180deg, #1a0a14 0%, #0f0509 100%);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .auth-card {
    background: rgba(255,255,255,0.03); border: 1px solid #2a1a24; border-radius: 18px; padding: 36px; width: 100%; max-width: 400px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,61,138,0.1);
  }
  .auth-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .auth-title { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 20px; color: #ff3d8a; letter-spacing: 0.02em; }
  .auth-sub { font-size: 11px; color: #8a7080; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
  .auth-h2 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 22px; color: #f4e8ee; margin-bottom: 20px; }
  .auth-form { display: flex; flex-direction: column; gap: 14px; }
  .auth-erro { background: rgba(248,113,113,0.1); border: 1px solid #f87171; border-radius: 7px; padding: 10px 14px; color: #fca5a5; font-size: 13px; }
  .auth-toggle { text-align: center; margin-top: 20px; font-size: 13px; color: #8a7080; }
  .link-btn { background: none; border: none; color: #ff3d8a; cursor: pointer; font-size: inherit; font-weight: 600; text-decoration: underline; padding: 0; }

  .api-error { background: rgba(248,113,113,0.1); border-left: 3px solid #f87171; padding: 12px 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #fca5a5; display: flex; align-items: center; gap: 10px; }

  .loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 20px; color: #ff3d8a;
    font-family: 'Bricolage Grotesque', sans-serif; background: #1a0a14;
  }
  .donut-loader { width: 60px; height: 60px; position: relative; }
  .donut-ring { width: 60px; height: 60px; border: 8px solid #2a1a24; border-top-color: #ff3d8a; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid #2a1a24; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand-mark { filter: drop-shadow(0 0 12px rgba(255, 61, 138, 0.4)); }
  .header h1 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 24px; color: #ff3d8a; letter-spacing: 0.02em; text-shadow: 0 0 20px rgba(255, 61, 138, 0.3); }
  .header p { font-size: 11px; color: #8a7080; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
  .sync-saving { color: #fde047; }
  .sync-ok { color: #a3e635; }
  .header-actions { display: flex; align-items: center; gap: 10px; }

  .month-picker { padding: 10px 14px; border: 1px solid #ff3d8a; border-radius: 8px; background: rgba(255, 61, 138, 0.08); font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #ff7eb6; cursor: pointer; color-scheme: dark; }
  .month-picker:focus { outline: 2px solid #ff3d8a; outline-offset: 1px; }

  .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid #2a1a24; overflow-x: auto; }
  .tab { background: none; border: none; padding: 12px 18px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 13px; color: #8a7080; cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .tab:hover { color: #ff7eb6; }
  .tab.active { color: #ff3d8a; border-bottom-color: #ff3d8a; }

  .card { background: rgba(255, 255, 255, 0.025); border: 1px solid #2a1a24; border-radius: 14px; padding: 24px; margin-bottom: 20px; backdrop-filter: blur(10px); }
  .card h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 16px; color: #f4e8ee; margin-bottom: 16px; letter-spacing: -0.01em; }

  .kpi-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  @media (max-width: 800px) { .kpi-grid { grid-template-columns: 1fr; } }
  .kpi { background: rgba(255, 255, 255, 0.025); border: 1px solid #2a1a24; border-radius: 14px; padding: 20px; display: flex; gap: 14px; align-items: flex-start; }
  .kpi-main { background: linear-gradient(135deg, rgba(255, 61, 138, 0.18) 0%, rgba(255, 61, 138, 0.05) 100%); border-color: #ff3d8a; flex-direction: column; align-items: flex-start; box-shadow: 0 0 30px rgba(255, 61, 138, 0.15); }
  .kpi-icon { width: 36px; height: 36px; background: rgba(255, 61, 138, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ff3d8a; flex-shrink: 0; }
  .kpi-icon-warn { background: rgba(253, 224, 71, 0.12); color: #fde047; }
  .kpi-icon-danger { background: rgba(248, 113, 113, 0.12); color: #f87171; }
  .kpi-label { font-size: 11px; color: #8a7080; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
  .kpi-value { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 22px; color: #f4e8ee; margin-top: 4px; letter-spacing: -0.02em; }
  .kpi-value-big { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 38px; color: #ff3d8a; margin-top: 8px; letter-spacing: -0.03em; line-height: 1; }
  .kpi-sub { font-size: 12px; color: #8a7080; margin-top: 6px; }

  .cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 900px) { .cards-row { grid-template-columns: 1fr; } }

  .alerts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .alert { display: flex; gap: 12px; align-items: center; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
  .alert-danger { background: rgba(248, 113, 113, 0.1); color: #fca5a5; border-left: 3px solid #f87171; }
  .alert-warning { background: rgba(253, 224, 71, 0.08); color: #fde047; border-left: 3px solid #fde047; }

  .ranking { display: flex; flex-direction: column; gap: 16px; }
  .rank-row { display: flex; gap: 14px; align-items: center; }
  .rank-pos { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 13px; color: #1a0a14; flex-shrink: 0; }
  .rank-content { flex: 1; }
  .rank-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .rank-name { font-size: 13px; color: #f4e8ee; font-weight: 600; }
  .rank-value { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; color: #ff7eb6; font-size: 13px; }
  .rank-bar { height: 6px; background: #2a1a24; border-radius: 3px; overflow: hidden; }
  .rank-fill { height: 100%; border-radius: 3px; transition: width 0.6s; }
  .rank-pct { font-size: 11px; color: #8a7080; margin-top: 4px; }

  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; align-items: end; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.flex-2 { grid-column: span 2; }
  .form-field.flex-full { grid-column: 1 / -1; }
  @media (max-width: 700px) { .form-field.flex-2 { grid-column: span 1; } }
  .form-field label { font-size: 10px; color: #8a7080; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .form-field input, .form-field select { padding: 10px 12px; border: 1px solid #3a2a34; border-radius: 7px; background: rgba(0, 0, 0, 0.3); font-family: inherit; font-size: 13px; color: #f4e8ee; color-scheme: dark; }
  .form-field input:focus, .form-field select:focus { outline: 2px solid #ff3d8a; outline-offset: 1px; border-color: #ff3d8a; }
  .form-field input.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.02em; }

  .boleto-preview { margin-top: 6px; padding: 8px 12px; background: rgba(255, 61, 138, 0.08); border: 1px dashed #ff3d8a; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ff7eb6; letter-spacing: 0.02em; }

  .btn-primary { background: linear-gradient(135deg, #ff3d8a 0%, #c92260 100%); color: #fff; border: none; padding: 11px 20px; border-radius: 8px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 16px rgba(255, 61, 138, 0.3); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255, 61, 138, 0.4); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-soft { background: rgba(255, 61, 138, 0.1); color: #ff7eb6; border: 1px solid #ff3d8a; padding: 7px 13px; border-radius: 6px; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .btn-soft:hover { background: rgba(255, 61, 138, 0.2); }
  .btn-pay { background: rgba(163, 230, 53, 0.12); color: #a3e635; border: 1px solid #a3e635; padding: 8px 14px; border-radius: 7px; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .btn-pay:hover { background: rgba(163, 230, 53, 0.2); }
  .btn-edit { background: rgba(192, 132, 252, 0.12); color: #c084fc; border: 1px solid #c084fc; padding: 8px 14px; border-radius: 7px; font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .btn-edit:hover { background: rgba(192, 132, 252, 0.22); }
  .btn-copy { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid #22d3ee; padding: 6px 12px; border-radius: 6px; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .btn-copy:hover { background: rgba(34, 211, 238, 0.2); }
  .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; border: none; padding: 10px 18px; border-radius: 7px; font-family: 'Bricolage Grotesque', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: transform 0.1s; }
  .btn-danger:hover { transform: translateY(-1px); }

  .table-wrap { overflow-x: auto; }
  .table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .table th { text-align: left; padding: 10px 12px; font-weight: 700; color: #8a7080; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #2a1a24; }
  .table td { padding: 12px; border-bottom: 1px solid #1f1018; color: #f4e8ee; }
  .table tr:hover td { background: rgba(255, 61, 138, 0.04); }
  .val-neg { color: #ff7eb6; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; }

  .tag { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: rgba(255, 61, 138, 0.12); color: #ff7eb6; border: 1px solid rgba(255, 61, 138, 0.3); }
  .tag-small { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; background: rgba(255, 61, 138, 0.1); color: #ff7eb6; text-transform: uppercase; letter-spacing: 0.04em; }
  .pgto-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); text-transform: uppercase; letter-spacing: 0.04em; }
  .auto-tag { display: inline-block; margin-left: 8px; padding: 1px 7px; border-radius: 8px; font-size: 9px; font-weight: 700; background: rgba(163, 230, 53, 0.12); color: #a3e635; border: 1px solid rgba(163, 230, 53, 0.3); text-transform: uppercase; letter-spacing: 0.05em; vertical-align: middle; }
  .icon-btn { background: none; border: none; padding: 6px; color: #8a7080; cursor: pointer; border-radius: 4px; }
  .icon-btn:hover { background: rgba(248, 113, 113, 0.15); color: #f87171; }

  .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .pill-aberta { background: rgba(253, 224, 71, 0.1); color: #fde047; }
  .pill-proxima { background: rgba(251, 146, 60, 0.12); color: #fb923c; }
  .pill-vencida { background: rgba(248, 113, 113, 0.12); color: #f87171; }

  .empty { text-align: center; padding: 36px; color: #8a7080; font-size: 13px; }
  .muted { color: #8a7080; font-size: 11px; margin-top: 2px; }
  .muted-warn { color: #fb923c; font-size: 11px; font-weight: 600; margin-top: 2px; }
  .data-info { font-size: 12px; color: #8a7080; }
  .data-info strong { color: #f4e8ee; font-weight: 600; }
  .modal-info { color: #8a7080; font-size: 12px; margin-bottom: 20px; text-align: center; font-style: italic; }

  .contas-list { display: flex; flex-direction: column; gap: 12px; }
  .conta-card { background: rgba(0, 0, 0, 0.25); border: 1px solid #2a1a24; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .conta-card.conta-vencida { border-color: #f87171; background: rgba(248, 113, 113, 0.05); box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.2); }
  .conta-card.conta-proxima { border-color: #fb923c; background: rgba(251, 146, 60, 0.04); }
  .conta-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .conta-desc { font-weight: 600; color: #f4e8ee; font-size: 14px; }
  .conta-valor { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 20px; color: #ff3d8a; white-space: nowrap; }
  .conta-meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 12px; color: #8a7080; }
  .boleto-row { display: flex; gap: 8px; align-items: center; background: rgba(0, 0, 0, 0.3); padding: 8px 12px; border-radius: 6px; border: 1px solid #2a1a24; flex-wrap: wrap; }
  .boleto-code { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #c4a4b0; letter-spacing: 0.02em; word-break: break-all; min-width: 200px; }
  .conta-obs { font-size: 12px; color: #8a7080; font-style: italic; padding: 6px 10px; background: rgba(0, 0, 0, 0.2); border-radius: 5px; }
  .conta-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; border-top: 1px solid #1f1018; padding-top: 10px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn 0.15s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal { background: linear-gradient(180deg, #1f1018 0%, #1a0a14 100%); border: 1px solid #ff3d8a; border-radius: 14px; padding: 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 61, 138, 0.15); animation: slideUp 0.2s ease-out; max-height: 90vh; overflow-y: auto; }
  .modal-wide { max-width: 640px; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 18px; color: #ff3d8a; margin-bottom: 14px; }
  .modal-text { color: #f4e8ee; font-size: 14px; line-height: 1.5; margin-bottom: 12px; padding: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; border-left: 3px solid #ff3d8a; }
  .modal-warn { color: #fb923c; font-size: 12px; margin-bottom: 20px; text-align: center; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
`;
