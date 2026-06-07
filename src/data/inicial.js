/**
 * Constantes visuais e utilitários de UI.
 * Os dados reais vêm da API — apenas helpers de apresentação ficam aqui.
 */

// Mapa de cores por chave de trilha (usado para colorir cards)
export const COR_TRILHA = {
  ux:        '#8B5CF6',
  tech:      '#2563EB',
  ia:        '#06B6D4',
  gestao:    '#F59E0B',
  dados:     '#22C55E',
  seguranca: '#EF4444',
  cloud:     '#2563EB',
  mobile:    '#EC4899',
  devops:    '#F97316',
};

// Nomes legíveis por chave de trilha
export const NOME_TRILHA = {
  ux:        'UX & Design',
  tech:      'Tecnologia',
  ia:        'Inteligência Artificial',
  gestao:    'Gestão',
  dados:     'Dados',
  seguranca: 'Segurança',
  cloud:     'Cloud',
  mobile:    'Mobile',
  devops:    'DevOps',
};

export function classeTrilha(t) {
  const map = {
    ux:     'trilha-ux',
    tech:   'trilha-tech',
    ia:     'trilha-ia',
    gestao: 'trilha-gestao',
  };
  return map[t] || 'sem-trilha';
}

/**
 * Retorna uma cor para uma trilha a partir do nome da trilha
 * (busca por substring no nome). Fallback para cinza.
 */
export function corParaTrilha(nomeTrilha) {
  if (!nomeTrilha) return '#9CA3AF';
  const lower = nomeTrilha.toLowerCase();
  for (const [chave, cor] of Object.entries(COR_TRILHA)) {
    if (lower.includes(chave)) return cor;
  }
  return '#9CA3AF';
}
