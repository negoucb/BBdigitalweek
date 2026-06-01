import { useState, useRef, useEffect } from 'react';



export default function FiltroAvancado({
  filtros,
  setFiltros,
  config,
  placeholder = 'Pesquisar...',
  totalResultados,
  totalGeral,
}) {
  const [filtroAberto,  setFiltroAberto]  = useState(false);
  const [ordenarAberto, setOrdenarAberto] = useState(false);
  const [subAberto,     setSubAberto]     = useState(null);
  const refFiltro  = useRef(null);
  const refOrdenar = useRef(null);

  /* fecha dropdowns ao clicar fora */
  useEffect(() => {
    function handler(e) {
      if (refFiltro.current  && !refFiltro.current.contains(e.target))  setFiltroAberto(false);
      if (refOrdenar.current && !refOrdenar.current.contains(e.target)) setOrdenarAberto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleValor(chave, valor) {
    setFiltros(prev => {
      const atual = prev[chave] || [];
      const novo  = atual.includes(valor) ? atual.filter(v => v !== valor) : [...atual, valor];
      return { ...prev, [chave]: novo };
    });
  }

  function limparTudo() {
    const limpo = {};
    (config.grupos || []).forEach(g => { limpo[g.chave] = []; });
    setFiltros(prev => ({
      ...prev,
      ...limpo,
      busca:      '',
      buscaId:    '',
      ordenarPor: config.ordenarPor?.[0]?.v || 'nome',
      ordenarDir: 'asc',
    }));
  }

  const totalAtivos = Object.entries(filtros)
    .filter(([k]) => k !== 'busca' && k !== 'buscaId' && k !== 'ordenarPor' && k !== 'ordenarDir' && !k.startsWith('_'))
    .reduce((acc, [, v]) => acc + (Array.isArray(v) ? v.length : 0), 0);

  const ordenarAtual = config.ordenarPor?.find(o => o.v === filtros.ordenarPor);

  return (
    <div className="filtro-avancado-wrapper">

      {/* ── LINHA SUPERIOR ── */}
      <div className="filtro-topbar">

        {/* Busca por texto */}
        <div className="filtro-busca-box">
         <img src="imgbb/lupa.png" alt="buscar" className="filtro-busca-icon" style={{ width: 16, height: 16 }} />
          <input
            className="filtro-busca-input"
            type="text"
            placeholder={placeholder}
            value={filtros.busca || ''}
            onChange={e => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
          />
          {filtros.busca && (
            <button className="filtro-busca-clear" onClick={() => setFiltros(prev => ({ ...prev, busca: '' }))}>✕</button>
          )}
        </div>

        {/* Busca por ID */}
        <div className="filtro-id-box">
          <span className="filtro-id-hash">#</span>
          <input
            className="filtro-id-input"
            type="text"
            placeholder="ID"
            value={(filtros.buscaId || '').replace(/^#/, '')}
            onChange={e => setFiltros(prev => ({ ...prev, buscaId: e.target.value.replace(/^#/, '') }))}
          />
          {filtros.buscaId && (
            <button className="filtro-busca-clear" onClick={() => setFiltros(prev => ({ ...prev, buscaId: '' }))}>✕</button>
          )}
        </div>

        {/* Botão Filtros */}
        <div className="filtro-dropdown-wrap" ref={refFiltro}>
          <button
            className={`filtro-toggle-btn${filtroAberto ? ' ativo' : ''}`}
            onClick={() => { setFiltroAberto(a => !a); setOrdenarAberto(false); }}
          >
            Filtros {totalAtivos > 0 && <span className="filtro-badge">{totalAtivos}</span>}
            <span className="filtro-chevron">{filtroAberto ? '▲' : '▼'}</span>
          </button>

          {/* Painel de filtros */}
          {filtroAberto && (
            <div className="filtro-painel">
              <div className="filtro-painel-inner">

                {(config.grupos || []).map(grupo => (
                  <div key={grupo.chave} className="filtro-grupo">
                    <button
                      className={`filtro-grupo-header${subAberto === grupo.chave ? ' aberto' : ''}`}
                      onClick={() => setSubAberto(subAberto === grupo.chave ? null : grupo.chave)}
                    >
                      <span>{grupo.label}</span>
                      {(filtros[grupo.chave]?.length > 0) && (
                        <span className="filtro-grupo-count">{filtros[grupo.chave].length}</span>
                      )}
                      <span className="filtro-grupo-chevron">{subAberto === grupo.chave ? '▲' : '▼'}</span>
                    </button>

                    {subAberto === grupo.chave && (
                      <div className="filtro-opcoes">
                        {grupo.buscavel && (
                          <input
                            className="filtro-opcao-busca"
                            type="text"
                            placeholder={`Buscar ${grupo.label.toLowerCase()}...`}
                            onChange={e => {
                              const t = e.target.value.toLowerCase();
                              setFiltros(prev => ({ ...prev, [`_busca_${grupo.chave}`]: t }));
                            }}
                          />
                        )}
                        {grupo.opcoes
                          .filter(op => {
                            const t = filtros[`_busca_${grupo.chave}`] || '';
                            return !t || op.toLowerCase().includes(t);
                          })
                          .map(op => {
                            const ativo = (filtros[grupo.chave] || []).includes(op);
                            return (
                              <label key={op} className={`filtro-opcao-item${ativo ? ' selecionado' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={ativo}
                                  onChange={() => toggleValor(grupo.chave, op)}
                                />
                                {grupo.renderOpcao ? grupo.renderOpcao(op) : op}
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}

                {totalAtivos > 0 && (
                  <button className="filtro-limpar-painel-btn" onClick={limparTudo}>
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão Ordenar */}
        {(config.ordenarPor || []).length > 0 && (
          <div className="filtro-dropdown-wrap" ref={refOrdenar}>
            <button
              className={`filtro-ordenar-btn${ordenarAberto ? ' ativo' : ''}`}
              onClick={() => { setOrdenarAberto(a => !a); setFiltroAberto(false); }}
            >
              Ordenar {ordenarAtual ? `· ${ordenarAtual.l}` : ''}
              <span className="filtro-chevron">{ordenarAberto ? '▲' : '▼'}</span>
            </button>

            {ordenarAberto && (
              <div className="filtro-painel filtro-painel-ordenar">
                <div className="filtro-painel-inner">

                  <div className="filtro-ordenacao-dir">
                    <button
                      className={`filtro-dir-btn${filtros.ordenarDir === 'asc' ? ' ativo' : ''}`}
                      onClick={() => setFiltros(prev => ({ ...prev, ordenarDir: 'asc' }))}
                    >⬆ Crescente</button>
                    <button
                      className={`filtro-dir-btn${filtros.ordenarDir === 'desc' ? ' ativo' : ''}`}
                      onClick={() => setFiltros(prev => ({ ...prev, ordenarDir: 'desc' }))}
                    >⬇ Decrescente</button>
                  </div>

                  <div className="filtro-ordenar-por">
                    <span className="filtro-ordenar-label">Ordenar por:</span>
                    {config.ordenarPor.map(op => (
                      <button
                        key={op.v}
                        className={`filtro-ordenar-chip${filtros.ordenarPor === op.v ? ' ativo' : ''}`}
                        onClick={() => setFiltros(prev => ({ ...prev, ordenarPor: op.v }))}
                      >{op.l}</button>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
      {/* fim filtro-topbar */}

      {/* ── CHIPS DOS FILTROS ATIVOS ── */}
      {totalAtivos > 0 && (
        <div className="filtro-chips-ativos">
          {(config.grupos || []).flatMap(grupo =>
            (filtros[grupo.chave] || []).map(val => (
              <span key={`${grupo.chave}-${val}`} className="filtro-chip">
                {val}
                <button onClick={() => toggleValor(grupo.chave, val)}>✕</button>
              </span>
            ))
          )}
        </div>
      )}

      {/* ── CONTADOR DE RESULTADOS ── */}
      {totalResultados !== undefined && (
        <div className="filtro-resultados">
          {(totalAtivos > 0 || filtros.busca || filtros.buscaId)
            ? <>Resultados encontrados: <strong>{totalResultados}</strong>{totalGeral !== undefined && ` de ${totalGeral}`}</>
            : <>{totalResultados} {totalResultados === 1 ? 'item' : 'itens'} cadastrado{totalResultados !== 1 ? 's' : ''}</>
          }
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   aplicarFiltros — aplica busca textual, busca por ID,
   filtros de checkbox e ordenação a uma lista de items.

   campos = {
     busca:   ['titulo','palestrante'],   // campos para busca textual
     buscaId: 'id',                       // campo do ID (string ou fn)
     trilha:  'trilha',                   // string → item[campo]
     tipo:    item => item.tipo,          // função → valor extraído
     tags:    item => item.tags || [],    // retorna array → any match
     ordenar: { horario:'horario', ... }  // mapa chave → campo
   }
   ───────────────────────────────────────────────────────────── */
export function aplicarFiltros(items, filtros, campos) {
  let resultado = [...items];

  /* busca textual */
  if (filtros.busca) {
    const t = filtros.busca.toLowerCase();
    const camposBusca = Array.isArray(campos.busca) ? campos.busca : [];
    resultado = resultado.filter(item =>
      camposBusca.some(c => (item[c] || '').toLowerCase().includes(t))
    );
  }

  /* busca por ID */
  if (filtros.buscaId) {
    const t = filtros.buscaId.toLowerCase();
    const campoId = campos.buscaId || 'id';
    resultado = resultado.filter(item => {
      const val = typeof campoId === 'function' ? campoId(item) : (item[campoId] || '');
      return String(val).toLowerCase().includes(t);
    });
  }

  /* filtros de grupo (checkbox) */
  Object.entries(campos).forEach(([chave, campo]) => {
    if (['busca', 'buscaId', 'ordenar'].includes(chave)) return;
    const vals = filtros[chave] || [];
    if (!vals.length) return;
    resultado = resultado.filter(item => {
      let valor;
      if (typeof campo === 'string')   valor = item[campo];
      else if (typeof campo === 'function') valor = campo(item);
      else return true;
      /* suporte a arrays (ex: tags) */
      if (Array.isArray(valor)) return valor.some(v => vals.includes(v));
      return vals.includes(valor);
    });
  });

  /* ordenação */
  if (filtros.ordenarPor && campos.ordenar) {
    const campoOrdem = campos.ordenar[filtros.ordenarPor];
    if (campoOrdem) {
      resultado.sort((a, b) => {
        const va = (typeof campoOrdem === 'function' ? campoOrdem(a) : a[campoOrdem]) ?? '';
        const vb = (typeof campoOrdem === 'function' ? campoOrdem(b) : b[campoOrdem]) ?? '';
        return filtros.ordenarDir === 'desc'
          ? String(vb).localeCompare(String(va))
          : String(va).localeCompare(String(vb));
      });
    }
  }

  return resultado;
}