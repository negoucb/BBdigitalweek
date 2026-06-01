export default function ConfirmDelete({ mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="confirm-delete-overlay" style={{ display: 'flex' }}>
      <div className="confirm-delete-box">
        <h3>⚠ Confirmar exclusão</h3>
        <p>{mensagem || 'Deseja excluir este item permanentemente?'}</p>
        <div className="confirm-delete-btns">
          <button className="confirm-btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="confirm-btn-delete" onClick={onConfirmar}>Excluir</button>
        </div>
      </div>
    </div>
  );
}