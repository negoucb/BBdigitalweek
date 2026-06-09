import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { corParaTrilha } from '../data/inicial.js';
import {
  criarProposta,
  editarProposta,
  deletarProposta,
  criarSessao,
} from '../services/api.js';
import { toast } from '../components/Toast.jsx';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/1828/1828919.png';

// Tipos de atividade mapeados no campo 'formato' da Proposal
const TIPOS_OPCOES = ['Palestra', 'Workshop', 'Painel', 'Mesa Redonda',
                      'Mentoria', 'Networking', 'Keynote', 'Keynote Técnico'];
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const STATUS_OPCOES = ['PENDING', 'REVIEW', 'APPROVED', 'REJECTED'];
const STATUS_LABEL  = { PENDING: 'Pendente', REVIEW: 'Em Revisão', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' };

const FORM_VAZIO = { titulo: '', formato: 'Palestra', id_track: '', nivel: '', descricao: '' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', tipo: [], nivel: [], ordenarPor: 'titulo', ordenarDir: 'asc',
};

export default function Atividades({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  const propostas = dados?.propostas || [];
  const trilhas   = dados?.trilhas   || [];
  const sessoes   = dados?.sessoes   || []; // grade de sessões (junction)
  const espacos   = dados?.espacos   || [];
  const horarios  = dados?.horarios  || [];
  const usuario   = dados?.usuario;

  const [formAgendamento, setFormAgendamento] = useState({ id_stage: '', id_slot: '' });
  const naGrade = (id_proposal) => sessoes.some(s => s.id_proposal === id_proposal);

  const configFiltro = {
    grupos: [
      { chave: 'tipo',  label: 'Tipo de Atividade', opcoes: TIPOS_OPCOES },
      { chave: 'nivel', label: 'Nível', opcoes: NIVEIS },
      { chave: 'status', label: 'Status', opcoes: Object.values(STATUS_LABEL) },
    ],
    ordenarPor: [
      { v: 'titulo', l: 'Título' },
      { v: 'formato', l: 'Tipo' },
      { v: 'nivel',  l: 'Nível' },
    ],
  };

  const camposFiltro = {
    busca:   ['titulo', 'descricao'],
    buscaId: 'id_proposal',
    tipo:    'formato',
    nivel:   'nivel',
    status:  item => STATUS_LABEL[item.status] || item.status,
    ordenar: { titulo: 'titulo', formato: 'formato', nivel: 'nivel' },
  };

  const propostasFiltradas = aplicarFiltros(propostas, filtros, camposFiltro);

  const nomeTrilha = (id) => trilhas.find(t => t.id_track === id)?.nome || `Trilha #${id}`;
  const corTrilha  = (id) => { const t = trilhas.find(t => t.id_track === id); return t ? corParaTrilha(t.nome) : '#9CA3AF'; };

  function abrirView(a)   { setSelected(a); setPopup('view'); setErro(''); }
  function abrirEditar(a) {
    setForm({ titulo: a.titulo, formato: a.formato || 'Palestra', id_track: a.id_track || '', nivel: a.nivel || '', descricao: a.descricao || '' });
    setSelected(a); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      await editarProposta(selected.id_proposal, {
        titulo:   form.titulo,
        formato:  form.formato,
        id_track: form.id_track ? parseInt(form.id_track) : null,
        nivel:    form.nivel,
        descricao: form.descricao,
      });
      await onRefresh();
      setPopup(null);
      toast.success('Atividade atualizada!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao salvar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function salvarNovo() {
    if (!form.id_track) { setErro('Selecione uma trilha.'); return; }
    setLoading(true); setErro('');
    try {
      // id_creator vem do usuário logado (guardado na sessão pelo backend)
      // enviamos o que o backend espera; id_creator é preenchido no backend via session se necessário
      await criarProposta({
        titulo:     form.titulo,
        formato:    form.formato,
        id_track:   parseInt(form.id_track),
        nivel:      form.nivel,
        descricao:  form.descricao,
        id_creator: dados?.usuarioLogado?.id_usuario || 1, // fallback seguro
      });
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Atividade criada com sucesso!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao criar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function aprovar() {
    setLoading(true); setErro('');
    try {
      await editarProposta(selected.id_proposal, { status: 'APPROVED' });
      await onRefresh();
      setPopup(null);
    } catch (err) {
      setErro(err.message || 'Erro ao aprovar.');
    } finally {
      setLoading(false);
    }
  }

  async function agendar() {
    if (!formAgendamento.id_stage) { setErro('Selecione um espaço.'); return; }
    if (!formAgendamento.id_slot)  { setErro('Selecione um horário.'); return; }
    setLoading(true); setErro('');
    try {
      await criarSessao({
        id_proposal: selected.id_proposal,
        id_stage: parseInt(formAgendamento.id_stage),
        id_slot: parseInt(formAgendamento.id_slot),
        id_track: selected.id_track || 1, // Passa a trilha atual
      });
      await onRefresh();
      setPopup(null);
      toast.success('Atividade agendada com sucesso na grade!');
      window.location.reload(); 
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao agendar.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function deletar() {
    setLoading(true); setErro('');
    try {
      await deletarProposta(selected.id_proposal);
      await onRefresh();
      setConfirmDel(false); setPopup(null); setSelected(null);
      toast.success('Atividade excluída!');
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
              config={configFiltro} placeholder="Pesquisar por nome..."
              totalResultados={propostasFiltradas.length}
              totalGeral={propostas.length} />
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
                      {propostasFiltradas.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{propostas.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Atividades{propostasFiltradas.length !== propostas.length ? ' encontradas' : ' cadastradas'}</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" />
                    <small>{propostas.filter(p => p.status === 'APPROVED').length} aprovadas</small>
                  </div>
                  <div className="statusp-item orange"><span className="pulse" />
                    <small>{propostas.filter(p => p.status === 'PENDING').length} pendentes</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list" style={{ flexDirection: 'column', width: '100%' }}>
                {propostasFiltradas.map(a => {
                  const cor = corTrilha(a.id_track);
                  return (
                    <div key={a.id_proposal} className="mini-table-card" onClick={() => abrirView(a)}
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ position:'absolute', right:0, top:0, width:18, height:'100%',
                        background: cor, borderRadius:'0 16px 16px 0' }} />
                      <div className="mini-card-nome">{a.titulo}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{a.formato || '—'}</div>
                      <div style={{ fontSize: 12, color: cor, fontWeight: 600, paddingRight: 28 }}>
                        {nomeTrilha(a.id_track)}
                      </div>
                      <div className={`mini-card-status ${a.status === 'APPROVED' ? 'ativo' : 'pendente'}`}
                        style={{ paddingRight: 34 }}>
                        {STATUS_LABEL[a.status] || a.status}
                      </div>
                    </div>
                  );
                })}
                {propostasFiltradas.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>Nenhuma atividade encontrada.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar atividade
            </button>
          </div>
        </div>
      </div>

      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}
        onAprovar={selected?.status !== 'APPROVED' ? aprovar : null}
        onAgendar={selected?.status === 'APPROVED' && !naGrade(selected?.id_proposal) ? () => { setFormAgendamento({ id_stage: '', id_slot: '' }); setPopup('agendar'); setErro(''); } : null}
        statusItem={selected?.status === 'APPROVED' ? 'aprovado' : 'andamento'}
        trilhaCor={corTrilha(selected?.id_track)}>
        {selected && (
          <>
            <div className="topo-card">
              <h2 className="popup-card-titulo">{selected.titulo}</h2>
              <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
            </div>
            <p className="popup-card-trilha">
              Trilha: {nomeTrilha(selected.id_track)}
            </p>
            <div className="popup-card-descricao">
              <h3>Descrição</h3>
              <p>{selected.descricao || '—'}</p>
            </div>
            <div className="popup-card-info">
              <div>
                <p><strong>Tipo:</strong> {selected.formato || '—'}</p>
                <p><strong>Nível:</strong> {selected.nivel || '—'}</p>
                <p><strong>Status:</strong> {STATUS_LABEL[selected.status] || selected.status}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id_proposal}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Atividade">
        {campo('Título', 'titulo')}
        {campo('Tipo', 'formato', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campo('Trilha', 'id_track', 'select', trilhas.map(t => ({ v: t.id_track, l: t.nome })))}
        {campo('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campo('Descrição', 'descricao', 'textarea')}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Atividade">
        {campo('Título', 'titulo')}
        {campo('Tipo', 'formato', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campo('Trilha', 'id_track', 'select', trilhas.map(t => ({ v: t.id_track, l: t.nome })))}
        {campo('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campo('Descrição', 'descricao', 'textarea')}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Popup>

      {/* AGENDAR */}
      <Popup aberto={popup === 'agendar'} onFechar={() => setPopup(null)} titulo="Agendar na Grade">
        <p style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
          Selecione onde e quando a atividade <strong>{selected?.titulo}</strong> ocorrerá.
        </p>
        <div className="campo-popup">
          <label>Espaço / Palco</label>
          <select value={formAgendamento.id_stage} onChange={e => setFormAgendamento(f => ({ ...f, id_stage: e.target.value }))}>
            <option value="">Selecione...</option>
            {espacos.map(e => <option key={e.id_stage} value={e.id_stage}>{e.nome}</option>)}
          </select>
        </div>
        <div className="campo-popup">
          <label>Horário (Slot)</label>
          <select value={formAgendamento.id_slot} onChange={e => setFormAgendamento(f => ({ ...f, id_slot: e.target.value }))}>
            <option value="">Selecione...</option>
            {horarios.map(h => {
              const str = h.start_time ? new Date(h.start_time).toLocaleString('pt-BR') : `Slot #${h.id_slot}`;
              return <option key={h.id_slot} value={h.id_slot}>{str}</option>;
            })}
          </select>
        </div>
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={agendar} disabled={loading} style={{ background: '#2563eb', color: '#fff' }}>
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir a atividade "${selected?.titulo}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}
