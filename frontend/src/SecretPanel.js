import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './SecretPanel.css';

const SOCKET_URL = 'https://form-google-production.up.railway.app';

const SecretPanel = ({ isVisible, onClose }) => {
  const [code, setCode] = useState('');
  const [socket, setSocket] = useState(null);
  const [sentCodes, setSentCodes] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Conectar a WebSocket
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendCode = () => {
    if (code.trim() === '') {
      setNotification('Por favor ingresa un código');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    if (socket && socket.connected) {
      socket.emit('send_secret_code', { code });
      setSentCodes([...sentCodes, { code, time: new Date().toLocaleTimeString() }]);
      setCode('');
      setNotification(`✓ Código ${code} enviado a todos los clientes`);
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification('⚠️ No conectado al servidor');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleClear = () => {
    setSentCodes([]);
    setCode('');
  };

  if (!isVisible) return null;

  return (
    <div className="secret-panel-overlay" onClick={onClose}>
      <div className="secret-panel" onClick={(e) => e.stopPropagation()}>
        <div className="secret-panel-header">
          <h2>🔐 Panel Secreto</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="secret-panel-content">
          <div className="input-section">
            <label>Enviar código de notificación:</label>
            <div className="input-group">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                placeholder="Ej: 80"
                className="secret-input"
                maxLength="10"
              />
              <button onClick={handleSendCode} className="btn-send">
                Enviar
              </button>
            </div>
          </div>

          {notification && (
            <div className="notification-message">
              {notification}
            </div>
          )}

          <div className="history-section">
            <h3>Historial de códigos enviados:</h3>
            {sentCodes.length === 0 ? (
              <p className="empty-history">No hay códigos enviados aún</p>
            ) : (
              <ul className="codes-list">
                {sentCodes.map((item, idx) => (
                  <li key={idx} className="code-item">
                    <span className="code-badge">{item.code}</span>
                    <span className="code-time">{item.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-actions">
            <button onClick={handleClear} className="btn-clear">
              Limpiar Historial
            </button>
            <button onClick={onClose} className="btn-close">
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretPanel;
