import { useState } from "react";
import { corParaTrilha } from '../data/inicial.js';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';

const FILTROS_VAZIOS = {
  busca: '', buscaId: '', trilha: [], tipo: [], espaco: [], ordenarPor: 'start_time', ordenarDir: 'asc',
};

function truncar(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function fonteAdaptada(str) {
  const n = (str || '').length;
  if (n > 60) return 'clamp(10px,1vw,13px)';
  if (n > 40) return 'clamp(11px,1.1vw,15px)';
  if (n > 25) return 'clamp(12px,1.3vw,17px)';
  return 'clamp(13px,1.5vw,21px)';
}

function formatarHora(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch { return dt; }
}

function formatarData(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return dt; }
}

export default function Grade({ dados, onRefresh }) {
  // sessoes = junction table Session (id_proposal, id_slot, id_stage, id_track)
  const sessoes   = dados?.sessoes   || [];
  const trilhas   = dados?.trilhas   || [];
  const espacos   = dados?.espacos   || [];
  const horarios  = dados?.horarios  || [];  // slots
  const propostas = dados?.propostas || [];

  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [popupEv, setPopupEv] = useState(null);

  // Enriquece cada sessão com dados das entidades relacionadas
  const sessoesEnriquecidas = sessoes.map(s => {
    const slot     = horarios.find(h => h.id_slot    === s.id_slot)    || {};
    const stage    = espacos.find(e  => e.id_stage   === s.id_stage)   || {};
    const track    = trilhas.find(t  => t.id_track   === s.id_track)   || {};
    const proposta = propostas.find(p => p.id_proposal === s.id_proposal) || {};
    return {
      ...s,
      titulo:    proposta.titulo   || `Sessão #${s.id_session}`,
      descricao: proposta.descricao || '',
      formato:   proposta.formato   || '—',
      nivel:     proposta.nivel     || '—',
      start_time: slot.start_time,
      hora:       formatarHora(slot.start_time),
      data:       formatarData(slot.start_time),
      local:      stage.nome || `Stage #${s.id_stage}`,
      trilhaNome: track.nome || '',
      cor:        corParaTrilha(track.nome),
    };
  });

  // Agrupa datas disponíveis
  const datasDisponiveis = [...new Set(
    sessoesEnriquecidas.map(s => formatarData(s.start_time))
  )].sort();

  const [dataAtiva, setDataAtiva] = useState(null);

  // Seleciona primeira data ao montar, se disponível
  const dataEfetiva = dataAtiva || (datasDisponiveis[0] ?? null);

  const trilhasOpcoes = trilhas.map(t => t.nome);
  const espacosOpcoes = espacos.map(e => e.nome);

  const configFiltro = {
    grupos: [
      { chave: 'trilha', label: 'Trilha',  opcoes: trilhasOpcoes },
      { chave: 'espaco', label: 'Espaço',  opcoes: espacosOpcoes },
    ],
    ordenarPor: [
      { v: 'start_time', l: 'Horário' },
      { v: 'titulo',     l: 'Título' },
    ],
  };

  const camposFiltro = {
    busca:   ['titulo', 'local', 'trilhaNome'],
    buscaId: 'id_session',
    trilha:  'trilhaNome',
    espaco:  'local',
    ordenar: { start_time: 'start_time', titulo: 'titulo' },
  };

  const sessoesFiltradas = aplicarFiltros(sessoesEnriquecidas, filtros, camposFiltro)
    .filter(s => !dataEfetiva || s.data === dataEfetiva);

  const horasNoDia = [...new Set(
    sessoesEnriquecidas.filter(s => s.data === dataEfetiva).map(s => s.hora)
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
              {datasDisponiveis.length === 0 && (
                <span style={{ color: '#9CA3AF', fontSize: 14 }}>Nenhuma sessão agendada</span>
              )}
              {datasDisponiveis.map(d => (
                <button
                  key={d}
                  className={`agenda-date-chip${dataEfetiva === d ? ' active' : ''}`}
                  onClick={() => setDataAtiva(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* FILTRO */}
          <div style={{ marginBottom: 20 }}>
            <FiltroAvancado
              filtros={filtros}
              setFiltros={setFiltros}
              config={configFiltro}
              placeholder="Pesquisar por título, local..."
              totalResultados={sessoesFiltradas.length}
              totalGeral={sessoesEnriquecidas.filter(s => s.data === dataEfetiva).length}
            />
          </div>

          {/* GRADE */}
          <div className="agenda-scroll-zone">
            {horasNoDia.length === 0 && (
              <p style={{ color: '#888', padding: 20 }}>
                {sessoes.length === 0
                  ? 'Nenhuma sessão agendada. Aprove propostas e agende-as nesta grade.'
                  : 'Nenhuma sessão para este dia.'
                }
              </p>
            )}
            {horasNoDia.map(hora => {
              const evts = sessoesFiltradas.filter(s => s.hora === hora);
              if (!evts.length) return null;
              return (
                <div key={hora} className="agenda-row">
                  <div className="agenda-time-box">{hora}</div>
                  <div className="agenda-events-track">
                    {evts.map(ev => (
                      <div
                        key={ev.id_session}
                        className="evento-card-plus"
                        style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                        onClick={() => setPopupEv(ev)}
                      >
                        <div style={{
                          position: 'absolute', right: 0, top: 0,
                          width: 16, height: '100%',
                          background: ev.cor,
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
                            {truncar(ev.trilhaNome, 20) || 'Sem trilha'} • {truncar(ev.local, 22)}
                          </p>
                          <span className="evento-card-info">{ev.formato} {ev.nivel !== '—' ? `· ${ev.nivel}` : ''}</span>
                        </div>
                        <div className="evento-status-dot" style={{ background: '#00D26A' }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* POPUP */}
      {popupEv && (
        <div className="popup-grade-overlay" onClick={() => setPopupEv(null)}>
          <div
            className="popup-grade-box"
            style={{ '--trilha-cor': popupEv.cor }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              position: 'absolute', right: 0, top: 0,
              width: 26, height: '100%',
              background: popupEv.cor,
              borderRadius: '0 24px 24px 0',
            }} />
            <button className="fechar-popup" onClick={() => setPopupEv(null)} style={{ position: 'absolute', top: 16, left: 16 }}>✕</button>
            <div style={{ paddingTop: 20, paddingRight: 36 }}>
              <div className="topo-card" style={{ marginBottom: 12 }}>
                <h2 className="popup-card-titulo">{popupEv.titulo}</h2>
                <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
              </div>
              <p className="popup-card-trilha">
                Trilha: {popupEv.trilhaNome || <em style={{ color: '#9CA3AF' }}>Sem trilha</em>}
              </p>
              {popupEv.descricao && (
                <div className="popup-card-descricao" style={{ marginBottom: 14 }}>
                  <h3>Descrição</h3>
                  <p>{popupEv.descricao}</p>
                </div>
              )}
              <p className="popup-card-horario">{popupEv.hora} — {popupEv.data}</p>
              <div className="popup-card-info" style={{ marginTop: 12 }}>
                <div>
                  <p><strong>Local:</strong> {popupEv.local}</p>
                  <p><strong>Tipo:</strong> {popupEv.formato}</p>
                  <p><strong>Nível:</strong> {popupEv.nivel}</p>
                </div>
                <div>
                  <p><strong>ID Sessão:</strong> {popupEv.id_session}</p>
                  <p><strong>ID Proposta:</strong> {popupEv.id_proposal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
