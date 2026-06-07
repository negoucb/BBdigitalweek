import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { corParaTrilha } from '../data/inicial.js';
import { toast } from '../components/Toast.jsx';
import {
  criarTrilha,
  editarTrilha,
  deletarTrilha,
} from '../services/api.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/7753/7753344.png';
const CORES_OPCOES = [
  { v: '#8B5CF6', l: '🟣 Roxo' }, { v: '#06B6D4', l: '🔵 Ciano' },
  { v: '#2563EB', l: '🔵 Azul' }, { v: '#F59E0B', l: '🟡 Amarelo' },
  { v: '#22C55E', l: '🟢 Verde' }, { v: '#EF4444', l: '🔴 Vermelho' },
  { v: '#EC4899', l: '🩷 Rosa' }, { v: '#F97316', l: '🟠 Laranja' },
];
const NIVEIS_OPCOES = ['Iniciante', 'Intermediário', 'Avançado'];
const FORM_VAZIO = { nome: '', descricao: '', nivel: '', publico_alvo: '' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Trilhas({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  const trilhas = dados?.trilhas || [];
  const sessoes = dados?.propostas || [];  // propostas como proxy de sessões vinculadas

  const configFiltro = {
    grupos: [],
    ordenarPor: [
      { v: 'nome',  l: 'Nome' },
      { v: 'nivel', l: 'Nível' },
    ],
  };

  const camposFiltro = {
    busca:   ['nome', 'descricao'],
    buscaId: 'id_track',
    ordenar: { nome: 'nome', nivel: 'nivel' },
  };

  const trilhasFiltradas = aplicarFiltros(trilhas, filtros, camposFiltro);

  function abrirView(t)    { setSelected(t); setPopup('view'); setErro(''); }
  function abrirEditar(t)  {
    setForm({ nome: t.nome, descricao: t.descricao || '', nivel: t.nivel || '', publico_alvo: t.publico_alvo || '' });
    setSelected(t); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      await editarTrilha(selected.id_track, form);
      await onRefresh();
      setPopup(null);
      toast.success('Trilha atualizada com sucesso!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao salvar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function salvarNovo() {
    setLoading(true); setErro('');
    try {
      await criarTrilha(form);
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Trilha criada com sucesso!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao criar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function deletar() {
    setLoading(true); setErro('');
    try {
      await deletarTrilha(selected.id_track);
      await onRefresh();
      setConfirmDel(false); setPopup(null); setSelected(null);
      toast.success('Trilha excluída com sucesso!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao excluir. Tente novamente.');
      setErro(msg);
      toast.error(msg);
      setConfirmDel(false);
    } finally {
      setLoading(false);
    }
  }

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
                <div className="status"><h2>Distribuição</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" /><small>{trilhas.length} trilhas ativas</small></div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Cadastradas no sistema</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list">
                {trilhasFiltradas.map(t => {
                  const qtdPropostas = sessoes.filter(p => p.id_track === t.id_track).length;
                  return (
                    <div key={t.id_track} className="progress-card" onClick={() => abrirView(t)}
                      style={{ cursor:'pointer', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', right:0, top:0, width:26, height:'100%',
                        background: '#465EFF', borderRadius:'0 20px 20px 0' }} />
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:'#465EFF', flexShrink:0 }} />
                        <h2 className="progress-card-titulo">{t.nome}</h2>
                      </div>
                      <div className="progress-info">{qtdPropostas} proposta(s)</div>
                      {t.nivel && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{t.nivel}</div>}
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
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar trilha
            </button>
          </div>
        </div>
      </div>

      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}>
        {selected && (
          <>
            <div className="topo-card">
              <h2 className="popup-card-titulo">{selected.nome}</h2>
            </div>
            <div className="popup-card-descricao"><h3>Descrição</h3><p>{selected.descricao || '—'}</p></div>
            <div className="popup-card-info">
              <div>
                <p><strong>Nível:</strong> {selected.nivel || '—'}</p>
                <p><strong>Público-alvo:</strong> {selected.publico_alvo || '—'}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id_track}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Trilha">
        {campo('Nome da Trilha', 'nome')}
        {campo('Descrição', 'descricao', 'textarea')}
        {campo('Nível', 'nivel', 'select', NIVEIS_OPCOES.map(n => ({ v: n, l: n })))}
        {campo('Público-alvo', 'publico_alvo')}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Criar Trilha">
        {campo('Nome da Trilha', 'nome')}
        {campo('Descrição', 'descricao', 'textarea')}
        {campo('Nível', 'nivel', 'select', NIVEIS_OPCOES.map(n => ({ v: n, l: n })))}
        {campo('Público-alvo', 'publico_alvo')}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir a trilha "${selected?.nome}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}