import { useState } from "react";
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { COR_TRILHA, NOME_TRILHA, proximoId } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/33/33308.png';
const FORM_VAZIO = { nome: '', area: '', atuacao: '', trilha: '', horarios: [], foto: '' };

const FILTROS_VAZIOS = {
  busca: '', buscaId: '',
  trilha: [], status: [],
  ordenarPor: 'nome', ordenarDir: 'asc',
};

export default function Palestrantes({ dados, setDados }) {
  const [popup, setPopup]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]       = useState(FILTROS_VAZIOS);

  const palestrantes = dados?.palestrantes || [];
  const trilhas      = dados?.trilhas      || [];
  const horarios     = dados?.horarios     || [];

  const ocupados    = palestrantes.filter(p => (p.horarios || []).length > 0).length;
  const disponiveis = palestrantes.filter(p => !(p.horarios || []).length).length;

  const configFiltro = {
    grupos: [
      { chave: 'trilha', label: 'Trilha',  opcoes: trilhas.map(t => t.nome) },
      { chave: 'status', label: 'Status',  opcoes: ['Ocupado', 'Disponível'] },
    ],
    ordenarPor: [{ v:'nome', l:'Nome' }, { v:'area', l:'Área' }],
  };

  const camposFiltro = {
    busca:   ['nome', 'area', 'atuacao'],
    buscaId: 'id',
    trilha:  item => item.trilha,
    status:  item => (item.horarios || []).length > 0 ? 'Ocupado' : 'Disponível',
    ordenar: { nome: 'nome', area: 'area' },
  };

  const palesFiltrados = aplicarFiltros(palestrantes, filtros, camposFiltro);

  function abrirView(p)  { setSelected(p); setPopup('view'); }
  function abrirEditar(p) {
    setForm({ nome: p.nome, area: p.area, atuacao: p.atuacao, trilha: p.trilha, horarios: p.horarios || [], foto: p.foto || '' });
    setSelected(p); setPopup('editar');
  }
  function salvarEdicao() {
    setDados(d => ({ ...d, palestrantes: d.palestrantes.map(p => p.id === selected.id ? { ...p, ...form } : p) }));
    setPopup(null);
  }
  function salvarNovo() {
    const novoId = proximoId('P', palestrantes);
    setDados(d => ({ ...d, palestrantes: [...d.palestrantes, { ...form, id: novoId, status: 'andamento' }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }
  function deletar() {
    setDados(d => ({ ...d, palestrantes: d.palestrantes.filter(p => p.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
  }
  function aprovar() {
    setDados(d => ({ ...d, palestrantes: d.palestrantes.map(p => p.id === selected.id ? { ...p, status: 'aprovado' } : p) }));
    setSelected(prev => ({ ...prev, status: 'aprovado' })); setPopup(null);
  }

  const trilhaOpts  = trilhas.map(t => ({ v: Object.keys(COR_TRILHA).find(k => t.nome.toLowerCase().includes(k)) || t.id, l: t.nome }));
  const horarioOpts = horarios.map(h => ({ v: h.hora, l: `${h.hora} — Dia ${h.dia}` }));

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
      ) : tipo === 'file' ? (
        <input type="file" accept="image/*" onChange={e => {
          const f = e.target.files[0]; if (!f) return;
          const reader = new FileReader();
          reader.onload = ev => setForm(prev => ({ ...prev, foto: ev.target.result }));
          reader.readAsDataURL(f);
        }} />
      ) : (
        <input type={tipo} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={`Digite ${lbl.toLowerCase()}`} />
      )}
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
                placeholder="Pesquisar por nome, área..."
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
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" /><small>{ocupados} Ocupados</small></div>
                  <div className="statusp-item orange"><span className="pulse" /><small>{disponiveis} Disponíveis</small></div>
                  <p className="pcard-subtitle" style={{ marginLeft: 10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list">
                {palesFiltrados.map(p => {
                  const cor = COR_TRILHA[p.trilha] || '#9CA3AF';
                  const estaOcupado = (p.horarios || []).length > 0;
                  return (
                    <div key={p.id} className="card-palestrante"
                      onClick={() => abrirView(p)}
                    >
                      {/* barra lateral de cor da trilha */}
                      <div style={{ position:'absolute', right:0, top:0, width:10, height:'100%', background: cor }} />
                      <div className="foto-p" style={{
                        background: p.foto ? 'none' : cor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 40, fontWeight: 700,
                      }}>
                        {p.foto
                          ? <img src={p.foto} alt={p.nome} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:20 }} />
                          : p.nome.charAt(0)}
                      </div>
                      <div className="card-infop">
                        <h3>{p.nome}</h3>
                        <p style={{ color: '#666' }}>{p.area || '—'}</p>
                        {p.atuacao && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.atuacao}</p>}
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>{p.id}</p>
                        <span id="badge-status-palestrante" className={`mini-card-status ${estaOcupado ? 'ocupado' : 'disponivel'}`}>
                          {estaOcupado ? 'Ocupado' : 'Disponível'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {palesFiltrados.length === 0 && <p style={{ color:'#888', padding:12 }}>Nenhum palestrante encontrado.</p>}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar palestrante</button>
          </div>
        </div>
      </div>

      {/* POPUP VIEW */}
      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)} onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)} onAprovar={aprovar} statusItem={selected?.status} trilhaCor={COR_TRILHA[selected?.trilha] || '#9CA3AF'}>
        {selected && (() => {
          const cor = COR_TRILHA[selected.trilha] || '#9CA3AF';
          return (
            <>
              <div className="topo-card" style={{ gap: 16 }}>
                <h2 className="popup-card-titulo">{selected.nome}</h2>
                {/* Foto grande no popup */}
                <div className="foto-palestrante-popup" style={{
                  width: 120, height: 120, borderRadius: 20, flexShrink: 0,
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: selected.foto ? 'none' : cor,
                  fontSize: 48, fontWeight: 700, color: 'white',
                }}>
                  {selected.foto
                    ? <img src={selected.foto} alt={selected.nome} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : selected.nome.charAt(0)}
                </div>
              </div>
              <div className="popup-card-info">
                <div>
                  <p><strong>Área:</strong> {selected.area || '—'}</p>
                  <p><strong>Atuação:</strong> {selected.atuacao || '—'}</p>
                  <p><strong>Trilha:</strong> {selected.trilha ? (NOME_TRILHA[selected.trilha] || selected.trilha) : '—'}</p>
                  <p><strong>Status:</strong> {(selected.horarios||[]).length > 0 ? 'Ocupado' : 'Disponível'}</p>
                </div>
                <div>
                  <p><strong>ID:</strong> {selected.id}</p>
                  {(selected.horarios||[]).length > 0 && <p><strong>Horários:</strong> {selected.horarios.join(', ')}</p>}
                </div>
              </div>
            </>
          );
        })()}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Palestrante">
        {campo('Nome', 'nome')}
        {campo('Foto', 'foto', 'file')}
        {form.foto && <img src={form.foto} style={{ width:80, height:80, borderRadius:12, objectFit:'cover', margin:'8px 0' }} alt="preview" />}
        {campo('Área', 'area')}
        {campo('Atuação', 'atuacao')}
        {campo('Trilha', 'trilha', 'select', trilhaOpts)}
        {campo('Horário disponível', 'horario_disp', 'select', horarioOpts)}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Palestrante">
        {campo('Nome', 'nome')}
        {campo('Foto', 'foto', 'file')}
        {form.foto && <img src={form.foto} style={{ width:80, height:80, borderRadius:12, objectFit:'cover', margin:'8px 0' }} alt="preview" />}
        {campo('Área', 'area')}
        {campo('Atuação', 'atuacao')}
        {campo('Trilha', 'trilha', 'select', trilhaOpts)}
        {campo('Horário disponível', 'horario_disp', 'select', horarioOpts)}
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && <ConfirmDelete mensagem={`Deseja excluir o palestrante "${selected?.nome}" permanentemente?`} onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />}
    </div>
  );
}
