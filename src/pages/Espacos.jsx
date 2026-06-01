import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { proximoId } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/61/61942.png';
const FORM_VAZIO = { nome: '', tipo: 'Sala', descricao: '' };
const TIPOS = ['Sala', 'Auditório', 'Palco'];

const FILTROS_VAZIOS = {
  busca: '', buscaId: '', tipo: [], status: [], ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Espacos({ dados, setDados }) {
  const [popup, setPopup]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]   = useState(FILTROS_VAZIOS);

  const espacos = dados?.espacos || [];
  const sessoes = dados?.sessoes || [];

  const configFiltro = {
    grupos: [
      { chave: 'tipo',   label: 'Tipo de Espaço', opcoes: TIPOS },
      { chave: 'status', label: 'Status',          opcoes: ['Ocupado', 'Disponível'] },
    ],
    ordenarPor: [
      { v: 'nome', l: 'Nome' },
      { v: 'tipo', l: 'Tipo' },
    ],
  };

  const camposFiltro = {
    busca:  ['nome', 'tipo', 'descricao'],
    buscaId: 'id',
    tipo:   'tipo',
    status: item => sessoes.some(s => s.local === item.nome) ? 'Ocupado' : 'Disponível',
    ordenar: { nome: 'nome', tipo: 'tipo' },
  };

  const espacosFiltrados = aplicarFiltros(espacos, filtros, camposFiltro);

  function abrirView(e) { setSelected(e); setPopup('view'); }
  function abrirEditar(e) {
    setForm({ nome: e.nome, tipo: e.tipo, descricao: e.descricao });
    setSelected(e); setPopup('editar');
  }
  function salvarEdicao() {
    setDados(d => ({ ...d, espacos: d.espacos.map(e => e.id === selected.id ? { ...e, ...form } : e) }));
    setPopup(null);
  }
  function salvarNovo() {
    const novoId = proximoId('E', espacos);
    setDados(d => ({ ...d, espacos: [...d.espacos, { ...form, id: novoId }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }
  function deletar() {
    setDados(d => ({ ...d, espacos: d.espacos.filter(e => e.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
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
        <input type="text" value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
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
                    <small>{espacos.filter(e => sessoes.some(s => s.local === e.nome)).length} em uso</small>
                  </div>
                  <div className="statusp-item orange"><span className="pulse" />
                    <small>{espacos.filter(e => !sessoes.some(s => s.local === e.nome)).length} disponíveis</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list" style={{ flexDirection:'column', width:'100%' }}>
                {espacosFiltrados.map(e => {
                  const emUso = sessoes.some(s => s.local === e.nome);
                  return (
                    <div key={e.id} className="mini-table-card" onClick={() => abrirView(e)}
                      style={{ cursor:'pointer' }}>
                      <div className="mini-card-nome">{e.nome}</div>
                      <div style={{ fontSize:12, color:'#666' }}>{e.tipo}</div>
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
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar espaço</button>
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
            <div className="popup-card-descricao"><h3>Descrição</h3><p>{selected.descricao || '—'}</p></div>
            <div className="popup-card-info">
              <div>
                <p><strong>Tipo:</strong> {selected.tipo}</p>
                <p><strong>Sessões alocadas:</strong> {sessoes.filter(s => s.local === selected.nome).length}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Espaço">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS.map(t => ({ v: t, l: t })))}
        {campo('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Espaço">
        {campo('Nome', 'nome')}
        {campo('Tipo', 'tipo', 'select', TIPOS.map(t => ({ v: t, l: t })))}
        {campo('Descrição', 'descricao', 'textarea')}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir o espaço "${selected?.nome}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}