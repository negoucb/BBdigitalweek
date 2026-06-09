import { useState, useEffect, useCallback } from "react";
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
import Toast, { toast } from './components/Toast.jsx';
import {
  verificarSessao,
  getTrilhas,
  getPropostas,
  getSessoes,
  getPalestrantes,
  getEspacos,
  getHorarios,
  getAlertasGlobais,
  logout,
} from './services/api.js';
import './styles/global.css';

// ─────────────────────────────────────────────────────────────

const PAGINAS_LABEL = {
  dashboard:    "Dashboard",
  grade:        "Cronograma",
  propostas:    "Alertas de IA",
  sessoes:      "Propostas",
  trilhas:      "Trilhas",
  atividades:   "Atividades",
  palestrantes: "Palestrantes",
  espacos:      "Espaço e Locais",
  horario:      "Horários",
};

// Estado inicial vazio — dados vêm da API
const DADOS_VAZIOS = {
  trilhas:      [],
  propostas:    [],
  sessoes:      [],
  palestrantes: [],
  espacos:      [],
  horarios:     [],
  alertas:      [],
};

export default function App() {
  const [logado, setLogado]       = useState(false);
  const [usuario, setUsuario]     = useState(null);
  const [pagina, setPagina]       = useState('dashboard');
  const [dados, setDados]         = useState(DADOS_VAZIOS);
  const [loadingApp, setLoadingApp] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);

  // Atualiza o <title> da aba do navegador a cada troca de página
  useEffect(() => {
    const label = PAGINAS_LABEL[pagina] || "BB Digital Week";
    document.title = `${label} — BB Digital Week`;
  }, [pagina]);

  // ── Verificar sessão salva ao iniciar ──────────────────────────────────────
  useEffect(() => {
    verificarSessao()
      .then(res => {
        if (res?.data?.autenticado && res?.data?.usuario) {
          setUsuario(res.data.usuario);
          setLogado(true);
        }
      })
      .catch(() => {
        // Backend offline — permanece na tela de login
      })
      .finally(() => setLoadingApp(false));
  }, []);

  // ── Carregar todos os dados da API ─────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    try {
      const [trilhas, propostas, sessoes, palestrantes, espacos, horarios, alertas] =
        await Promise.allSettled([
          getTrilhas(),
          getPropostas(),
          getSessoes(),
          getPalestrantes(),
          getEspacos(),
          getHorarios(),
          getAlertasGlobais(),
        ]);

      // Verifica se alguma requisição falhou por conexão
      const resultados = [trilhas, propostas, sessoes, palestrantes, espacos, horarios, alertas];
      const semConexao = resultados.every(r => r.status === 'rejected');
      if (semConexao) {
        setBackendOnline(false);
        toast.warn('Backend indisponível. Dados podem estar desatualizados.');
      } else {
        setBackendOnline(true);
        // Avisa se alguma entidade falhou parcialmente
        const algumErro = resultados.some(r => r.status === 'rejected');
        if (algumErro) toast.warn('Alguns dados não puderam ser carregados.');
      }

      setDados({
        trilhas:      trilhas.status      === 'fulfilled' ? trilhas.value      : [],
        propostas:    propostas.status    === 'fulfilled' ? propostas.value    : [],
        sessoes:      sessoes.status      === 'fulfilled' ? sessoes.value      : [],
        palestrantes: palestrantes.status === 'fulfilled' ? palestrantes.value : [],
        espacos:      espacos.status      === 'fulfilled' ? espacos.value      : [],
        horarios:     horarios.status     === 'fulfilled' ? horarios.value     : [],
        alertas:      alertas.status      === 'fulfilled' ? alertas.value      : [],
      });
    } catch (err) {
      setBackendOnline(false);
      toast.error('Falha ao conectar com o servidor.');
      console.error('[App] Falha ao carregar dados:', err.message);
    }
  }, []);

  // Carrega os dados quando o usuário faz login
  useEffect(() => {
    if (logado) carregarDados();
  }, [logado, carregarDados]);

  // ── Funções de refresh por entidade (com tratamento de erro) ─────────────
  function mkRefresh(fn, chave, label) {
    return async () => {
      try {
        const d = await fn();
        setDados(prev => ({ ...prev, [chave]: d }));
        setBackendOnline(true);
      } catch (err) {
        const offline = !err.status || err.status === 0;
        if (offline) {
          setBackendOnline(false);
          toast.error(`Sem conexão com o servidor. Não foi possível atualizar ${label}.`);
        } else {
          toast.error(err.message || `Erro ao atualizar ${label}.`);
        }
      }
    };
  }

  const refreshTrilhas      = useCallback(mkRefresh(getTrilhas,      'trilhas',      'trilhas'),      []);
  const refreshPropostas    = useCallback(mkRefresh(getPropostas,    'propostas',    'propostas'),    []);
  const refreshSessoes      = useCallback(mkRefresh(getSessoes,      'sessoes',      'sessões'),      []);
  const refreshPalestrantes = useCallback(mkRefresh(getPalestrantes, 'palestrantes', 'palestrantes'), []);
  const refreshEspacos      = useCallback(mkRefresh(getEspacos,      'espacos',      'espaços'),      []);
  const refreshHorarios     = useCallback(mkRefresh(getHorarios,     'horarios',     'horários'),     []);
  const refreshAlertas      = useCallback(mkRefresh(getAlertasGlobais,'alertas',     'alertas'),      []);

  // ── Login / Logout ────────────────────────────────────────────────────────
  function handleEntrar(u) {
    setUsuario(u);
    setLogado(true);
  }

  async function handleSair() {
    try {
      if (backendOnline) await logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUsuario(null);
      setLogado(false);
      setDados(DADOS_VAZIOS);
    }
  }

  // ── Tela de carregamento inicial ──────────────────────────────────────────
  if (loadingApp) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F3F4F6', fontFamily: "'Poppins', sans-serif",
      }}>
        <p style={{ color: '#6B7280', fontSize: 16 }}>Carregando...</p>
      </div>
    );
  }

  if (!logado) {
    return (
      <>
        <Toast />
        <Login onEntrar={handleEntrar} backendOnline={backendOnline} />
      </>
    );
  }

  const paginas = {
    dashboard:    <Dashboard    dados={dados} />,
    grade:        <Grade        dados={dados} onRefresh={refreshSessoes} />,
    propostas:    <Propostas    dados={dados} onRefresh={refreshAlertas} />,
    sessoes:      <Sessoes      dados={dados} onRefresh={refreshPropostas} />,
    trilhas:      <Trilhas      dados={dados} onRefresh={refreshTrilhas} />,
    atividades:   <Atividades   dados={dados} onRefresh={refreshPropostas} />,
    palestrantes: <Palestrantes dados={dados} onRefresh={refreshPalestrantes} />,
    espacos:      <Espacos      dados={dados} onRefresh={refreshEspacos} />,
    horario:      <Horarios     dados={dados} onRefresh={refreshHorarios} />,
  };

  return (
    <>
      <Toast />
      {/* Banner de backend offline */}
      {!backendOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#FEF2F2', borderBottom: '2px solid #FCA5A5',
          padding: '8px 20px', textAlign: 'center',
          fontSize: 13, color: '#991B1B', fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
        }}>
          ⚠ Backend indisponível — os dados exibidos podem estar desatualizados. Verifique se o servidor está rodando.
        </div>
      )}
      {/* titulo recebe o nome legível da página atual */}
      <Navbar titulo={PAGINAS_LABEL[pagina] || "BB Digital Week"} usuario={usuario} onSair={handleSair} />
      <div className="centro" style={!backendOnline ? { paddingTop: 36 } : undefined}>
        <Sidebar paginaAtual={pagina} navegar={setPagina} usuario={usuario} />
        {paginas[pagina]}
      </div>
    </>
  );
}