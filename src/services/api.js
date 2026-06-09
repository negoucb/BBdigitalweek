/**
 * Camada de comunicação com o backend Flask.
 * Todas as requisições usam credentials: 'include' para enviar
 * o cookie de sessão do Flask automaticamente.
 */

const BASE_URL = '/api';

// ─── Helper centralizado ────────────────────────────────────────────────────

/**
 * Wrapper de fetch com tratamento de erros padronizado.
 * Lança um Error com a mensagem do backend em caso de falha HTTP.
 * Em caso de ECONNREFUSED / rede indisponível, lança err.status = 0.
 */
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',   // envia o cookie de sessão Flask
      ...options,
    });
  } catch (netErr) {
    // Erro de rede: backend offline, ECONNREFUSED, sem internet, etc.
    const err = new Error('Sem conexão com o servidor. Verifique se o backend está rodando.');
    err.status = 0;
    throw err;
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Erro ${res.status}: resposta inválida do servidor.`);
  }

  if (!res.ok) {
    // O backend usa { success: false, error: { message, code, details } }
    const msg = json?.error?.message || json?.message || `Erro ${res.status}`;
    const err = new Error(msg);
    err.status  = res.status;
    err.data    = json?.error?.details || null;
    throw err;
  }

  return json;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

export async function login(email, senha) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export async function registrar(nome, email, senha, role = 'curator') {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, role }),
  });
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' });
}

/** Verifica sessão ativa — retorna null sem lançar erro se não autenticado. */
export async function verificarSessao() {
  try {
    return await request('/auth/session');
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
}

// ─── TRILHAS  (/api/tracks) ─────────────────────────────────────────────────

export async function getTrilhas() {
  const res = await request('/tracks');
  return res.data;
}

export async function criarTrilha(payload) {
  const res = await request('/tracks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function editarTrilha(id, payload) {
  const res = await request(`/tracks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarTrilha(id) {
  await request(`/tracks/${id}`, { method: 'DELETE' });
  return true;
}

// ─── PROPOSTAS  (/api/proposals) ────────────────────────────────────────────

export async function getPropostas() {
  const res = await request('/proposals');
  return res.data;
}

export async function criarProposta(payload) {
  const res = await request('/proposals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function editarProposta(id, payload) {
  const res = await request(`/proposals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarProposta(id) {
  await request(`/proposals/${id}`, { method: 'DELETE' });
  return true;
}

export async function aprovarProposta(id) {
  return editarProposta(id, { status: 'APPROVED' });
}

// ─── SESSÕES na GRADE  (/api/sessions) ──────────────────────────────────────

export async function getSessoes() {
  const res = await request('/sessions');
  return res.data;
}

export async function criarSessao(payload) {
  const res = await request('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarSessao(id) {
  await request(`/sessions/${id}`, { method: 'DELETE' });
  return true;
}

// ─── PALESTRANTES / SPEAKERS  (/api/speakers) ───────────────────────────────

export async function getPalestrantes() {
  const res = await request('/speakers');
  return res.data;
}

export async function criarPalestrante(payload) {
  const res = await request('/speakers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function editarPalestrante(id, payload) {
  const res = await request(`/speakers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarPalestrante(id) {
  await request(`/speakers/${id}`, { method: 'DELETE' });
  return true;
}

// ─── ESPAÇOS / STAGES  (/api/stages) ────────────────────────────────────────

export async function getEspacos() {
  const res = await request('/stages');
  return res.data;
}

export async function criarEspaco(payload) {
  const res = await request('/stages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function editarEspaco(id, payload) {
  const res = await request(`/stages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarEspaco(id) {
  await request(`/stages/${id}`, { method: 'DELETE' });
  return true;
}

// ─── HORÁRIOS / SLOTS  (/api/slots) ─────────────────────────────────────────

export async function getHorarios() {
  const res = await request('/slots');
  return res.data;
}

export async function criarHorario(payload) {
  const res = await request('/slots', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function editarHorario(id, payload) {
  const res = await request(`/slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deletarHorario(id) {
  await request(`/slots/${id}`, { method: 'DELETE' });
  return true;
}

// ─── IA / ALERTAS  (/api/ia) ────────────────────────────────────────────────

export async function getAlertasSimilaridade(id_slot) {
  const res = await request(`/ia/similarity/scan/${id_slot}`);
  return res.data?.alerts || [];
}

export async function verificarConflitoSpeaker(id_speaker, id_slot) {
  try {
    await request(`/ia/conflicts/speaker/${id_speaker}/${id_slot}`);
    return { conflito: false };
  } catch (err) {
    if (err.status === 409) return { conflito: true, mensagem: err.message };
    throw err;
  }
}

export async function getAlertasGlobais() {
  const res = await request('/ia/alerts');
  return res.data?.alerts || [];
}

export async function scanAlertasGlobais() {
  const res = await request('/ia/alerts/scan_all', { method: 'POST' });
  return res.message;
}