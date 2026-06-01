

const BASE_URL = '/api'; 

// ── SESSÕES ─────────────────────────────────────────────────
export async function getSessoes()              { /* return fetch(`${BASE_URL}/sessoes`).then(r=>r.json()); */ return []; }
export async function criarSessao(payload)      { /* return fetch(`${BASE_URL}/sessoes`, {method:'POST', body:JSON.stringify(payload)}).then(r=>r.json()); */ return payload; }
export async function editarSessao(id, payload) { /* return fetch(`${BASE_URL}/sessoes/${id}`, {method:'PUT', body:JSON.stringify(payload)}).then(r=>r.json()); */ return payload; }
export async function deletarSessao(id)         { /* return fetch(`${BASE_URL}/sessoes/${id}`, {method:'DELETE'}); */ return true; }
export async function aprovarSessao(id)         { /* return fetch(`${BASE_URL}/sessoes/${id}/aprovar`, {method:'PATCH'}); */ return true; }

// ── TRILHAS ─────────────────────────────────────────────────
export async function getTrilhas()              { return []; }
export async function criarTrilha(payload)      { return payload; }
export async function editarTrilha(id, payload) { return payload; }
export async function deletarTrilha(id)         { return true; }
export async function aprovarTrilha(id)         { return true; }

// ── ATIVIDADES ───────────────────────────────────────────────
export async function getAtividades()              { return []; }
export async function criarAtividade(payload)      { return payload; }
export async function editarAtividade(id, payload) { return payload; }
export async function deletarAtividade(id)         { return true; }
export async function aprovarAtividade(id)         { return true; }

// ── PALESTRANTES ─────────────────────────────────────────────
export async function getPalestrantes()              { return []; }
export async function criarPalestrante(payload)      { return payload; }
export async function editarPalestrante(id, payload) { return payload; }
export async function deletarPalestrante(id)         { return true; }

// ── ESPAÇOS ──────────────────────────────────────────────────
export async function getEspacos()              { return []; }
export async function criarEspaco(payload)      { return payload; }
export async function editarEspaco(id, payload) { return payload; }
export async function deletarEspaco(id)         { return true; }

// ── HORÁRIOS ─────────────────────────────────────────────────
export async function getHorarios()              { return []; }
export async function criarHorario(payload)      { return payload; }
export async function editarHorario(id, payload) { return payload; }
export async function deletarHorario(id)         { return true; }

// ── ALERTAS ──────────────────────────────────────────────────
export async function getAlertas() { return []; }