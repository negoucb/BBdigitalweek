import { useState } from "react";

export default function Propostas({ dados, onRefresh }) {
  const [popup, setPopup] = useState(null);

  // Alertas de IA vêm do estado global (dados.alertas)
  const alertas      = dados?.alertas   || [];
  const sessoes      = dados?.sessoes   || [];   // sessões da grade
  const propostas    = dados?.propostas || [];   // proposals do sistema

  const similaridade = alertas.filter(a => a.tipo === 'similaridade');
  const tecnicos     = alertas.filter(a => a.tipo === 'tecnico');

  // Busca o título da proposta pelo id_proposal
  const getNomeProposta = (id) =>
    propostas.find(p => p.id_proposal === id)?.titulo || `Proposta #${id}`;

  return (
    <div className="page">
      <div className="spacePage2">
        <div className="conteudo">
          <h1 id="part">Visão geral</h1>

          <div className="pag-grid">
            {/* Card de totais */}
            <div>
              <div className="page-card1">
                <div className="resume2">
                  <h2>Alertas</h2>
                  <img className="pcard-icon" src="https://cdn-icons-png.flaticon.com/512/1442/1442941.png" alt="" />
                </div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">{alertas.length}</h1>
                    <p className="pcard-subtitle">Alertas detectados</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item red">
                    <span className="pulse" />
                    <small>{tecnicos.length} conflitos técnicos</small>
                  </div>
                  <div className="statusp-item red">
                    <span className="pulse" />
                    <small>{similaridade.length} conflitos de IA</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última análise</p>
                </div>
              </div>
            </div>

            {/* Card 3 — alertas */}
            <div className="page-card3" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* ── SIMILARIDADE ─── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  background: 'linear-gradient(135deg, #C0392B 0%, #922b21 100%)',
                  borderRadius: '22px 22px 0 0',
                  padding: 'clamp(10px,1.4vw,18px) clamp(14px,2vw,24px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: 'clamp(14px,1.4vw,20px)', fontWeight: 700 }}>
                    Conflitos de Similaridade
                  </h2>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    padding: '4px 14px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                  }}>IA</span>
                </div>

                {similaridade.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>
                    {sessoes.length === 0
                      ? 'Nenhuma sessão agendada na grade — adicione sessões para detectar conflitos.'
                      : 'Nenhum conflito de similaridade detectado.'
                    }
                  </p>
                )}

                {similaridade.map(a => (
                  <div key={a.id} className="programacao-card" onClick={() => setPopup(a)}>
                    <div style={{
                      width: 'clamp(70px,8vw,110px)',
                      minHeight: 'clamp(80px,10vh,130px)',
                      background: '#C0392B',
                      borderRadius: 18,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700,
                      fontSize: 'clamp(18px,2vw,28px)',
                      flexShrink: 0,
                      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,.15)',
                    }}>
                      {a.percentual != null ? `${a.percentual}%` : '—'}
                    </div>
                    <div className="programacao-content">
                      <h2>{a.titulo}</h2>
                      <h3>Conflito: <span style={{ color: '#C0392B' }}>{a.conflito}</span></h3>
                      <p>Similaridade detectada pela IA • {a.id}</p>
                    </div>
                    <div style={{
                      width: 'clamp(12px,1.1vw,18px)',
                      flexShrink: 0,
                      background: '#C0392B',
                      borderRadius: '0 16px 16px 0',
                    }} />
                  </div>
                ))}
              </div>

              {/* ── TÉCNICO ─── */}
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #C0392B 0%, #922b21 100%)',
                  borderRadius: '22px 22px 0 0',
                  padding: 'clamp(10px,1.4vw,18px) clamp(14px,2vw,24px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: 'clamp(14px,1.4vw,20px)', fontWeight: 700 }}>
                    Conflitos Técnicos
                  </h2>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    padding: '4px 14px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                  }}>Sistema</span>
                </div>

                {tecnicos.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>Nenhum conflito técnico detectado.</p>
                )}

                {tecnicos.map(a => (
                  <div key={a.id} className="programacao-card" onClick={() => setPopup(a)}>
                    <div style={{
                      width: 'clamp(70px,8vw,110px)',
                      minHeight: 'clamp(80px,10vh,130px)',
                      background: '#C0392B',
                      borderRadius: 18,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700,
                      fontSize: 'clamp(22px,2.5vw,34px)',
                      flexShrink: 0,
                      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,.15)',
                    }}>
                      <img src="imgbb/ferra.png" alt="conflito" className="filtro-busca-icon" style={{ width: 36, height: 36 }} />
                    </div>
                    <div className="programacao-content">
                      <h2>{a.titulo}</h2>
                      <h3>Conflito: <span style={{ color: '#C0392B' }}>{a.conflito}</span></h3>
                      <p>Técnico detectado pelo sistema • {a.id}</p>
                    </div>
                    <div style={{
                      width: 'clamp(12px,1.1vw,18px)',
                      flexShrink: 0,
                      background: '#C0392B',
                      borderRadius: '0 16px 16px 0',
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP DO ALERTA */}
      {popup && (
        <div className="popup-card-overlay" style={{ display: 'flex' }} onClick={() => setPopup(null)}>
          <div className="popup-ia" onClick={e => e.stopPropagation()}>
            <button className="fechar-popup" onClick={() => setPopup(null)}>✕</button>
            <div className="popup-ia-grid">
              <div className="popup-ia-left">
                <h1 className="popup-ia-title">{popup.titulo}</h1>
                <hr className="popup-ia-line" />
                <div className="popup-ia-tag">
                  {popup.tipo === 'similaridade' ? 'Conflito de Similaridade — IA' : 'Conflito Técnico — Sistema'}
                </div>
                <div className="popup-ia-box">{popup.descricao}</div>
                <div className="popup-ia-footer">
                  <h2>Sessões em conflito</h2>
                  <span style={{ color: '#d60000' }}>{(popup.sessoes || []).length}</span>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(popup.sessoes || []).map((sid, idx) => (
                      <span key={idx} style={{ fontSize: 13, color: '#444' }}>
                        <strong>#{sid}</strong> — {getNomeProposta(sid)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="popup-ia-right">
                {popup.tipo === 'similaridade' ? (
                  <>
                    <div className="popup-ia-pill">{popup.percentual != null ? `${popup.percentual}%` : '—'}</div>
                    <p>Porcentagem de similaridade detectada pela IA</p>
                  </>
                ) : (
                  <>
                    <div className="popup-ia-pill" style={{ background: '#4a90d9' }}>🔧</div>
                    <p>Conflito técnico detectado pelo sistema</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
