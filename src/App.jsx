import { useState, useEffect } from "react";
import Navbar       from './components/Navbar.jsx';
import Sidebar      from './components/Sidebar.jsx';
import Login        from './pages/Login.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import Grade        from './pages/Grade.jsx';
import Propostas    from './pages/Propostas.jsx';
import Sessoes      from './pages/Sessoes.jsx';
import Trilhas      from './pages/Trilhas.jsx';
import Atividades   from './pages/Atividades.jsx';
import Palestrantes from './pages/Palestrantes.jsx';
import Espacos      from './pages/Espacos.jsx';
import Horarios     from './pages/Horarios.jsx';
import { dadosIniciais } from './data/inicial.js';
import './styles/global.css';

// ─────────────────────────────────────────────────────────────


const PAGINAS_LABEL = {
  dashboard:    "Dashboard",
  grade:        "Cronograma",
  propostas:    "Alertas de IA",
  sessoes:      "Sessões",
  trilhas:      "Trilhas",
  atividades:   "Atividades",
  palestrantes: "Palestrantes",
  espacos:      "Espaço e Locais",
  horario:      "Horários",
};

export default function App() {
  const [logado, setLogado]   = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina]   = useState('dashboard');
  const [dados, setDados]     = useState(dadosIniciais);

  // Atualiza o <title> da aba do navegador a cada troca de página
  useEffect(() => {
    const label = PAGINAS_LABEL[pagina] || "BB Digital Week";
    document.title = `${label} — BB Digital Week`;
  }, [pagina]);

  if (!logado) {
    return (
      <Login onEntrar={(u) => { setUsuario(u); setLogado(true); }} />
    );
  }

  const paginas = {
    dashboard:    <Dashboard    dados={dados} />,
    grade:        <Grade        dados={dados} />,
    propostas:    <Propostas    dados={dados} setDados={setDados} />,
    sessoes:      <Sessoes      dados={dados} setDados={setDados} />,
    trilhas:      <Trilhas      dados={dados} setDados={setDados} />,
    atividades:   <Atividades   dados={dados} setDados={setDados} />,
    palestrantes: <Palestrantes dados={dados} setDados={setDados} />,
    espacos:      <Espacos      dados={dados} setDados={setDados} />,
    horario:      <Horarios     dados={dados} setDados={setDados} />,
  };

  return (
    <>
      {/* titulo recebe o nome legível da página atual */}
      <Navbar titulo={PAGINAS_LABEL[pagina] || "BB Digital Week"} usuario={usuario} />
      <div className="centro">
        <Sidebar paginaAtual={pagina} navegar={setPagina} dados={dados} />
        {paginas[pagina]}
      </div>
    </>
  );
}