

/**
 * Detecta conflitos de similaridade entre sessões usando IA.
 * @param {Array} sessoes - lista de sessões do estado atual
 * @returns {Promise<Array>} lista de conflitos com estrutura:
 *   { id, tipo: 'similaridade', percentual: 0-100, titulo, conflito, sessoes: [...ids], descricao }
 */
export async function detectarSimilaridade(sessoes) {
  /*
  const response = await fetch('/ia/similaridade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessoes })
  });
  return response.json();
  */
  return []; // stub: retorna vazio até integração
}

/**
 * Detecta conflitos técnicos (mesmo horário+local).
 * Isso pode ser feito no front mesmo (ou no back-end).
 * @param {Array} sessoes
 * @param {Array} horarios
 * @param {Array} espacos
 * @returns {Array} conflitos técnicos detectados
 */
export function detectarConflutosTecnicos(sessoes, horarios, espacos) {
  const conflitos = [];
  const mapa = {};
  sessoes.forEach(s => {
    const chave = `${s.dia}_${s.horario}_${s.local}`;
    if (!mapa[chave]) mapa[chave] = [];
    mapa[chave].push(s);
  });
  Object.entries(mapa).forEach(([chave, grupo]) => {
    if (grupo.length > 1) {
      conflitos.push({
        id: '#AL_TEC_' + Math.random().toString(36).slice(2,6).toUpperCase(),
        tipo: 'tecnico',
        percentual: null,
        titulo: `Conflito: ${grupo[0].horario} — ${grupo[0].local}`,
        conflito: 'slots',
        sessoes: grupo.map(s => s.id),
        descricao: 'O mesmo horário e espaço está sendo usado em duas ou mais sessões.'
      });
    }
  });
  return conflitos;
}