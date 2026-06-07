import { useState } from "react";
import { login, registrar } from "../services/api.js";
import { toast } from "../components/Toast.jsx";

export default function Login({ onEntrar, backendOnline }) {
  const [modo, setModo]         = useState('login'); // 'login' | 'registro'
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [nome, setNome]         = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro]         = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      const res = await login(email.trim(), senha);
      onEntrar(res.data.usuario);
    } catch (err) {
      if (err.status === 0) {
        toast.info('Modo Offline: Entrando com usuário local.');
        onEntrar({ id_usuario: 999, nome: 'Usuário Local', email, role: email.includes('admin') ? 'curator' : 'user' });
      } else {
        setErro(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistrar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await registrar(nome.trim(), email.trim(), senha, 'curator');
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setModo('login');
      setNome(''); setSenha(''); setConfirmar('');
    } catch (err) {
      if (err.status === 0) {
        toast.info('Modo Offline: Registro simulado. Faça login.');
        setModo('login');
      } else {
        setErro(err.message || 'Falha ao registrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !loading) {
      modo === 'login' ? handleEntrar() : handleRegistrar();
    }
  }

  const input = (type, placeholder, value, onChange, id) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKey}
      disabled={loading}
      style={{
        height: 46, border: `1.5px solid ${erro && !value.trim() ? '#FCA5A5' : '#C6CAE2'}`,
        borderRadius: 12, padding: '0 14px', fontSize: 15,
        fontFamily: 'inherit', outline: 'none', width: '100%',
        opacity: loading ? 0.6 : 1, transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}
    />
  );

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url(imgbb/9.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        width: 'min(440px, 94vw)',
        background: 'white',
        borderRadius: 28,
        padding: 'clamp(28px,5vw,48px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>

        {/* Logo */}
        <img
          src="imgbb/8.png"
          alt="BB Digital Week"
          style={{ width: 'clamp(110px,28vw,170px)', objectFit: 'contain', marginBottom: 4 }}
        />

        {/* Banner offline */}
        {backendOnline === false && (
          <div style={{
            width: '100%', background: '#FEF2F2', border: '1.5px solid #FCA5A5',
            borderRadius: 10, padding: '10px 14px', fontSize: 12.5,
            color: '#991B1B', fontWeight: 600, textAlign: 'center',
          }}>
            ⚠ Backend indisponível. O login não vai funcionar sem o servidor.
          </div>
        )}

        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#141D5A', textAlign: 'center' }}>
          {modo === 'login' ? 'Acesse sua conta' : 'Criar conta'}
        </h2>

        {/* Campos de registro */}
        {modo === 'registro' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Nome completo</label>
            {input('text', 'Seu nome', nome, setNome, 'reg-nome')}
          </div>
        )}

        {/* E-mail */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>E-mail</label>
          {input('email', 'seu@email.com', email, setEmail, 'auth-email')}
        </div>

        {/* Senha */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Senha</label>
          {input('password', '••••••••', senha, setSenha, 'auth-senha')}
        </div>

        {/* Confirmar senha (só no registro) */}
        {modo === 'registro' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Confirmar senha</label>
            {input('password', '••••••••', confirmar, setConfirmar, 'reg-confirmar')}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <p style={{ margin: 0, color: '#D92D20', fontSize: 13, fontWeight: 600, textAlign: 'center', width: '100%' }}>
            {erro}
          </p>
        )}

        {/* Botão principal */}
        <button
          id="auth-submit"
          onClick={modo === 'login' ? handleEntrar : handleRegistrar}
          disabled={loading}
          style={{
            width: '100%', height: 50,
            background: loading ? '#9CA3AF' : '#465EFF',
            color: 'white', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginTop: 2,
            transition: 'background 0.2s',
          }}
          onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#3147DA'; }}
          onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#465EFF'; }}
        >
          {loading ? (modo === 'login' ? 'Entrando...' : 'Cadastrando...') : (modo === 'login' ? 'Entrar' : 'Criar conta')}
        </button>

        {/* Alternar modo */}
        <p style={{ margin: 0, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
          {modo === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          {' '}
          <button
            onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setErro(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#465EFF', fontWeight: 700, fontSize: 13,
              fontFamily: 'inherit', padding: 0,
            }}
          >
            {modo === 'login' ? 'Criar conta' : 'Fazer login'}
          </button>
        </p>

        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          BB Digital Week — Sistema de Curadoria
        </p>
      </div>
    </div>
  );
}
