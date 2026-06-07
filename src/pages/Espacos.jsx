import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import {
  criarEspaco,
  editarEspaco,
  deletarEspaco,
} from '../services/api.js';
import { toast } from '../components/Toast.jsx';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/61/61942.png';
const TIPOS = ['Sala', 'Auditório', 'Palco'];
const DURACOES_SLOT = [
  { v: 25, l: '25 minutos' },
  { v: 50, l: '50 minutos' },
];
const FORM_VAZIO = { nome: '', tipo: 'Sala', capacidade: '', duracao_slot: 25 };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', tipo: [], ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Espacos({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  const espacos = dados?.espacos || [];
  const sessoes = dados?.sessoes || [];  // sessões da grade para mostrar uso

  const configFiltro = {
    grupos: [
      { chave: 'tipo', label: 'Tipo de Espaço', opcoes: TIPOS },
    ],
    ordenarPor: [
      { v: 'nome', l: 'Nome' },
      { v: 'tipo', l: 'Tipo' },
    ],
  };

  const camposFiltro = {
    busca:   ['nome', 'tipo'],
    buscaId: 'id_stage',
    tipo:    'tipo',
    ordenar: { nome: 'nome', tipo: 'tipo' },
  };

  const espacosFiltrados = aplicarFiltros(espacos, filtros, camposFiltro);

  function abrirView(e)   { setSelected(e); setPopup('view'); setErro(''); }
  function abrirEditar(e) {
    setForm({ nome: e.nome, tipo: e.tipo || 'Sala', capacidade: e.capacidade || '', duracao_slot: e.duracao_slot || 25 });
    setSelected(e); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      await editarEspaco(selected.id_stage, {
        nome: form.nome,
        tipo: form.tipo,
        capacidade: form.capacidade ? parseInt(form.capacidade) : null,
        duracao_slot: parseInt(form.duracao_slot),
      });
      await onRefresh();
      setPopup(null);
      toast.success('Espaço atualizado!');
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
      await criarEspaco({
        nome: form.nome,
        tipo: form.tipo,
        capacidade: form.capacidade ? parseInt(form.capacidade) : null,
        duracao_slot: parseInt(form.duracao_slot),
      });
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Espaço criado com sucesso!');
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
      await deletarEspaco(selected.id_stage);
      await onRefresh();
      setConfirmDel(false); setPopup(null); setSelected(null);
      toast.success('Espaço excluído!');
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
        <select value={form[name] ?? ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}>
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
              config={configFiltro} placeholder="Pesquisar por nome, tipo..."
              totalResultados={espacosFiltrados.length}
              totalGeral={espacos.length} />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2"><h2>Espaços</h2><img className="pcard-icon" src={ICONE} alt="" /></div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {espacosFiltrados.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{espacos.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Espaços{espacosFiltrados.length !== espacos.length ? ' encontrados' : ' cadastrados'}</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" />
                    <small>{espacos.filter(e => sessoes.some(s => s.id_stage === e.id_stage)).length} em uso</small>
                  </div>
                  <div className="statusp-item orange"><span className="pulse" />
                    <small>{espacos.filter(e => !sessoes.some(s => s.id_stage === e.id_stage)).length} disponíveis</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list" style={{ flexDirection:'column', width:'100%' }}>
                {espacosFiltrados.map(e => {
                  const emUso = sessoes.some(s => s.id_stage === e.id_stage);
                  return (
                    <div key={e.id_stage} className="mini-table-card" onClick={() => abrirView(e)}
                      style={{ cursor:'pointer' }}>
                      <div className="mini-card-nome">{e.nome}</div>
                      <div style={{ fontSize:12, color:'#666' }}>{e.tipo} · {e.duracao_slot}min/slot · cap. {e.capacidade || '—'}</div>
                      <div className={`mini-card-status ${emUso ? 'ocupado' : 'disponivel'}`}>
                        {emUso ? 'Ocupado' : 'Disponível'}
                      </div>
                    </div>
                  );
                })}
                {espacosFiltrados.length === 0 && (
                  <p style={{ color:'#888', padding:16 }}>Nenhum espaço encontrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar espaço
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
              <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
            </div>
            <div className="popup-card-info">
              <div>
                <p><strong>Tipo:</strong> {selected.tipo}</p>
                <p><strong>Capacidade:</strong> {selected.capacidade || '—'}</p>
                <p><strong>Duração do slot:</strong> {selected.duracao_slot} minutos</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id_stage}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Espaço">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS.map(t => ({ v: t, l: t })))}
        {campo('Capacidade', 'capacidade', 'number')}
        {campo('Duração do slot', 'duracao_slot', 'select', DURACOES_SLOT)}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Espaço">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS.map(t => ({ v: t, l: t })))}
        {campo('Capacidade', 'capacidade', 'number')}
        {campo('Duração do slot', 'duracao_slot', 'select', DURACOES_SLOT)}
        {erro && <p style={{ color: '#D92D20', fontSize: 13, margin: '4px 0' }}>{erro}</p>}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)} disabled={loading}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir o espaço "${selected?.nome}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}