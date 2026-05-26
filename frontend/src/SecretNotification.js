import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './SecretNotification.css';

const SOCKET_URL = 'https://form-google-production.up.railway.app';

const SecretNotification = () => {
  const [notification, setNotification] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Conectar a WebSocket
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ SecretNotification conectado al servidor');
    });

    socket.on('receive_secret_code', (data) => {
      console.log('📢 Código secreto recibido:', data);
      const newNotification = {
        code: data.code,
        timestamp: new Date(data.timestamp),
        id: Math.random(),
      };
      setNotification(newNotification);
      setHistory([newNotification, ...history.slice(0, 9)]);

      // Auto-hide después de 5 segundos
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    });

    socket.on('disconnect', () => {
      console.log('❌ SecretNotification desconectado');
    });

    return () => {
      socket.disconnect();
    };
  }, [history]);

  return (
    <>
      {/* Notificación flotante */}
      {notification && (
        <div className="secret-notification">
          <div className="notification-content">
            <span className="notification-icon">📢</span>
            <div className="notification-text">
              <p className="notification-title">¡Notificación!</p>
              <p className="notification-code">Código: <strong>{notification.code}</strong></p>
            </div>
          </div>
          <div className="notification-timer"></div>
        </div>
      )}

      {/* Historial comprimido (esquina inferior derecha) */}
      {/* {history.length > 0 && (
        <div className="notification-history">
          <div className="history-header">📋 Historial</div>
          <div className="history-items">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="history-item">
                <span className="history-code">{item.code}</span>
                <span className="history-time">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </>
  );
};

export default SecretNotification;