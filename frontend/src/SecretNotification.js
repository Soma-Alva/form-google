import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './SecretNotification.css';

const SOCKET_URL = window.location.origin;

const SecretNotification = () => {
  const [notification, setNotification] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ SecretNotification conectado al servidor');
    });

    newSocket.on('receive_secret_code', (data) => {
      console.log('📢 Código secreto recibido:', data);

      const newNotification = {
        code: data.code,
        timestamp: new Date(data.timestamp),
        id: Math.random(),
      };

      setNotification(newNotification);

      // 🔥 CORRECCIÓN IMPORTANTE AQUÍ
      setHistory(prev => [newNotification, ...prev.slice(0, 9)]);

      setTimeout(() => setNotification(null), 5000);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ SecretNotification desconectado');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);
};

export default SecretNotification;
