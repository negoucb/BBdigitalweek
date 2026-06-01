export const dadosIniciais = {
  sessoes: [
    { id: '#S001', titulo: 'UX & DevEx', trilha: 'ux', atividade: 'Design Thinking', local: 'Auditório Central', horario: '09:00', palestrante: 'João Silva', status: 'aprovado', dia: '26' },
    { id: '#S002', titulo: 'Machine Learning na Prática', trilha: 'ia', atividade: 'Machine Learning', local: 'Sala 01', horario: '10:00', palestrante: 'Ana Costa', status: 'andamento', dia: '26' },
    { id: '#S003', titulo: 'Cloud Native', trilha: 'tech', atividade: 'Cloud Computing', local: 'Auditório Principal', horario: '14:00', palestrante: 'Pedro Lima', status: 'aprovado', dia: '27' },
  ],
  trilhas: [
    { id: '#T001', nome: 'Desenvolvimento', descricao: 'Trilha de desenvolvimento de software moderno', cor: '#8B5CF6', slots: 8, status: 'aprovado' },
    { id: '#T002', nome: 'Inteligência Artificial', descricao: 'IA, ML e dados', cor: '#06B6D4', slots: 5, status: 'aprovado' },
    { id: '#T003', nome: 'Cloud & Infra', descricao: 'Cloud computing e infraestrutura', cor: '#2563EB', slots: 4, status: 'andamento' },
  ],
  atividades: [
    { id: '#A001', nome: 'Design Thinking', tipo: 'Workshop', trilha: 'ux', status: 'aprovado' },
    { id: '#A002', nome: 'UX Research', tipo: 'Palestra', trilha: 'ux', status: 'aprovado' },
    { id: '#A003', nome: 'JavaScript Moderno', tipo: 'Workshop', trilha: 'tech', status: 'aprovado' },
    { id: '#A004', nome: 'Cloud Computing', tipo: 'Palestra', trilha: 'tech', status: 'aprovado' },
    { id: '#A005', nome: 'Machine Learning', tipo: 'Workshop', trilha: 'ia', status: 'aprovado' },
    { id: '#A006', nome: 'IA Generativa', tipo: 'Palestra', trilha: 'ia', status: 'aprovado' },
    { id: '#A007', nome: 'Liderança Ágil', tipo: 'Workshop', trilha: 'gestao', status: 'aprovado' },
    { id: '#A008', nome: 'Gestão de Projetos', tipo: 'Palestra', trilha: 'gestao', status: 'andamento' },
  ],
  palestrantes: [
    { id: '#P001', nome: 'João Silva', area: 'UX', atuacao: 'Designer Sênior', foto: '', trilha: 'ux', horarios: ['09:00'], status: 'aprovado' },
    { id: '#P002', nome: 'Ana Costa', area: 'IA', atuacao: 'Pesquisadora ML', foto: '', trilha: 'ia', horarios: ['10:00'], status: 'aprovado' },
    { id: '#P003', nome: 'Pedro Lima', area: 'Cloud', atuacao: 'Engenheiro Cloud', foto: '', trilha: 'tech', horarios: ['14:00'], status: 'aprovado' },
  ],
  espacos: [
    { id: '#E001', nome: 'Auditório Principal', tipo: 'Auditório', descricao: 'Auditório principal do evento com 500 lugares' },
    { id: '#E002', nome: 'Sala 01', tipo: 'Sala', descricao: 'Sala de workshops com 40 lugares' },
    { id: '#E003', nome: 'Sala M', tipo: 'Sala', descricao: 'Sala de mentoria' },
  ],
  horarios: [
    { id: '#H001', hora: '09:00', dia: '26' },
    { id: '#H002', hora: '10:00', dia: '26' },
    { id: '#H003', hora: '14:00', dia: '26' },
    { id: '#H004', hora: '09:00', dia: '27' },
    { id: '#H005', hora: '10:00', dia: '27' },
  ],
  alertas: [
    { id: '#AL001', tipo: 'similaridade', percentual: 89, titulo: 'UX & DevEx: onde o design encontra o código', conflito: 'trilhas', sessoes: ['#S001', '#S002'], descricao: 'Sessões com conteúdo muito semelhante detectadas pela IA' },
    { id: '#AL002', tipo: 'tecnico', percentual: null, titulo: 'Slot duplicado: 09:00 Auditório', conflito: 'slots', sessoes: ['#S001', '#S003'], descricao: 'O mesmo horário e espaço está sendo usado em duas sessões' },
  ],
};

// Mapa de cores por chave de trilha
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

export function proximoId(prefixo, lista) {
  const nums = lista.map(i => {
    const m = (i.id || '').match(/(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return '#' + prefixo + String(next).padStart(3, '0');
}
