import { COR_TRILHA, NOME_TRILHA } from '../data/inicial.js';

export default function Dashboard({ dados }) {
  const sessoes      = dados?.sessoes      || [];
  const trilhas      = dados?.trilhas      || [];
  const palestrantes = dados?.palestrantes || [];
  const alertas      = dados?.alertas      || [];

  // Contagens de status
  const contarStatus = (lista) => ({
    aprovado:  lista.filter(i => i.status === 'aprovado').length,
    andamento: lista.filter(i => i.status === 'andamento').length,
    conflito:  lista.filter(i => i.status === 'conflito').length,
  });

  const stSessoes = contarStatus(sessoes);
  const stPalestrantes = {
    ocupado:    palestrantes.filter(p => (p.horarios || []).length > 0).length,
    desocupado: palestrantes.filter(p => !(p.horarios || []).length).length,
  };

  const cards = [
    {
      titulo: 'Sessões',
      icon: 'imgbb/sessao.png',
      numero: sessoes.length,
      sub: 'Sessões cadastradas',
      status: [
        { cls: 'green',  txt: `${stSessoes.aprovado} verificadas` },
        { cls: 'orange', txt: `${stSessoes.andamento} em andamento` },
        { cls: 'red',    txt: `${alertas.length} conflitos` },
      ],
    },
    {
      titulo: 'Trilhas',
      icon: 'https://cdn-icons-png.flaticon.com/512/7753/7753344.png',
      numero: trilhas.length,
      sub: 'Trilhas cadastradas',
      status: [
        { cls: 'green',  txt: `${contarStatus(trilhas).aprovado} verificadas` },
        { cls: 'orange', txt: `${contarStatus(trilhas).andamento} em andamento` },
      ],
    },
    {
      titulo: 'Palestrantes',
      icon: 'https://cdn-icons-png.flaticon.com/512/33/33308.png',
      numero: palestrantes.length,
      sub: 'Palestrantes cadastrados',
      status: [
        { cls: 'green',  txt: `${stPalestrantes.ocupado} Ocupados` },
        { cls: 'orange', txt: `${stPalestrantes.desocupado} Desocupados` },
      ],
    },
    {
      titulo: 'Alertas',
      icon: 'https://static.thenounproject.com/png/1393909-200.png',
      numero: alertas.length,
      sub: 'Detectados no total',
      status: [
        { cls: 'red', txt: `${alertas.filter(a => a.tipo === 'similaridade').length} similaridade` },
        { cls: 'red', txt: `${alertas.filter(a => a.tipo === 'tecnico').length} técnicos` },
      ],
    },
  ];

  // Últimas sessões/trilhas como "atualizações"
  const atualizacoes = [
    ...sessoes.slice(-3).map(s => ({ tempo: 'Recente', txt: `Sessão cadastrada: ${s.titulo}` })),
    ...trilhas.slice(-2).map(t => ({ tempo: 'Recente', txt: `Trilha criada: ${t.nome}` })),
  ].slice(0, 5).length
    ? [
        ...sessoes.slice(-3).map(s => ({ tempo: 'Recente', txt: `Sessão cadastrada: ${s.titulo}` })),
        ...trilhas.slice(-2).map(t => ({ tempo: 'Recente', txt: `Trilha criada: ${t.nome}` })),
      ].slice(0, 5)
    : [
        { tempo: '2h atrás', txt: 'Nova trilha criada: UX & DevEx' },
        { tempo: '5h atrás', txt: 'Sessão excluída: IA Generativa' },
        { tempo: '1 dia',    txt: 'Novo palestrante adicionado' },
        { tempo: '3 dias',   txt: 'Novo alerta de conflito detectado' },
      ];

  // Conflitos de similaridade para mini-card
  const conflitosIA = alertas
    .filter(a => a.tipo === 'similaridade')
    .map(a => ({
      pct: `${a.percentual}%`,
      txt: a.titulo,
      cls: (a.percentual || 0) >= 75 ? 'red-conflict' : 'orange-conflict',
      bar: (a.percentual || 0) >= 75 ? 'red-bar' : 'orange-bar',
    }));

  // Gráfico de sessões por trilha
  const sessoesPortrilha = trilhas.map(t => {
    const chave = t.nome.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4);
    const qtd = sessoes.filter(s => s.trilha && t.nome.toLowerCase().includes(s.trilha)).length;
    return { label: t.nome, cor: t.cor || '#465EFF', qtd };
  });
  const maxQtd = Math.max(...sessoesPortrilha.map(t => t.qtd), 1);

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
              {atualizacoes.map((a, i) => (
                <div key={i} className="mini-programacao-card">
                  <div className="mini-horario-box"><span>{a.tempo}</span></div>
                  <div className="mini-programacao-content"><h2>{a.txt}</h2></div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflitos IA */}
          <div className="mini-programacao-container">
            <div className="mini-programacao-header" id="Hconflito"><h1>Conflitos Detectados</h1></div>
            <div className="mini-scroll-area">
              {conflitosIA.length === 0 && (
                <div className="mini-programacao-card">
                  <div className="mini-programacao-content"><h2>Nenhum conflito de similaridade</h2></div>
                </div>
              )}
              {conflitosIA.map((c, i) => (
                <div key={i} className="mini-programacao-card">
                  <div className={`mini-conflito-box ${c.cls}`}><span>{c.pct}</span></div>
                  <div className="mini-programacao-content"><h2>{c.txt}</h2></div>
                  <div className={`mini-color-bar ${c.bar}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de trilhas */}
          <div className="trilha-chart-card">
            <div className="trilha-chart-header">
              <h2>Sessões por trilha</h2>
              <p>Total de sessões: {sessoes.length}</p>
            </div>
            <div className="trilha-chart-scroll">
              {sessoesPortrilha.map((t, i) => (
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
              {/* Sessões sem trilha */}
              {sessoes.filter(s => !s.trilha).length > 0 && (
                <div className="trilha-chart-row">
                  <span className="trilha-chart-label">Sem trilha</span>
                  <div className="trilha-chart-bar-area">
                    <div
                      className="trilha-chart-bar"
                      style={{
                        width: `${Math.max((sessoes.filter(s => !s.trilha).length / maxQtd) * 100, 8)}%`,
                        background: '#9CA3AF',
                      }}
                    >
                      <span>{sessoes.filter(s => !s.trilha).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
