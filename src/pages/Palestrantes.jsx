import { useState } from "react";
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import {
  criarPalestrante,
  editarPalestrante,
  deletarPalestrante,
} from '../services/api.js';
import { toast } from '../components/Toast.jsx';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/33/33308.png';
const FORM_VAZIO = { nome: '', email: '', senha: '', bio: '', empresa: '' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Palestrantes({ dados, onRefresh }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');

  const palestrantes = dados?.palestrantes || [];

  const configFiltro = {
    grupos: [],
    ordenarPor: [{ v:'nome', l:'Nome' }, { v:'empresa', l:'Empresa' }],
  };

  const camposFiltro = {
    busca:   ['nome', 'email', 'bio', 'empresa'],
    buscaId: 'id_speaker',
    ordenar: { nome: 'nome', empresa: 'empresa' },
  };

  const palesFiltrados = aplicarFiltros(palestrantes, filtros, camposFiltro);

  function abrirView(p)   { setSelected(p); setPopup('view'); setErro(''); }
  function abrirEditar(p) {
    setForm({ nome: p.nome || '', email: p.email || '', senha: '', bio: p.bio || '', empresa: p.empresa || '' });
    setSelected(p); setPopup('editar'); setErro('');
  }

  async function salvarEdicao() {
    setLoading(true); setErro('');
    try {
      const payload = { nome: form.nome, email: form.email, bio: form.bio, empresa: form.empresa };
      await editarPalestrante(selected.id_speaker, payload);
      await onRefresh();
      setPopup(null);
      toast.success('Palestrante atualizado!');
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
      await criarPalestrante({
        nome:    form.nome,
        email:   form.email,
        senha:   form.senha,
        bio:     form.bio,
        empresa: form.empresa,
      });
      await onRefresh();
      setForm(FORM_VAZIO); setPopup(null);
      toast.success('Palestrante criado com sucesso!');
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
      await deletarPalestrante(selected.id_speaker);
      await onRefresh();
      setConfirmDel(false); setPopup(null); setSelected(null);
      toast.success('Palestrante excluído do sistema!');
    } catch (err) {
      const msg = err.status === 0 ? 'Sem conexão com o servidor.' : (err.message || 'Erro ao excluir. Tente novamente.');
      setErro(msg);
      toast.error(msg);
      setConfirmDel(false);
    } finally {
      setLoading(false);
    }
  }

  const campo = (lbl, name, tipo = 'input') => (
    <div className="campo-popup" key={name}>
      <label>{lbl}</label>
      <input type={tipo} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={`Digite ${lbl.toLowerCase()}`} />
    </div>
  );

  return (
    <div className="page">
      <div className="spacePage2">
        <div className="conteudo">
          <div className="gridp">
            <h1 id="part">Visão geral</h1>
            <div className="filter-pages">
              <FiltroAvancado
                filtros={filtros}
                setFiltros={setFiltros}
                config={configFiltro}
                placeholder="Pesquisar por nome, e-mail, empresa..."
                totalResultados={palesFiltrados.length}
                totalGeral={palestrantes.length}
              />
            </div>
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2"><h2>Palestrantes</h2><img className="pcard-icon" src={ICONE} alt="" /></div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">{palestrantes.length}</h1>
                    <p className="pcard-subtitle">Palestrantes cadastrados</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Dados</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" /><small>{palestrantes.length} palestrantes</small></div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Cadastrados no sistema</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list">
                {palesFiltrados.map(p => (
                  <div key={p.id_speaker} className="card-palestrante" onClick={() => abrirView(p)}>
                    <div style={{ position:'absolute', right:0, top:0, width:10, height:'100%', background: '#465EFF' }} />
                    <div className="foto-p" style={{
                      background: '#465EFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 40, fontWeight: 700,
                    }}>
                      {(p.nome || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="card-infop">
                      <h3>{p.nome}</h3>
                      <p style={{ color: '#666' }}>{p.email || '—'}</p>
                      {p.empresa && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.empresa}</p>}
                      {p.bio && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.bio}</p>}
                    </div>
                  </div>
                ))}
                {palesFiltrados.length === 0 && (
                  <p style={{ color:'#888', padding:12 }}>Nenhum palestrante encontrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); setErro(''); }}>
              Criar palestrante
            </button>
          </div>
        </div>
      </div>

      {/* VIEW */}
      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}>
        {selected && (
          <>
            <div className="topo-card" style={{ gap: 16 }}>
              <h2 className="popup-card-titulo">{selected.nome}</h2>
              <div className="foto-palestrante-popup" style={{
                width: 80, height: 80, borderRadius: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#465EFF', fontSize: 36, fontWeight: 700, color: 'white',
              }}>
                {(selected.nome || '?').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="popup-card-info">
              <div>
                <p><strong>E-mail:</strong> {selected.email || '—'}</p>
                <p><strong>Empresa:</strong> {selected.empresa || '—'}</p>
                <p><strong>Bio:</strong> {selected.bio || '—'}</p>
              </div>
              <div><p><strong>ID Speaker:</strong> {selected.id_speaker}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      {/* EDITAR */}
      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Palestrante">
        {campo('Nome', 'nome')}
        {campo('E-mail', 'email', 'email')}
        {campo('Empresa', 'empresa')}
        <div className="campo-popup">
          <label>Bio</label>
          <textarea value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Biografia do palestrante" />
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
      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Palestrante">
        {campo('Nome', 'nome')}
        {campo('E-mail', 'email', 'email')}
        {campo('Senha', 'senha', 'password')}
        {campo('Empresa', 'empresa')}
        <div className="campo-popup">
          <label>Bio</label>
          <textarea value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Biografia do palestrante" />
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
        <ConfirmDelete mensagem={`Deseja excluir o palestrante "${selected?.nome}" permanentemente? Isso também removerá o usuário do sistema.`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}
