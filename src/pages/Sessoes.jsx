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

const STATUS_LABEL = { PENDING: 'Pendente', REVIEW: 'Em Revisão', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' };
const TIPOS_OPCOES = ['Palestra', 'Workshop', 'Painel', 'Mesa Redonda', 'Mentoria', 'Networking', 'Keynote', 'Keynote Técnico'];
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

const FORM_VAZIO = { titulo: '', formato: 'Palestra', id_track: '', nivel: '', descricao: '' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', status: [], ordenarPor: 'titulo', ordenarDir: 'asc',
};

export default function Sessoes({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  // "Sessões" no frontend = Proposals no backend
  const propostas  = dados?.propostas || [];
  const trilhas    = dados?.trilhas   || [];
  const sessoes    = dados?.sessoes   || []; // grade de sessões (junction)
  const espacos    = dados?.espacos   || [];
  const horarios   = dados?.horarios  || [];

  const [formAgendamento, setFormAgendamento] = useState({ id_stage: '', id_slot: '' });

  const aprovadas = propostas.filter(p => p.status === 'APPROVED').length;
  const pendentes = propostas.filter(p => p.status === 'PENDING' || p.status === 'REVIEW').length;

  const configFiltro = {
    grupos: [
      { chave: 'status', label: 'Status', opcoes: Object.values(STATUS_LABEL) },
      { chave: 'tipo',   label: 'Tipo',   opcoes: TIPOS_OPCOES },
    ],
    ordenarPor: [
      { v: 'titulo',  l: 'Título' },
      { v: 'formato', l: 'Tipo' },
      { v: 'nivel',   l: 'Nível' },
    ],
  };

  const camposFiltro = {
    busca:   ['titulo', 'descricao'],
    buscaId: 'id_proposal',
    status:  item => STATUS_LABEL[item.status] || item.status,
    tipo:    'formato',
    ordenar: { titulo: 'titulo', formato: 'formato', nivel: 'nivel' },
  };

  const propostasFiltradas = aplicarFiltros(propostas, filtros, camposFiltro);

  const nomeTrilha = (id) => trilhas.find(t => t.id_track === id)?.nome || (id ? `Trilha #${id}` : 'Sem trilha');
  const corTrilha  = (id) => { const t = trilhas.find(t => t.id_track === id); return t ? corParaTrilha(t.nome) : '#9CA3AF'; };
  const naGrade    = (id_proposal) => sessoes.some(s => s.id_proposal === id_proposal);

  function abrirView(p)   { setSelected(p); setPopup('view'); setErro(''); }
  function abrirEditar(p) {
    setForm({ titulo: p.titulo, formato: p.formato || 'Palestra', id_track: p.id_track || '', nivel: p.nivel || '', descricao: p.descricao || '' });
    setSelected(p); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      await editarProposta(selected.id_proposal, {
        titulo:    form.titulo,
        formato:   form.formato,
        id_track:  form.id_track ? parseInt(form.id_track) : null,
        nivel:     form.nivel,
        descricao: form.descricao,
      });
      await onRefresh();
      setPopup(null);
      toast.success('Proposta atualizada!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao salvar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function salvarNovo() {
    if (!form.titulo.trim()) { setErro('O título é obrigatório.'); return; }
    if (!form.id_track)      { setErro('Selecione uma trilha.'); return; }
    setLoading(true); setErro('');
    try {
      await criarProposta({
        titulo:     form.titulo,
        formato:    form.formato,
        id_track:   parseInt(form.id_track),
        nivel:      form.nivel,
        descricao:  form.descricao,
        id_creator: dados?.usuarioLogado?.id_usuario || 1,
      });
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Proposta criada com sucesso!');
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
      // Importante: atualizar grade/sessoes no contexto. onRefresh aqui recarrega propostas, precisamos garantir que recarregue sessoes tb. Mas para não quebrar, apenas avisamos sucesso. (Idealmente o dashboard já vai buscar no reload).
      await onRefresh();
      // Mostramos o toast e fechamos. O ideal seria ter refreshSessoes aqui, mas faremos a página dar reload se necessário, ou só notificar.
      setPopup(null);
      toast.success('Atividade agendada com sucesso na grade!');
      // Redirecionamento forçado para a grade para atualizar a view de sessoes (opcional):
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
      toast.success('Proposta excluída!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao excluir.');
      setErro(msg);
      toast.error(msg);
      setConfirmDel(false);
    } finally {
      setLoading(false);
    }
  }

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
              placeholder="Pesquisar por título, descrição..."
              totalResultados={propostasFiltradas.length}
              totalGeral={propostas.length}
            />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2">
                  <h2>Propostas</h2>
                  <img className="pcard-icon" src="imgbb/sessao.png" alt="" />
                </div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {propostasFiltradas.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{propostas.length}</span>
                    </h1>
                    <p className="pcard-subtitle">
                      Propostas{propostasFiltradas.length !== propostas.length ? ' encontradas' : ' cadastradas'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" /><small>{aprovadas} aprovadas</small></div>
                  <div className="statusp-item orange"><span className="pulse" /><small>{pendentes} em curadoria</small></div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list">
                {propostasFiltradas.map(p => {
                  const cor = corTrilha(p.id_track);
                  const agendada = naGrade(p.id_proposal);
                  return (
                    <div key={p.id_proposal} className={`card-evento`}
                      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => abrirView(p)}>
                      <div style={{ position:'absolute', right:0, top:0, width:10, height:'100%',
                        background: cor, borderRadius:'0 16px 16px 0' }} />
                      <div className="card-info">
                        <h2 className="card-titulo">{p.titulo}</h2>
                        <p className="card-trilha">{nomeTrilha(p.id_track)}</p>
                        <p className="card-horario">{p.formato || '—'} {p.nivel ? `· ${p.nivel}` : ''}</p>
                        {agendada && <span style={{ color: '#00D26A', fontSize: 13, fontWeight: 600 }}>Na grade</span>}
                      </div>
                      <div className="status-bola-evento"
                        style={{ background: p.status === 'APPROVED' ? '#00D26A' : p.status === 'REJECTED' ? '#EF4444' : '#F59E0B' }} />
                    </div>
                  );
                })}
                {propostasFiltradas.length === 0 && (
                  <p style={{ color: '#888', padding: 16 }}>Nenhuma proposta encontrada com os filtros aplicados.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar proposta
            </button>
          </div>
        </div>
      </div>

      {/* VIEW */}
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
            <p className="popup-card-horario">{selected.formato} {selected.nivel ? `· ${selected.nivel}` : ''}</p>
            <div className="popup-card-info">
              <div>
                <p><strong>Status:</strong> {STATUS_LABEL[selected.status] || selected.status}</p>
                <p><strong>Na grade:</strong> {naGrade(selected.id_proposal) ? 'Sim' : 'Não'}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id_proposal}</p></div>
            </div>
            {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '8px 0 0' }}>{erro}</p>}
          </>
        )}
      </PopupCard>

      {/* EDITAR */}
      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Proposta">
        {campoForm('Título', 'titulo')}
        {campoForm('Tipo', 'formato', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campoForm('Trilha', 'id_track', 'select', trilhas.map(t => ({ v: t.id_track, l: t.nome })))}
        {campoForm('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campoForm('Descrição', 'descricao', 'textarea')}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </Popup>

      {/* CRIAR */}
      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Proposta">
        {campoForm('Título', 'titulo')}
        {campoForm('Tipo', 'formato', 'select', TIPOS_OPCOES.map(t => ({ v: t, l: t })))}
        {campoForm('Trilha', 'id_track', 'select', trilhas.map(t => ({ v: t.id_track, l: t.nome })))}
        {campoForm('Nível', 'nivel', 'select', NIVEIS.map(n => ({ v: n, l: n })))}
        {campoForm('Descrição', 'descricao', 'textarea')}
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
        <ConfirmDelete
          mensagem={`Deseja excluir a proposta "${selected?.titulo}" permanentemente?${naGrade(selected?.id_proposal) ? ' Atenção: esta proposta está na grade!' : ''}`}
          onConfirmar={deletar}
          onCancelar={() => setConfirmDel(false)}
        />
      )}
    </div>
  );
}
