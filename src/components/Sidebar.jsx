export default function Sidebar({ paginaAtual, navegar }) {
  const navItem = (id, icone, label) => (
    <div
      className={`nav-item${paginaAtual === id ? ' active' : ''}`}
      onClick={() => navegar(id)}
    >
      <span className="nav-icon">{icone}</span>
      {label}
    </div>
  );

  return (
    <div className="leftbar">
      <nav className="sidebar">
        <div className="sidebar-section-label">Principal</div>
        {navItem('dashboard',  '◈', 'Dashboard')}
        {navItem('grade',      '▦', 'Cronograma')}
        {navItem('propostas',  '◧', 'Alertas de IA')}

        <div className="sidebar-section-label">Conteúdo</div>
        {navItem('sessoes',      '◎', 'Sessões')}
        {navItem('trilhas',      '◉', 'Trilhas')}
        {navItem('atividades',   '◎', 'Atividades')}
        {navItem('palestrantes', '⬡', 'Palestrantes')}

        <div className="sidebar-section-label">Organização</div>
        {navItem('espacos',  '⬡', 'Espaço e Locais')}
        {navItem('horario',  '✦', 'Horários')}
      </nav>
    </div>
  );
}
