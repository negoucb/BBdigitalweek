import { corParaTrilha } from '../data/inicial.js';

const STATUS_LABEL = { PENDING: 'Pendente', REVIEW: 'Em Revisão', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' };

export default function Dashboard({ dados }) {
  const propostas    = dados?.propostas    || [];
  const trilhas      = dados?.trilhas      || [];
  const palestrantes = dados?.palestrantes || [];
  const alertas      = dados?.alertas      || [];
  const sessoes      = dados?.sessoes      || [];  // grade (junction)
  const horarios     = dados?.horarios     || [];  // slots

  // Métricas de propostas
  const aprovadas  = propostas.filter(p => p.status === 'APPROVED').length;
  const pendentes  = propostas.filter(p => p.status === 'PENDING' || p.status === 'REVIEW').length;
  const rejeitadas = propostas.filter(p => p.status === 'REJECTED').length;

  const cards = [
    {
      titulo: 'Propostas',
      icon: 'imgbb/sessao.png',
      numero: propostas.length,
      sub: 'Propostas cadastradas',
      status: [
        { cls: 'green',  txt: `${aprovadas} aprovadas` },
        { cls: 'orange', txt: `${pendentes} em curadoria` },
        { cls: 'red',    txt: `${rejeitadas} rejeitadas` },
      ],
    },
    {
      titulo: 'Trilhas',
      icon: 'https://cdn-icons-png.flaticon.com/512/7753/7753344.png',
      numero: trilhas.length,
      sub: 'Trilhas cadastradas',
      status: [
        { cls: 'green',  txt: `${trilhas.length} ativas` },
        { cls: 'orange', txt: `${propostas.filter(p => !p.id_track).length} sem trilha` },
      ],
    },
    {
      titulo: 'Palestrantes',
      icon: 'https://cdn-icons-png.flaticon.com/512/33/33308.png',
      numero: palestrantes.length,
      sub: 'Palestrantes cadastrados',
      status: [
        { cls: 'green',  txt: `${palestrantes.length} cadastrados` },
      ],
    },
    {
      titulo: 'Grade',
      icon: 'https://static.thenounproject.com/png/1393909-200.png',
      numero: sessoes.length,
      sub: 'Sessões na grade',
      status: [
        { cls: 'green',  txt: `${sessoes.length} agendadas` },
        { cls: 'orange', txt: `${horarios.length} slots disponíveis` },
      ],
    },
  ];

  // Atualizações recentes: últimas 5 propostas/trilhas criadas
  const atualizacoes = [
    ...propostas.slice(-3).map(p => ({ tempo: 'Recente', txt: `Proposta cadastrada: ${p.titulo}` })),
    ...trilhas.slice(-2).map(t => ({ tempo: 'Recente', txt: `Trilha criada: ${t.nome}` })),
  ].slice(0, 5);

  const atualizacoesExibidas = atualizacoes.length > 0 ? atualizacoes : [
    { tempo: '—', txt: 'Nenhuma atualização recente.' },
  ];

  // Gráfico: propostas por trilha
  const propostasPorTrilha = trilhas.map(t => ({
    label: t.nome,
    cor:   corParaTrilha(t.nome),
    qtd:   propostas.filter(p => p.id_track === t.id_track).length,
  }));
  const maxQtd = Math.max(...propostasPorTrilha.map(t => t.qtd), 1);

  return (
    <div className="page">
      <div className="spacePage">
        <h1 id="part">Visão geral</h1>
        <div className="dash-grid">
          {cards.map(c => (
            <div key={c.titulo} className="dash-card1">
              <div className="resume">
                <h2>{c.titulo}</h2>
                <img className="dcard-icon" src={c.icon} alt="" />
              </div>
              <div className="number-status">
                <div>
                  <h1 className="card-number">{c.numero}</h1>
                  <p className="card-subtitle">{c.sub}</p>
                </div>
                <div className="status-group">
                  {c.status.map((s, i) => (
                    <div key={i} className={`status-item ${s.cls}`}>
                      <span className="pulse" />
                      <small>{s.txt}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-grid2">
          {/* Atualizações */}
          <div className="mini-programacao-container">
            <div className="mini-programacao-header"><h1>Atualizações do Sistema</h1></div>
            <div className="mini-scroll-area">
              {atualizacoesExibidas.map((a, i) => (
                <div key={i} className="mini-programacao-card">
                  <div className="mini-horario-box"><span>{a.tempo}</span></div>
                  <div className="mini-programacao-content"><h2>{a.txt}</h2></div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas IA */}
          <div className="mini-programacao-container">
            <div className="mini-programacao-header" id="Hconflito"><h1>Conflitos Detectados</h1></div>
            <div className="mini-scroll-area">
              {alertas.length === 0 && (
                <div className="mini-programacao-card">
                  <div className="mini-programacao-content">
                    <h2>{sessoes.length === 0 ? 'Agende sessões para detectar conflitos' : 'Nenhum conflito detectado'}</h2>
                  </div>
                </div>
              )}
              {alertas.filter(a => a.tipo === 'similaridade').map((c, i) => (
                <div key={i} className="mini-programacao-card">
                  <div className={`mini-conflito-box ${(c.percentual || 0) >= 75 ? 'red-conflict' : 'orange-conflict'}`}>
                    <span>{c.percentual}%</span>
                  </div>
                  <div className="mini-programacao-content"><h2>{c.titulo}</h2></div>
                  <div className={`mini-color-bar ${(c.percentual || 0) >= 75 ? 'red-bar' : 'orange-bar'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de propostas por trilha */}
          <div className="trilha-chart-card">
            <div className="trilha-chart-header">
              <h2>Propostas por trilha</h2>
              <p>Total: {propostas.length}</p>
            </div>
            <div className="trilha-chart-scroll">
              {propostasPorTrilha.map((t, i) => (
                <div key={i} className="trilha-chart-row">
                  <span className="trilha-chart-label">{t.label}</span>
                  <div className="trilha-chart-bar-area">
                    <div
                      className="trilha-chart-bar"
                      style={{
                        width: `${Math.max((t.qtd / maxQtd) * 100, 8)}%`,
                        background: t.cor,
                      }}
                    >
                      <span>{t.qtd}</span>
                    </div>
                  </div>
                </div>
              ))}
              {propostas.filter(p => !p.id_track).length > 0 && (
                <div className="trilha-chart-row">
                  <span className="trilha-chart-label">Sem trilha</span>
                  <div className="trilha-chart-bar-area">
                    <div
                      className="trilha-chart-bar"
                      style={{
                        width: `${Math.max((propostas.filter(p => !p.id_track).length / maxQtd) * 100, 8)}%`,
                        background: '#9CA3AF',
                      }}
                    >
                      <span>{propostas.filter(p => !p.id_track).length}</span>
                    </div>
                  </div>
                </div>
              )}
              {trilhas.length === 0 && (
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>Cadastre trilhas para ver o gráfico.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
