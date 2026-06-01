import { useState } from 'react';
import Popup, { PopupCard } from '../components/Popup.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import FiltroAvancado, { aplicarFiltros } from '../components/FiltroAvancado.jsx';
import { proximoId } from '../data/inicial.js';

const ICONE = 'https://cdn-icons-png.flaticon.com/512/109/109613.png';
const FORM_VAZIO = { hora: '', dia: '26' };
const FILTROS_VAZIOS = {
  busca: '', buscaId: '', dia: [], periodo: [], status: [], ordenarPor: 'hora', ordenarDir: 'asc',
};

export default function Horarios({ dados, setDados }) {
  const [popup, setPopup]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(FORM_VAZIO);
  const [confirmDel, setConfirmDel] = useState(false);
  const [filtros, setFiltros]   = useState(FILTROS_VAZIOS);

  const horarios = dados?.horarios || [];
  const sessoes  = dados?.sessoes  || [];

  const configFiltro = {
    grupos: [
      { chave: 'dia', label: 'Dia do Evento', opcoes: ['21/09', '22/09', '23/09'] },
      { chave: 'periodo', label: 'Período', opcoes: ['Manhã', 'Tarde', 'Noite'] },
      { chave: 'status',  label: 'Status',   opcoes: ['Ocupado', 'Disponível'] },
    ],
    ordenarPor: [
      { v: 'hora', l: 'Horário' },
      { v: 'dia',  l: 'Dia' },
    ],
  };

  function getPeriodo(hora) {
    const h = parseInt((hora || '00:00').split(':')[0]);
    if (h >= 6  && h < 12) return 'Manhã';
    if (h >= 12 && h < 18) return 'Tarde';
    if (h >= 18) return 'Noite';
    return 'Madrugada';
  }

  const camposFiltro = {
    busca:   ['hora', 'dia'],
    buscaId: 'id',
    dia:     item => item.dia,
    periodo: item => getPeriodo(item.hora),
    status:  item => sessoes.some(s => s.horario === item.hora && s.dia === item.dia) ? 'Ocupado' : 'Disponível',
    ordenar: { hora: 'hora', dia: 'dia' },
  };

  const horariosFiltrados = aplicarFiltros(horarios, filtros, camposFiltro);

  function abrirView(h) { setSelected(h); setPopup('view'); }
  function abrirEditar(h) {
    setForm({ hora: h.hora, dia: h.dia });
    setSelected(h); setPopup('editar');
  }
  function salvarEdicao() {
    setDados(d => ({ ...d, horarios: d.horarios.map(h => h.id === selected.id ? { ...h, ...form } : h) }));
    setPopup(null);
  }
  function salvarNovo() {
    const novoId = proximoId('H', horarios);
    setDados(d => ({ ...d, horarios: [...d.horarios, { ...form, id: novoId }] }));
    setForm(FORM_VAZIO); setPopup(null);
  }
  function deletar() {
    setDados(d => ({ ...d, horarios: d.horarios.filter(h => h.id !== selected.id) }));
    setConfirmDel(false); setPopup(null); setSelected(null);
  }

  return (
    <div className="page">
      <div className="spacePage2">
        <div className="conteudo">

          <div className="gridp">
            <h1 id="part">Visão geral</h1>
            <FiltroAvancado filtros={filtros} setFiltros={setFiltros}
              config={configFiltro} placeholder="Pesquisar por horário, dia..."
              totalResultados={horariosFiltrados.length}
              totalGeral={horarios.length} />
          </div>

          <div className="pag-grid">
            <div>
              <div className="page-card1">
                <div className="resume2"><h2>Horários</h2><img className="pcard-icon" src={ICONE} alt="" /></div>
                <div className="pnumber-status">
                  <div>
                    <h1 className="pcard-number">
                      {horariosFiltrados.length}
                      <span style={{fontSize:14,fontWeight:400,color:'#888'}}>/{horarios.length}</span>
                    </h1>
                    <p className="pcard-subtitle">Horários{horariosFiltrados.length !== horarios.length ? ' encontrados' : ' cadastrados'}</p>
                  </div>
                </div>
              </div>
              <div className="page-card2">
                <div className="status"><h2>Status</h2></div>
                <div className="status-page">
                  <div className="statusp-item green"><span className="pulse" />
                    <small>{horarios.filter(h => sessoes.some(s => s.horario === h.hora)).length} em uso</small>
                  </div>
                  <div className="statusp-item orange"><span className="pulse" />
                    <small>{horarios.filter(h => !sessoes.some(s => s.horario === h.hora)).length} disponíveis</small>
                  </div>
                  <p className="pcard-subtitle" style={{ marginLeft:10 }}>Desde a última atualização</p>
                </div>
              </div>
            </div>

            <div className="page-card3">
              <div className="card-list" style={{ flexDirection:'column', width:'100%' }}>
                {horariosFiltrados.map(h => {
                  const emUso = sessoes.some(s => s.horario === h.hora && s.dia === h.dia);
                  const periodo = getPeriodo(h.hora);
                  return (
                    <div key={h.id} className="mini-table-card" onClick={() => abrirView(h)}
                      style={{ cursor:'pointer' }}>
                      <div className="mini-card-nome">{h.hora}</div>
                      <div style={{ fontSize:12, color:'#666' }}>Dia {h.dia} · {periodo}</div>
                      <div className={`mini-card-status ${emUso ? 'ocupado' : 'disponivel'}`}>
                        {emUso ? 'Ocupado' : 'Disponível'}
                      </div>
                    </div>
                  );
                })}
                {horariosFiltrados.length === 0 && (
                  <p style={{ color:'#888', padding:16 }}>Nenhum horário encontrado.</p>
                )}
              </div>
            </div>
          </div>

          <div className="below-btn">
            <button className="ce-btnp" onClick={() => { setForm(FORM_VAZIO); setPopup('criar'); }}>Criar horário</button>
          </div>
        </div>
      </div>

      <PopupCard aberto={popup === 'view'} onFechar={() => setPopup(null)}
        onEditar={() => abrirEditar(selected)} onDeletar={() => setConfirmDel(true)}>
        {selected && (
          <>
            <div className="topo-card">
              <p className="popup-card-horario">{selected.hora}</p>
              <img className="popup-logo-bb" src="imgbb/bb.png" alt="" />
            </div>
            <div className="popup-card-info">
              <div>
                <p><strong>Dia:</strong> {selected.dia}</p>
                <p><strong>Período:</strong> {getPeriodo(selected.hora)}</p>
                <p><strong>Sessões alocadas:</strong> {sessoes.filter(s => s.horario === selected.hora && s.dia === selected.dia).length}</p>
              </div>
              <div><p><strong>ID:</strong> {selected.id}</p></div>
            </div>
          </>
        )}
      </PopupCard>

      <Popup aberto={popup === 'editar'} onFechar={() => setPopup(null)} titulo="Editar Horário">
        <div className="campo-popup">
          <label>Horário</label>
          <input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
        </div>
        <div className="campo-popup">
          <label>Dia</label>
          <select value={form.dia} onChange={e => setForm(f => ({ ...f, dia: e.target.value }))}>
            <option value="26">26/03</option>
            <option value="27">27/03</option>
            <option value="28">28/03</option>
          </select>
        </div>
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup('view')}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarEdicao}>Salvar Alterações</button>
        </div>
      </Popup>

      <Popup aberto={popup === 'criar'} onFechar={() => setPopup(null)} titulo="Cadastrar Horário">
        <div className="campo-popup">
          <label>Horário</label>
          <input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
        </div>
        <div className="campo-popup">
          <label>Dia</label>
          <select value={form.dia} onChange={e => setForm(f => ({ ...f, dia: e.target.value }))}>
            <option value="26">26/03</option>
            <option value="27">27/03</option>
            <option value="28">28/03</option>
          </select>
        </div>
        <div className="popup-botoes">
          <button className="cancelar-btn" onClick={() => setPopup(null)}>Cancelar</button>
          <button className="salvar-btn" onClick={salvarNovo}>Salvar</button>
        </div>
      </Popup>

      {confirmDel && (
        <ConfirmDelete mensagem={`Deseja excluir o horário "${selected?.hora}" permanentemente?`}
          onConfirmar={deletar} onCancelar={() => setConfirmDel(false)} />
      )}
    </div>
  );
}