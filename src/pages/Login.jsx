import { useState } from "react";

export default function Login({ onEntrar }) {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [erro, setErro]     = useState('');

  function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    onEntrar({ email, nome: email.split('@')[0] });
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleEntrar();
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url(imgbb/9.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <div style={{
        width: 'min(420px, 92vw)',
        background: 'white',
        borderRadius: 28,
        padding: 'clamp(28px,5vw,48px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>

        {/* Logo */}
        <img
          src="imgbb/8.png"
          alt="BB Digital Week"
          style={{ width: 'clamp(120px,30vw,180px)', objectFit: 'contain', marginBottom: 8 }}
        />

        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#141D5A', textAlign: 'center' }}>
          Acesse sua conta
        </h2>

        {/* Campo e-mail */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            style={{
              height: 46, border: '1.5px solid #C6CAE2', borderRadius: 12,
              padding: '0 14px', fontSize: 15, fontFamily: 'inherit',
              outline: 'none', width: '100%',
            }}
          />
        </div>

        {/* Campo senha */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={handleKey}
            style={{
              height: 46, border: '1.5px solid #C6CAE2', borderRadius: 12,
              padding: '0 14px', fontSize: 15, fontFamily: 'inherit',
              outline: 'none', width: '100%',
            }}
          />
        </div>

        {erro && (
          <p style={{ margin: 0, color: '#D92D20', fontSize: 13, fontWeight: 600 }}>{erro}</p>
        )}

        {/* Botão entrar */}
        <button
          onClick={handleEntrar}
          style={{
            width: '100%', height: 50,
            background: '#465EFF', color: 'white',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            marginTop: 4,
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#3147DA'}
          onMouseOut={e => e.currentTarget.style.background = '#465EFF'}
        >
          Entrar
        </button>

        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
          BB Digital Week — Sistema de Curadoria
        </p>
      </div>
    </div>
  );
}
