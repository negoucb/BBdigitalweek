import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import {
  criarHorario,
  editarHorario,
  deletarHorario,
} from '../services/api.js';
import { toast } from '../components/Toast.jsx';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/109/109613.png';
const DURATION_OPTS = [
  { v: 1, l: '1 unidade (25 min)' },
  { v: 2, l: '2 unidades (50 min)' },
];
const TIPO_OPTS = [
  { v: 'normal',          l: 'Normal' },
  { v: 'keynote',         l: 'Keynote' },
  { v: 'keynote_tecnico', l: 'Keynote Técnico' },
];
// Formulário alinhado ao modelo do backend (Slot)
const FORM_VAZIO = { start_time: '', duration_units: 1, id_stage: '', tipo: 'normal' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', ordenarPor: 'start_time', ordenarDir: 'asc',
};

function formatarData(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return dt; }
}

export default function Horarios({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  const horarios = dados?.horarios || [];
  const sessoes  = dados?.sessoes  || [];
  const espacos  = dados?.espacos  || [];

  const configFiltro = {
    grupos: [
      { chave: 'tipo', label: 'Tipo', opcoes: TIPO_OPTS.map(t => t.l) },
    ],
    ordenarPor: [
      { v: 'start_time', l: 'Data/Hora' },
    ],
  };

  const camposFiltro = {
    busca:   ['start_time', 'tipo'],
    buscaId: 'id_slot',
    tipo:    'tipo',
    ordenar: { start_time: 'start_time' },
  };

  const horariosFiltrados = aplicarFiltros(horarios, filtros, camposFiltro);

  function abrirView(h)   { setSelected(h); setPopup('view'); setErro(''); }
  function abrirEditar(h) {
    setForm({
      start_time:     h.start_time?.slice(0, 16) || '',
      duration_units: h.duration_units || 1,
      id_stage:       h.id_stage || '',
      tipo:           h.tipo || 'normal',
    });
    setSelected(h); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      await editarHorario(selected.id_slot, {
        start_time:     form.start_time,
        duration_units: parseInt(form.duration_units),
        id_stage:       parseInt(form.id_stage),
        tipo:           form.tipo,
      });
      await onRefresh();
      setPopup(null);
      toast.success('Slot atualizado com sucesso!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao salvar. Tente novamente.');
      setErro(msg);
      if (err.status === 0) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function salvarNovo() {
    if (!form.id_stage) { setErro('Selecione um espaço.'); return; }
    setLoading(true); setErro('');
    try {
      await criarHorario({
        start_time:     form.start_time,
        duration_units: parseInt(form.duration_units),
        id_stage:       parseInt(form.id_stage),
        tipo:           form.tipo,
      });
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Slot criado com sucesso!');
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
      await deletarHorario(selected.id_slot);
      await onRefresh();
      setConfirmDel(false); setPopup(null); setSelected(null);
      toast.success('Slot excluído!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao excluir. Tente novamente.');
      setErro(msg);
      toast.error(msg);
      setConfirmDel(false);
    } finally {
      setLoading(false);
    }
  }

  const nomePalco = (id_stage) =>
    espacos.find(e => e.id_stage === id_stage)?.nome || `Stage #${id_stage}`;

  return (
    <div className="page">
      <div className="spacePage2">
        <div className="conteudo">

          <div className="gridp">
            <h1 id="part">Visão geral</h1>
            <FiltroAvancado filtros={filtros} setFiltros={setFiltros}
              config={configFiltro} placeholder="Pesquisar por tipo..."
              totalResultados={horariosFiltrados.length}
              totalGeral={horarios.length} />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2"><h2>Slots de Horário</h2><img className="pcard-icon" src={ICONE} alt="" /></div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {horariosFiltrados.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{horarios.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Slots{horariosFiltrados.length !== horarios.length ? ' encontrados' : ' cadastrados'}</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" />
                    <small>{horarios.filter(h => sessoes.some(s => s.id_slot === h.id_slot)).length} em uso</small>
                  </div>
                  <div className="statusp-item orange"><span className="pulse" />
                    <small>{horarios.filter(h => !sessoes.some(s => s.id_slot === h.id_slot)).length} disponíveis</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft:10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list" style={{ flexDirection:'column', width:'100%' }}>
                {horariosFiltrados.map(h => {
                  const emUso = sessoes.some(s => s.id_slot === h.id_slot);
                  return (
                    <div key={h.id_slot} className="mini-table-card" onClick={() => abrirView(h)}
                      style={{ cursor:'pointer' }}>
                      <div className="mini-card-nome">{formatarData(h.start_time)}</div>
                      <div style={{ fontSize:12, color:'#666' }}>
                        {nomePalco(h.id_stage)} · {h.duration_units === 2 ? '50 min' : '25 min'} · {h.tipo}
                      </div>
                      <div className={`mini-card-status ${emUso ? 'ocupado' : 'disponivel'}`}>
                        {emUso ? 'Ocupado' : 'Disponível'}
                      </div>
                    </div>
                  );
                })}
                {horariosFiltrados.length === 0 && (
                  <p style={{ color:'#888', padding:16 }}>Nenhum slot encontrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar slot
            </button>
          </div>
        </div>
      </div>

      {/* VIEW */}
      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}>
        {selected && (
          <>
            <div className="topo-card">
              <p className="popup-card-horario">{formatarData(selected.start_time)}</p>
              <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
            </div>
            <div className="popup-card-info">
              <div>
                <p><strong>Espaço:</strong> {nomePalco(selected.id_stage)}</p>
                <p><strong>Duração:</strong> {selected.duration_units === 2 ? '50 min' : '25 min'}</p>
                <p><strong>Tipo:</strong> {selected.tipo}</p>
                <p><strong>Sessões alocadas:</strong> {sessoes.filter(s => s.id_slot === selected.id_slot).length}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id_slot}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      {/* EDITAR */}
      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Slot">
        <div className="campo-popup">
          <label>Data e Hora de início</label>
          <input type="datetime-local" value={form.start_time}
            onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
        </div>
        <div className="campo-popup">
          <label>Duração</label>
          <select value={form.duration_units} onChange={e => setForm(f => ({ ...f, duration_units: parseInt(e.target.value) }))}>
            {DURATION_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div className="campo-popup">
          <label>Espaço (Palco)</label>
          <select value={form.id_stage} onChange={e => setForm(f => ({ ...f, id_stage: e.target.value }))}>
            <option value="">Selecione...</option>
            {espacos.map(e => <option key={e.id_stage} value={e.id_stage}>{e.nome}</option>)}
          </select>
        </div>
        <div className="campo-popup">
          <label>Tipo</label>
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {TIPO_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </Popup>

      {/* CRIAR */}
      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Slot">
        <div className="campo-popup">
          <label>Data e Hora de início</label>
          <input type="datetime-local" value={form.start_time}
            onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
        </div>
        <div className="campo-popup">
          <label>Duração</label>
          <select value={form.duration_units} onChange={e => setForm(f => ({ ...f, duration_units: parseInt(e.target.value) }))}>
            {DURATION_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div className="campo-popup">
          <label>Espaço (Palco)</label>
          <select value={form.id_stage} onChange={e => setForm(f => ({ ...f, id_stage: e.target.value }))}>
            <option value="">Selecione...</option>
            {espacos.map(e => <option key={e.id_stage} value={e.id_stage}>{e.nome}</option>)}
          </select>
        </div>
        <div className="campo-popup">
          <label>Tipo</label>
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {TIPO_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir o slot "${formatarData(selected?.start_time)}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}