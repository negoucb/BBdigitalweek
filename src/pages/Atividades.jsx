import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { COR_TRILHA, NOME_TRILHA, proximoId, classeTrilha } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/1828/1828919.png';
const FORM_VAZIO = { nome: '', tipo: 'Palestra', trilha: '', descricao: '', nivel: '', tags: [] };
const TIPOS_OPCOES = ['Palestra', 'Workshop', 'Painel', 'Mesa Redonda',
                      'Mentoria', 'Networking', 'Keynote', 'Keynote Técnico'];
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const TAGS   = ['IA', 'Cloud', 'DevOps', 'Segurança', 'Dados', 'Frontend', 'Backend', 'Mobile', 'UX', 'Agile'];
const STATUS_OPCOES = ['Pendente', 'Em Revisão', 'Aprovado', 'Confirmado', 'Concluído', 'Cancelado'];

const FILTROS_VAZIOS = {
  busca: '', buscaId: '', trilha: [], tipo: [], nivel: [], tags: [], status: [],
  ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Atividades({ dados, setDados }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);

  const atividades = dados?.atividades || [];
  const trilhas    = dados?.trilhas    || [];

  const aprovadas = atividades.filter(a => a.status === 'aprovado').length;
  const andamento = atividades.filter(a => a.status === 'andamento').length;

  const trilhasOpcoes = trilhas.map(t => t.nome);

  const configFiltro = {
    grupos: [
      { chave: 'trilha', label: 'Trilha',
        opcoes: ['UX', 'IA', 'Desenvolvimento', 'Dados', 'Segurança', 'Cloud', 'Mobile', 'DevOps', 'Gestão'] },
      { chave: 'tipo',   label: 'Tipo de Atividade', opcoes: TIPOS_OPCOES },
      { chave: 'nivel',  label: 'Nível', opcoes: NIVEIS },
      { chave: 'tags',   label: 'Tags',  opcoes: TAGS },
      { chave: 'status', label: 'Status', opcoes: STATUS_OPCOES },
    ],
    ordenarPor: [
      { v: 'nome',  l: 'Título' },
      { v: 'trilha', l: 'Trilha' },
      { v: 'tipo',  l: 'Tipo' },
      { v: 'nivel', l: 'Nível' },
    ],
  };

  const camposFiltro = {
    busca:  ['nome'],
    buscaId: 'id',
    trilha: item => NOME_TRILHA[item.trilha] || item.trilha,
    tipo:   'tipo',
    nivel:  'nivel',
    tags:   item => item.tags || [],
    status: item => { const m = { andamento: 'Pendente', aprovado: 'Aprovado' }; return m[item.status] || item.status; },
    ordenar: { nome: 'nome', trilha: 'trilha', tipo: 'tipo', nivel: 'nivel' },
  };

  const atividadesFiltradas = aplicarFiltros(atividades, filtros, camposFiltro);

  function abrirView(a)  { setSelected(a); setPopup('view'); }
  function abrirEditar(a) {
    setForm({ nome: a.nome, tipo: a.tipo, trilha: a.trilha, descricao: a.descricao || '',
              nivel: a.nivel || '', tags: a.tags || [] });
    setSelected(a); setPopup('editar');
  }
  function salvarEdicao() {
    setDados(d => ({ ...d, atividades: d.atividades.map(a => a.id === selected.id ? { ...a, ...form } : a) }));
    setPopup(null);
  }
  function salvarNovo() {
    const novoId = proximoId('A', atividades);
    setDados(d => ({ ...d, atividades: [...d.atividades, { ...form, id: novoId, status: 'andamento' }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }
  function deletar() {
    setDados(d => ({ ...d, atividades: d.atividades.filter(a => a.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
  }
  function aprovar() {
    setDados(d => ({ ...d, atividades: d.atividades.map(a => a.id === selected.id ? { ...a, status: 'aprovado' } : a) }));
    setSelected(prev => ({ ...prev, status: 'aprovado' })); setPopup(null);
  }

  const trilhaOpts = trilhas.map(t => ({
    v: Object.keys(COR_TRILHA).find(k => t.nome.toLowerCase().includes(k)) || t.id,
    l: t.nome,
  }));

  const campo = (lbl, name, tipo = 'input', opts = []) => (
    <div className="campo-popup" key={name}>
      <label>{lbl}</label>
      {tipo === 'select' ? (
        <select value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}>
          <option value="">Selecione...</option>
          {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : tipo === 'textarea' ? (
        <textarea value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
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
            <FiltroAvancado filtros={filtros} setFiltros={setFiltros}
              config={configFiltro} placeholder="Pesquisar por nome..."
              totalResultados={atividadesFiltradas.length}
              totalGeral={atividades.length} />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2">
                  <h2>Atividades</h2>
                  <img className="pcard-icon" src="https://cdn-icons-png.flaticon.com/512/1442/1442941.png" alt="" />
                </div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {atividadesFiltradas.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{atividades.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Atividades{atividadesFiltradas.length !== atividades.length ? ' encontradas' : ' cadastradas'}</p>
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
              <div className="card-list" style={{ flexDirection: 'column', width: '100%' }}>
                {atividadesFiltradas.map(a => {
                  const cor = COR_TRILHA[a.trilha] || '#9CA3AF';
                  return (
                    <div key={a.id} className="mini-table-card" onClick={() => abrirView(a)}
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ position:'absolute', right:0, top:0, width:18, height:'100%',
                        background: cor, borderRadius:'0 16px 16px 0' }} />
                      <div className="mini-card-nome">{a.nome}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{a.tipo}</div>
                      <div style={{ fontSize: 12, color: a.trilha ? cor : '#9CA3AF', fontWeight: 600, paddingRight: 28 }}>
                        {a.trilha ? (NOME_TRILHA[a.trilha] || a.trilha) : 'Sem trilha'}
                      </div>
                      <div className={`mini-card-status ${a.status === 'aprovado' ? 'ativo' : 'pendente'}`}
                        style={{ paddingRight: 34 }}>
                        {a.status === 'aprovado' ? 'verificado' : 'pendente'}
                      </div>
                    </div>
                  );
                })}
                {atividadesFiltradas.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>Nenhuma atividade encontrada.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar atividade</button>
          </div>
        </div>
      </div>

      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}
        onAprovar={aprovar} statusItem={selected?.status}
        trilhaCor={COR_TRILHA[selected?.trilha] || '#9CA3AF'}>
        {selected && (
          <>
            <div className="topo-card">
              <h2 className="popup-card-titulo">{selected.nome}</h2>
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
            <div className="popup-card-info">
              <div>
                <p><strong>Tipo:</strong> {selected.tipo}</p>
                <p><strong>Nível:</strong> {selected.nivel || '—'}</p>
                <p><strong>Status:</strong> {selected.status}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Atividade">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campo('Trilha', 'trilha', 'select', trilhaOpts)}
        {campo('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campo('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Atividade">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campo('Trilha', 'trilha', 'select', trilhaOpts)}
        {campo('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campo('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir a atividade "${selected?.nome}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}
