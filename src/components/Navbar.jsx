import { useState } from "react";

// Props:
//   titulo  – nome da página atual (vem do App.jsx)
//   usuario – objeto do usuário logado (opcional, para uso futuro do back)
export default function Navbar({ titulo = "BB Digital Week", usuario, onSair }) {
  const [perfilAberto, setPerfilAberto] = useState(false);

  return (
    <div className="navbar">
      <img className="bblogo" src="imgbb/7.png" alt="BB Digital Week" />
      <div className="letreiro">
        <div className="barra"></div>
        {/* Exibe o nome da página atual no lugar do texto fixo */}
        <span className="texto">{titulo}</span>
      </div>

      {/* PERFIL */}
      <div className="navbar-right" style={{ position: 'relative' }}>
        <button
          id="btnPerfil"
          className="profile-btn"
          onClick={e => { e.stopPropagation(); setPerfilAberto(p => !p); }}
        >
          <div className="profile-avatar">{(usuario?.nome || 'U').charAt(0).toUpperCase()}</div>
          <span>{usuario?.nome || 'Usuário'}</span>
          <span style={{ fontSize: 12 }}>▼</span>
        </button>

        {perfilAberto && (
          <div className="profile-dropdown show" onClick={e => e.stopPropagation()}>
            <div className="profile-drop-header">
              <strong>{usuario?.nome || 'Usuário'}</strong>
              <span>{usuario?.email || 'email@exemplo.com'}</span>
              <div className="profile-role-badge">{usuario?.role || 'user'}</div>
            </div>
            <div className="profile-drop-body">
              <div className="profile-drop-sep"></div>
              <button 
                className="profile-drop-item danger" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPerfilAberto(false);
                  onSair();
                }}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {perfilAberto && (
        <div style={{ position:'fixed', inset:0, zIndex:1000 }} onClick={() => setPerfilAberto(false)} />
      )}
    </div>
  );
}
