export default function Popup({ aberto, onFechar, titulo, children }) {
  if (!aberto) return null;
  return (
    <>
      <div className="overlay" style={{ display: 'block' }} onClick={onFechar} />
      <div className="popup-form" style={{ display: 'flex' }}>
        <div className="popup-lateral"></div>
        <div className="popup-conteudo">
          <div className="popup-topo">
            <h2>{titulo}</h2>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export function PopupCard({
  aberto,
  onFechar,
  onEditar,
  onDeletar,
  onAprovar,
  statusItem,
  trilhaCor,
  children,
}) {
  if (!aberto) return null;
  return (
    <div className="popup-card-overlay" style={{ display: 'flex' }}>
      <div className="popup-card-container">
        <button className="fechar-popup" onClick={onFechar}>✕</button>
        {/* Barra lateral colorida conforme trilha do item */}
        {trilhaCor && (
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: 28, height: '100%',
            background: trilhaCor,
            borderRadius: '0 24px 24px 0',
          }} />
        )}
        <div className="popup-card-body">
          {children}
          <div className="evento-popup-footer">
            {/* Lixeira */}
            {onDeletar && (
              <button className="evento-btn-deletar" onClick={onDeletar}>
                🗑 Excluir
              </button>
            )}
            {/* Aprovar — só para itens em andamento */}
            {onAprovar && statusItem === 'andamento' && (
              <button className="evento-btn-aprovar" onClick={onAprovar}>
                ✓ Aprovar
              </button>
            )}
            {/* Editar */}
            {onEditar && (
              <button className="evento-btn-editar" onClick={onEditar}>
                ✎ Editar
              </button>
            )}
            {/* SEM botão Fechar — o ✕ no canto já fecha */}
          </div>
        </div>
      </div>
    </div>
  );
}
