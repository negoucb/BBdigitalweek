import { getAlertasSimilaridade } from './api.js';

/**
 * Detecta conflitos de similaridade entre sessões usando o endpoint de IA do backend.
 * @param {number} id_slot - ID do slot a escanear
 * @returns {Promise<Array>} lista de alertas de similaridade
 */
export async function detectarSimilaridade(id_slot) {
  try {
    const alertas = await getAlertasSimilaridade(id_slot);
    return alertas;
  } catch (err) {
    console.warn('[IA] Falha ao detectar similaridade:', err.message);
    return [];
  }
}

/**
 * Detecta conflitos técnicos (mesmo horário + local) localmente.
 * Mantido como fallback/complemento à detecção do backend.
 * @param {Array} sessoes
 * @returns {Array} conflitos técnicos detectados
 */
export function detectarConflutosTecnicos(sessoes) {
  const conflitos = [];
  const mapa = {};

  sessoes.forEach(s => {
    const chave = `${s.start_time}_${s.id_stage}`;
    if (!mapa[chave]) mapa[chave] = [];
    mapa[chave].push(s);
  });

  Object.entries(mapa).forEach(([, grupo]) => {
    if (grupo.length > 1) {
      conflitos.push({
        id: '#AL_TEC_' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        tipo: 'tecnico',
        percentual: null,
        titulo: `Conflito: slot ${grupo[0].id_slot} — stage ${grupo[0].id_stage}`,
        conflito: 'slots',
        sessoes: grupo.map(s => s.id_session),
        descricao: 'O mesmo horário e espaço está sendo usado em duas ou mais sessões.',
      });
    }
  });

  return conflitos;
}