import React, { useState, useEffect } from 'react';
import './SecretNotification.css';

const SecretNotification = () => {
  const [notification, setNotification] = useState(null);
  const [broadcastChannel] = useState(() => new BroadcastChannel('quiz_notifications'));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'secret_code') {
        const newNotification = {
          code: event.data.code,
          timestamp: new Date(event.data.timestamp),
          id: Math.random(),
        };
        setNotification(newNotification);
        setHistory([newNotification, ...history.slice(0, 9)]);

        // Auto-hide después de 5 segundos
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => broadcastChannel.removeEventListener('message', handleMessage);
  }, [broadcastChannel, history]);

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
