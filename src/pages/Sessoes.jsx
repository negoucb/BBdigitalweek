import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { COR_TRILHA, NOME_TRILHA, proximoId, classeTrilha } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/7162/7162245.png';
const FORM_VAZIO = { titulo: '', trilha: '', atividade: '', local: '', horario: '', palestrante: '',
                     dia: '26', descricao: '', nivel: '', tags: [] };

const FILTROS_VAZIOS = {
  busca: '', buscaId: '', trilha: [], tipo: [], espaco: [], dia: [], periodo: [],
  nivel: [], palestrante: [], status: [],
  ordenarPor: 'horario', ordenarDir: 'asc',
};

const ESPACOS_OPCOES = ['Sala', 'Auditório', 'Palco'];

const TIPOS_OPCOES = [
  'Palestra', 'Workshop', 'Painel', 'Mesa Redonda',
  'Mentoria', 'Networking', 'Keynote', 'Keynote Técnico',
];

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const TAGS   = ['IA', 'Cloud', 'DevOps', 'Segurança', 'Dados', 'Frontend', 'Backend', 'Mobile', 'UX', 'Agile'];
const STATUS_OPCOES = ['Pendente', 'Em Revisão', 'Aprovado', 'Confirmado', 'Concluído', 'Cancelado'];

export default function Sessoes({ dados, setDados }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);

  const sessoes      = dados?.sessoes      || [];
  const trilhas      = dados?.trilhas      || [];
  const palestrantes = dados?.palestrantes || [];
  const espacos      = dados?.espacos      || [];
  const horarios     = dados?.horarios     || [];
  const atividades   = dados?.atividades   || [];

  const aprovadas = sessoes.filter(s => s.status === 'aprovado').length;
  const andamento = sessoes.filter(s => s.status === 'andamento').length;

  // Deriva nomes de trilhas dos dados cadastrados
  const trilhasOpcoes = trilhas.map(t => t.nome);
  // Palestrantes cadastrados
  const palestrantesOpcoes = palestrantes.map(p => p.nome);

  // Config do filtro
  const configFiltro = {
    grupos: [
      {
        chave: 'trilha',
        label: 'Trilha',
        opcoes: ['UX', 'IA', 'Desenvolvimento', 'Dados', 'Segurança', 'Cloud', 'Mobile', 'DevOps', 'Gestão'],
      },
      {
        chave: 'tipo',
        label: 'Tipo de Atividade',
        opcoes: TIPOS_OPCOES,
      },
      {
        chave: 'espaco',
        label: 'Espaço',
        opcoes: ESPACOS_OPCOES,
      },
      {
        chave: 'dia',
        label: 'Dia do Evento',
        opcoes: ['21/09', '22/09', '23/09'],
      },
      {
        chave: 'periodo',
        label: 'Horário',
        opcoes: ['Manhã', 'Tarde', 'Noite', 'Todos'],
      },
      {
        chave: 'nivel',
        label: 'Nível',
        opcoes: NIVEIS,
      },
      {
        chave: 'palestrante',
        label: 'Palestrante',
        opcoes: palestrantesOpcoes.length ? palestrantesOpcoes : ['— cadastre palestrantes —'],
        buscavel: true,
      },
      {
        chave: 'tags',
        label: 'Tags',
        opcoes: TAGS,
      },
      {
        chave: 'status',
        label: 'Status',
        opcoes: STATUS_OPCOES,
      },
    ],
    ordenarPor: [
      { v: 'horario',     l: 'Horário' },
      { v: 'titulo',      l: 'Título' },
      { v: 'trilha',      l: 'Trilha' },
      { v: 'palestrante', l: 'Palestrante' },
      { v: 'nivel',       l: 'Nível' },
    ],
  };

  // Mapeamento de filtros → campos dos dados
  const camposFiltro = {
    busca:       ['titulo', 'palestrante', 'local'],
    buscaId:     'id',
    trilha:      item => NOME_TRILHA[item.trilha] || item.trilha,
    tipo:        'tipo',
    espaco:      'local',
    palestrante: 'palestrante',
    nivel:       'nivel',
    tags:        item => (item.tags || []),
    status:      item => {
      const m = { andamento: 'Pendente', aprovado: 'Aprovado' };
      return m[item.status] || item.status;
    },
    ordenar: {
      horario:     'horario',
      titulo:      'titulo',
      trilha:      'trilha',
      palestrante: 'palestrante',
      nivel:       'nivel',
    },
  };

  // Filtro de dia/período manual (não coberto pelo helper genérico)
  function filtrarPeriodo(s) {
    if (!filtros.periodo.length || filtros.periodo.includes('Todos')) return true;
    const h = parseInt((s.horario || '00:00').split(':')[0]);
    return filtros.periodo.some(p => {
      if (p === 'Manhã') return h >= 6  && h < 12;
      if (p === 'Tarde') return h >= 12 && h < 18;
      if (p === 'Noite') return h >= 18;
      return true;
    });
  }

  function filtrarDia(s) {
    if (!filtros.dia.length) return true;
    // mapeia '21/09' → dia numérico
    return filtros.dia.some(d => s.dia === d.split('/')[0]);
  }

  const sessoesFiltradas = aplicarFiltros(sessoes, filtros, camposFiltro)
    .filter(filtrarPeriodo)
    .filter(filtrarDia);

  // ── CRUD ──
  function abrirView(s)  { setSelected(s); setPopup('view'); }
  function abrirEditar(s) {
    setForm({ titulo: s.titulo, trilha: s.trilha, atividade: s.atividade,
              local: s.local, horario: s.horario, palestrante: s.palestrante,
              dia: s.dia, descricao: s.descricao || '', nivel: s.nivel || '', tags: s.tags || [] });
    setSelected(s); setPopup('editar');
  }

  function salvarEdicao() {
    setDados(d => ({ ...d, sessoes: d.sessoes.map(s => s.id === selected.id ? { ...s, ...form } : s) }));
    setPopup(null);
  }

  function salvarNovo() {
    const novoId = proximoId('S', sessoes);
    setDados(d => ({ ...d, sessoes: [...d.sessoes, { ...form, id: novoId, status: 'andamento' }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }

  function deletar() {
    setDados(d => ({ ...d, sessoes: d.sessoes.filter(s => s.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
  }

  function aprovar() {
    setDados(d => ({ ...d, sessoes: d.sessoes.map(s => s.id === selected.id ? { ...s, status: 'aprovado' } : s) }));
    setSelected(prev => ({ ...prev, status: 'aprovado' })); setPopup(null);
  }

  const trilhaOpts = trilhas.map(t => ({
    v: Object.keys(COR_TRILHA).find(k => t.nome.toLowerCase().includes(k)) || t.id,
    l: t.nome,
  }));

  const campoForm = (lbl, name, tipo = 'input', opts = []) => (
    <div className="campo-popup" key={name}>
      <label>{lbl}</label>
      {tipo === 'select' ? (
        <select value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}>
          <option value="">Selecione...</option>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : tipo === 'textarea' ? (
        <textarea value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={`Digite ${lbl.toLowerCase()}`} />
      ) : (
        <input type={tipo} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={`Digite ${lbl.toLowerCase()}`} />
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="spacePage2">
        <div className="conteudo">

          <div className="gridp">
            <h1 id="part">Visão geral</h1>
            <FiltroAvancado
              filtros={filtros}
              setFiltros={setFiltros}
              config={configFiltro}
              placeholder="Pesquisar por título, palestrante..."
              totalResultados={sessoesFiltradas.length}
              totalGeral={sessoes.length}
            />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2">
                  <h2>Sessões</h2>
                  <img className="pcard-icon" src={ICONE} alt="" />
                </div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">{sessoesFiltradas.length}<span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{sessoes.length}</span></h1>
                    <p className="pcard-subtitle">Sessões{sessoesFiltradas.length !== sessoes.length ? ' encontradas' : ' cadastradas'}</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" /><small>{aprovadas} aprovadas</small></div>
                  <div className="statusp-item orange"><span className="pulse" /><small>{andamento} em andamento</small></div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list">
                {sessoesFiltradas.map(s => {
                  const cor = COR_TRILHA[s.trilha] || '#9CA3AF';
                  const cls = classeTrilha(s.trilha);
                  return (
                    <div key={s.id} className={`card-evento ${cls}`}
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => abrirView(s)}>
                      <div style={{ position:'absolute', right:0, top:0, width:10, height:'100%',
                        background: cor, borderRadius:'0 16px 16px 0' }} />
                      <div className="card-info">

                        <h2 className="card-titulo">{s.titulo}</h2>
                        <p className="card-trilha">
                          {s.trilha
                            ? (NOME_TRILHA[s.trilha] || s.trilha)
                            : <span style={{ color: '#9CA3AF' }}>Sem trilha</span>}
                        </p>
                        <p className="card-horario">{s.horario} — Dia {s.dia}</p>
                        {s.nivel && <span className="card-nivel-badge">{s.nivel}</span>}
                      </div>
                      <div className="status-bola-evento"
                        style={{ background: s.status === 'aprovado' ? '#00D26A' : '#F59E0B' }} />
                    </div>
                  );
                })}
                {sessoesFiltradas.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>Nenhuma sessão encontrada com os filtros aplicados.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar sessão</button>
          </div>
        </div>
      </div>

      {/* POPUP VIEW */}
      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}
        onAprovar={aprovar} statusItem={selected?.status}
        trilhaCor={COR_TRILHA[selected?.trilha] || '#9CA3AF'}>
        {selected && (
          <>
            <div className="topo-card">
              <h2 className="popup-card-titulo">{selected.titulo}</h2>
              <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
            </div>
            <p className="popup-card-trilha">
              Trilha: {selected.trilha ? (NOME_TRILHA[selected.trilha] || selected.trilha)
                : <em style={{ color: '#9CA3AF' }}>Sem trilha</em>}
            </p>
            <div className="popup-card-descricao">
              <h3>Descrição</h3>
              <p>{selected.descricao || '—'}</p>
            </div>
            <p className="popup-card-horario">{selected.horario} — Dia {selected.dia}</p>
            <div className="popup-card-info">
              <div>
                <p><strong>Local:</strong> {selected.local}</p>
                <p><strong>Palestrante:</strong> {selected.palestrante}</p>
                <p><strong>Atividade:</strong> {selected.atividade}</p>
                <p><strong>Nível:</strong> {selected.nivel || '—'}</p>
                <p><strong>Status:</strong> {selected.status}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      {/* POPUP EDITAR */}
      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Sessão">
        {campoForm('Título', 'titulo')}
        {campoForm('Trilha', 'trilha', 'select', trilhaOpts)}
        {campoForm('Atividade', 'atividade', 'select', atividades.map(a => ({ v: a.nome, l: a.nome })))}
        {campoForm('Local', 'local', 'select', espacos.map(e => ({ v: e.nome, l: e.nome })))}
        {campoForm('Horário', 'horario', 'select', horarios.map(h => ({ v: h.hora, l: `${h.hora} — Dia ${h.dia}` })))}
        {campoForm('Palestrante', 'palestrante', 'select', palestrantes.map(p => ({ v: p.nome, l: p.nome })))}
        {campoForm('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campoForm('Dia', 'dia', 'select', [{ v:'26', l:'26/03' },{ v:'27', l:'27/03' },{ v:'28', l:'28/03' }])}
        {campoForm('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      {/* POPUP CRIAR */}
      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Sessão">
        {campoForm('Título', 'titulo')}
        {campoForm('Trilha', 'trilha', 'select', trilhaOpts)}
        {campoForm('Atividade', 'atividade', 'select', atividades.map(a => ({ v: a.nome, l: a.nome })))}
        {campoForm('Local', 'local', 'select', espacos.map(e => ({ v: e.nome, l: e.nome })))}
        {campoForm('Horário', 'horario', 'select', horarios.map(h => ({ v: h.hora, l: `${h.hora} — Dia ${h.dia}` })))}
        {campoForm('Palestrante', 'palestrante', 'select', palestrantes.map(p => ({ v: p.nome, l: p.nome })))}
        {campoForm('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campoForm('Dia', 'dia', 'select', [{ v:'26', l:'26/03' },{ v:'27', l:'27/03' },{ v:'28', l:'28/03' }])}
        {campoForm('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete
          mensagem={`Deseja excluir a sessão "${selected?.titulo}" permanentemente?`}
          onConfirmar={deletar}
          onCancelar={() => setConfirmDel(false)}
        />
      )}
    </div>
  );
}