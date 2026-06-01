import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { proximoId } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/7753/7753344.png';
const CORES_OPCOES = [
  { v: '#8B5CF6', l: '🟣 Roxo' }, { v: '#06B6D4', l: '🔵 Ciano' },
  { v: '#2563EB', l: '🔵 Azul' }, { v: '#F59E0B', l: '🟡 Amarelo' },
  { v: '#22C55E', l: '🟢 Verde' }, { v: '#EF4444', l: '🔴 Vermelho' },
  { v: '#EC4899', l: '🩷 Rosa' }, { v: '#F97316', l: '🟠 Laranja' },
];
const FORM_VAZIO = { nome: '', descricao: '', cor: '#8B5CF6', slots: '6' };
const STATUS_OPCOES = ['Pendente', 'Aprovado'];
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', status: [], ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Trilhas({ dados, setDados }) {
  const [popup, setPopup]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]   = useState(FILTROS_VAZIOS);

  const trilhas = dados?.trilhas || [];
  const sessoes = dados?.sessoes || [];

  const aprovadas = trilhas.filter(t => t.status === 'aprovado').length;
  const andamento = trilhas.filter(t => t.status === 'andamento').length;

  const configFiltro = {
    grupos: [
      { chave: 'status', label: 'Status', opcoes: STATUS_OPCOES },
    ],
    ordenarPor: [
      { v: 'nome',  l: 'Nome' },
      { v: 'slots', l: 'Slots' },
    ],
  };

  const camposFiltro = {
    busca:  ['nome', 'descricao'],
    buscaId: 'id',
    status: item => { const m = { andamento: 'Pendente', aprovado: 'Aprovado' }; return m[item.status] || item.status; },
    ordenar: { nome: 'nome', slots: 'slots' },
  };

  const trilhasFiltradas = aplicarFiltros(trilhas, filtros, camposFiltro);

  function abrirView(t) { setSelected(t); setPopup('view'); }
  function abrirEditar(t) {
    setForm({ nome: t.nome, descricao: t.descricao, cor: t.cor, slots: String(t.slots) });
    setSelected(t); setPopup('editar');
  }
  function salvarEdicao() {
    setDados(d => ({ ...d, trilhas: d.trilhas.map(t => t.id === selected.id ? { ...t, ...form, slots: parseInt(form.slots) } : t) }));
    setPopup(null);
  }
  function salvarNovo() {
    const novoId = proximoId('T', trilhas);
    setDados(d => ({ ...d, trilhas: [...d.trilhas, { ...form, id: novoId, slots: parseInt(form.slots), status: 'andamento' }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }
  function deletar() {
    setDados(d => ({ ...d, trilhas: d.trilhas.filter(t => t.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
  }
  function aprovar() {
    setDados(d => ({ ...d, trilhas: d.trilhas.map(t => t.id === selected.id ? { ...t, status: 'aprovado' } : t) }));
    setSelected(prev => ({ ...prev, status: 'aprovado' })); setPopup(null);
  }

  const campo = (lbl, name, tipo = 'input', opts = []) => (
    <div className="campo-popup" key={name}>
      <label>{lbl}</label>
      {tipo === 'select' ? (
        <select value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}>
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
              config={configFiltro} placeholder="Pesquisar por nome, descrição..."
              totalResultados={trilhasFiltradas.length}
              totalGeral={trilhas.length} />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2"><h2>Trilhas</h2><img className="pcard-icon" src={ICONE} alt="" /></div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {trilhasFiltradas.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{trilhas.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Trilhas{trilhasFiltradas.length !== trilhas.length ? ' encontradas' : ' cadastradas'}</p>
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
                {trilhasFiltradas.map(t => {
                  const qtdSessoes = sessoes.filter(s => s.trilha && t.nome.toLowerCase().includes(s.trilha)).length;
                  const pct = Math.round((qtdSessoes / (t.slots || 1)) * 100);
                  return (
                    <div key={t.id} className="progress-card" onClick={() => abrirView(t)}
                      style={{ cursor:'pointer', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', right:0, top:0, width:26, height:'100%',
                        background: t.cor, borderRadius:'0 20px 20px 0' }} />
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:t.cor, flexShrink:0 }} />
                        <h2 className="progress-card-titulo">{t.nome}</h2>

                      </div>
                      <div className="progress-info">Sessões {qtdSessoes}/{t.slots}</div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width:`${Math.min(pct,100)}%`, background:t.cor }} />
                      </div>
                    </div>
                  );
                })}
                {trilhasFiltradas.length === 0 && (
                  <p style={{ color:'#888', padding:16 }}>Nenhuma trilha encontrada.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar trilha</button>
          </div>
        </div>
      </div>

      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}
        onAprovar={aprovar} statusItem={selected?.status}
        trilhaCor={selected?.cor || '#9CA3AF'}>
        {selected && (
          <>
            <div className="topo-card">
              <h2 className="popup-card-titulo">{selected.nome}</h2>
              <div style={{ width:24, height:24, borderRadius:'50%', background:selected.cor }} />
            </div>
            <div className="popup-card-descricao"><h3>Descrição</h3><p>{selected.descricao}</p></div>
            <div className="popup-card-info">
              <div>
                <p><strong>Slots de Sessões:</strong> {selected.slots}</p>
                <p><strong>Cor:</strong> <span style={{ background:selected.cor, padding:'2px 10px', borderRadius:6, color:'#fff' }}>{selected.cor}</span></p>
                <p><strong>Status:</strong> {selected.status}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Trilha">
        {campo('Nome da Trilha', 'nome')}
        {campo('Descrição', 'descricao', 'textarea')}
        {campo('Cor', 'cor', 'select', CORES_OPCOES)}
        {campo('Slots de Sessões', 'slots', 'number')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Criar Trilha">
        {campo('Nome da Trilha', 'nome')}
        {campo('Descrição', 'descricao', 'textarea')}
        {campo('Cor', 'cor', 'select', CORES_OPCOES)}
        {campo('Slots de Sessões', 'slots', 'number')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir a trilha "${selected?.nome}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}