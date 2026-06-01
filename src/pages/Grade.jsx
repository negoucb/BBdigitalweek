import { useState } from "react";
import { COR_TRILHA } from '../data/inicial.js';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';

const TIPOS_OPCOES = [
  'Palestra', 'Workshop', 'Painel', 'Mesa Redonda',
  'Mentoria', 'Networking', 'Keynote', 'Keynote Técnico',
];

const FILTROS_VAZIOS = {
  busca: '', buscaId: '',
  trilha: [], tipo: [], espaco: [], periodo: [], nivel: [], palestrante: [], status: [],
  ordenarPor: 'horario', ordenarDir: 'asc',
};

/* Limita caracteres e adiciona "…" */
function truncar(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* Ajusta fonte conforme comprimento do título */
function fonteAdaptada(str) {
  const n = (str || '').length;
  if (n > 60) return 'clamp(10px,1vw,13px)';
  if (n > 40) return 'clamp(11px,1.1vw,15px)';
  if (n > 25) return 'clamp(12px,1.3vw,17px)';
  return 'clamp(13px,1.5vw,21px)';
}

export default function Grade({ dados }) {
  // Dias disponíveis — inclui 26, 27 e 28 por padrão
  const sessoes      = dados?.sessoes      || [];
  const trilhas      = dados?.trilhas      || [];
  const espacos      = dados?.espacos      || [];
  const horarios     = dados?.horarios     || [];
  const palestrantes = dados?.palestrantes || [];

  // Garante que 26, 27 e 28 sempre aparecem nos chips de data
  const diasBase = ['26', '27', '28'];
  const diasDados = [...new Set(sessoes.map(s => s.dia))];
  const diasDisponiveis = [...new Set([...diasBase, ...diasDados])].sort();

  const [diaAtivo, setDiaAtivo] = useState('26');
  const [filtros, setFiltros]   = useState(FILTROS_VAZIOS);
  const [popupEv, setPopupEv]   = useState(null);

  const trilhasOpcoes      = trilhas.length ? trilhas.map(t => t.nome) : ['UX','IA','Desenvolvimento','Dados','Segurança','Cloud','Mobile','DevOps','Gestão'];
  const espacosOpcoes      = espacos.length ? espacos.map(e => e.nome) : ['Sala','Auditório','Palco'];
  const palestrantesOpcoes = palestrantes.map(p => p.nome);

  const configFiltro = {
    grupos: [
      { chave: 'trilha',      label: 'Trilha',            opcoes: trilhasOpcoes },
      { chave: 'tipo',        label: 'Tipo de Atividade',  opcoes: TIPOS_OPCOES },
      { chave: 'espaco',      label: 'Espaço',             opcoes: espacosOpcoes },
      { chave: 'periodo',     label: 'Horário',            opcoes: ['Manhã', 'Tarde', 'Noite', 'Todos'] },
      { chave: 'nivel',       label: 'Nível',              opcoes: ['Iniciante', 'Intermediário', 'Avançado'] },
      { chave: 'palestrante', label: 'Palestrante',        opcoes: palestrantesOpcoes, buscavel: true },
      { chave: 'status',      label: 'Status',             opcoes: ['Pendente','Em Revisão','Aprovado','Confirmado','Concluído','Cancelado'] },
    ],
    ordenarPor: [
      { v: 'horario',     l: 'Horário' },
      { v: 'titulo',      l: 'Título' },
      { v: 'trilha',      l: 'Trilha' },
      { v: 'palestrante', l: 'Palestrante' },
    ],
  };

  const camposFiltro = {
    busca:       ['titulo', 'palestrante', 'local'],
    buscaId:     'id',
    trilha:      item => item.trilha,
    tipo:        'tipo',
    espaco:      'local',
    palestrante: 'palestrante',
    nivel:       'nivel',
    status:      item => { const m = { andamento: 'Pendente', aprovado: 'Aprovado' }; return m[item.status] || item.status; },
    ordenar: { horario: 'horario', titulo: 'titulo', trilha: 'trilha', palestrante: 'palestrante' },
  };

  function filtraPeriodo(s) {
    if (!filtros.periodo.length || filtros.periodo.includes('Todos')) return true;
    const h = parseInt((s.horario || '00:00').split(':')[0]);
    return filtros.periodo.some(p => {
      if (p === 'Manhã') return h >= 6  && h < 12;
      if (p === 'Tarde') return h >= 12 && h < 18;
      if (p === 'Noite') return h >= 18;
      return true;
    });
  }

  const sessoesFiltradas = aplicarFiltros(sessoes, filtros, camposFiltro)
    .filter(s => s.dia === diaAtivo)
    .filter(filtraPeriodo);

  const horariosNoDia = [...new Set(
    sessoes.filter(s => s.dia === diaAtivo).map(s => s.horario)
  )].sort();

  return (
    <div className="page">
      <div className="spacePage" style={{ paddingRight: 'clamp(12px,2vw,30px)' }}>
        <div className="agenda-master-box" style={{ maxWidth: '100%', marginLeft: 0 }}>

          {/* TOPBAR */}
          <div className="agenda-topbar">
            <div className="agenda-top-left">
              <h1 className="agenda-main-title">Programação Geral</h1>
            </div>
            <div className="agenda-date-group">
              {diasDisponiveis.map(d => (
                <button
                  key={d}
                  className={`agenda-date-chip${diaAtivo === d ? ' active' : ''}`}
                  onClick={() => setDiaAtivo(d)}
                >{d}/03</button>
              ))}
            </div>
          </div>

          {/* FILTRO */}
          <div style={{ marginBottom: 20 }}>
            <FiltroAvancado
              filtros={filtros}
              setFiltros={setFiltros}
              config={configFiltro}
              placeholder="Pesquisar por título, palestrante..."
              totalResultados={sessoesFiltradas.length}
              totalGeral={sessoes.filter(s => s.dia === diaAtivo).length}
            />
          </div>

          {/* TABELA */}
          <div className="agenda-scroll-zone">
            {horariosNoDia.length === 0 && (
              <p style={{ color: '#888', padding: 20 }}>Nenhuma sessão para este dia.</p>
            )}
            {horariosNoDia.map(hora => {
              const evts = sessoesFiltradas.filter(s => s.horario === hora);
              if (!evts.length) return null;
              return (
                <div key={hora} className="agenda-row">
                  <div className="agenda-time-box">{hora}</div>
                  <div className="agenda-events-track">
                    {evts.map(ev => {
                      const cor = COR_TRILHA[ev.trilha] || '#9CA3AF';
                      return (
                        <div
                          key={ev.id}
                          className="evento-card-plus"
                          style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => setPopupEv(ev)}
                        >
                          {/* barra lateral colorida por trilha */}
                          <div style={{
                            position: 'absolute', right: 0, top: 0,
                            width: 16, height: '100%',
                            background: cor,
                            borderRadius: '0 12px 12px 0',
                          }} />
                          <div className="evento-card-content" style={{ paddingRight: 24 }}>
                            <h2
                              className="evento-card-title"
                              style={{ fontSize: fonteAdaptada(ev.titulo), whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.25 }}
                              title={ev.titulo}
                            >
                              {ev.titulo}
                            </h2>
                            <p className="evento-card-track">
                              {ev.trilha ? ev.trilha.toUpperCase() : 'Sem trilha'} • {truncar(ev.palestrante, 24)}
                            </p>
                            <span className="evento-card-info">{truncar(ev.local, 22)} • {ev.horario}</span>
                          </div>
                          <div
                            className="evento-status-dot"
                            style={{ background: ev.status === 'aprovado' ? '#00D26A' : '#F59E0B' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* POPUP VISUALIZAÇÃO — sem botão fechar no footer */}
      {popupEv && (
        <div
          className="popup-grade-overlay"
          onClick={() => setPopupEv(null)}
        >
          <div
            className="popup-grade-box"
            style={{ '--trilha-cor': COR_TRILHA[popupEv.trilha] || '#9CA3AF' }}
            onClick={e => e.stopPropagation()}
          >
            {/* barra lateral da trilha */}
            <div style={{
              position: 'absolute', right: 0, top: 0,
              width: 26, height: '100%',
              background: COR_TRILHA[popupEv.trilha] || '#9CA3AF',
              borderRadius: '0 24px 24px 0',
            }} />

            <button
              className="fechar-popup"
              onClick={() => setPopupEv(null)}
              style={{ position: 'absolute', top: 16, left: 16 }}
            >✕</button>

            <div style={{ paddingTop: 20, paddingRight: 36 }}>
              <div className="topo-card" style={{ marginBottom: 12 }}>
                <h2 className="popup-card-titulo">{popupEv.titulo}</h2>
                <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
              </div>

              <p className="popup-card-trilha">
                Trilha: {popupEv.trilha
                  ? popupEv.trilha.charAt(0).toUpperCase() + popupEv.trilha.slice(1)
                  : <em style={{ color: '#9CA3AF' }}>Sem trilha</em>}
              </p>

              {popupEv.descricao && (
                <div className="popup-card-descricao" style={{ marginBottom: 14 }}>
                  <h3>Descrição</h3>
                  <p>{popupEv.descricao}</p>
                </div>
              )}

              <p className="popup-card-horario">{popupEv.horario} — Dia {popupEv.dia}</p>

              <div className="popup-card-info" style={{ marginTop: 12 }}>
                <div>
                  <p><strong>Local:</strong> {popupEv.local || '—'}</p>
                  <p><strong>Palestrante:</strong> {popupEv.palestrante || '—'}</p>
                  <p><strong>Atividade:</strong> {popupEv.atividade || '—'}</p>
                  <p><strong>Status:</strong> {popupEv.status || '—'}</p>
                </div>
                <div>
                  <p><strong>ID:</strong> {popupEv.id}</p>
                </div>
              </div>
              {/* Sem botão Fechar no rodapé — só o X fecha */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
