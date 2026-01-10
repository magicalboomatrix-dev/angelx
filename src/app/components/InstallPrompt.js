'use client';
import React from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallButton, setShowInstallButton] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  if (!showInstallButton) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>Install AngelX App</span>
      <button
        onClick={handleInstallClick}
        style={{
          background: 'white',
          color: '#667eea',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Install
      </button>
      <button
        onClick={() => setShowInstallButton(false)}
        style={{
          background: 'transparent',
          color: 'white',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0 8px'
        }}
      >
        ×
      </button>
    </div>
  );
}
