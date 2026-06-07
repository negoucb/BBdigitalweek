/**
 * Toast global — notificações de sucesso, erro e aviso.
 *
 * Uso:
 *   import { toast } from './Toast.jsx';
 *   toast.error('Falha ao salvar.');
 *   toast.success('Trilha criada!');
 *   toast.warn('Backend offline.');
 *
 * Montar uma única vez em App.jsx:
 *   import Toast from './components/Toast.jsx';
 *   <Toast />
 */

import { useEffect, useRef, useState } from 'react';

let _add = null;

export const toast = {
  error:   (msg) => _add?.({ tipo: 'error',   msg }),
  success: (msg) => _add?.({ tipo: 'success', msg }),
  warn:    (msg) => _add?.({ tipo: 'warn',    msg }),
  info:    (msg) => _add?.({ tipo: 'info',    msg }),
};

const COR = {
  error:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '✕' },
  success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '✓' },
  warn:    { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', icon: '⚠' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', icon: 'ℹ' },
};

let _id = 0;

export default function Toast() {
  const [itens, setItens] = useState([]);
  const timeouts = useRef({});

  useEffect(() => {
    _add = (item) => {
      const id = ++_id;
      setItens(prev => [...prev, { ...item, id }]);
      timeouts.current[id] = setTimeout(() => remover(id), 4500);
    };
    return () => { _add = null; };
  }, []);

  function remover(id) {
    clearTimeout(timeouts.current[id]);
    delete timeouts.current[id];
    setItens(prev => prev.filter(i => i.id !== id));
  }

  if (!itens.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 380, width: 'min(380px, calc(100vw - 40px)',
    }}>
      {itens.map(item => {
        const c = COR[item.tipo] || COR.info;
        return (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: c.bg,
            border: `1.5px solid ${c.border}`,
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            fontFamily: "'Poppins', sans-serif",
            animation: 'toastIn 0.25s ease',
          }}>
            <span style={{
              fontSize: 16, fontWeight: 700,
              color: c.text, flexShrink: 0, lineHeight: 1.4,
            }}>{c.icon}</span>
            <p style={{
              margin: 0, fontSize: 13.5, lineHeight: 1.5,
              color: '#1F2937', flex: 1,
            }}>{item.msg}</p>
            <button onClick={() => remover(item.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', fontSize: 16, lineHeight: 1,
              padding: 0, flexShrink: 0,
            }}>✕</button>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
