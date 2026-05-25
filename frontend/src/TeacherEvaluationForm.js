import React, { useState } from 'react';
import './TeacherEvaluationForm.css';

const TeacherEvaluationForm = ({ onSubmit, onSkip }) => {
  const [answers, setAnswers] = useState({
    rating: 5,
    resources: '',
    pedagogy: '',
    content: '',
    improvements: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setAnswers({
      ...answers,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!answers.resources.trim()) {
      newErrors.resources = 'Este campo es obligatorio';
    }
    if (!answers.pedagogy.trim()) {
      newErrors.pedagogy = 'Este campo es obligatorio';
    }
    if (!answers.content.trim()) {
      newErrors.content = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      onSubmit(answers);
    }
  };

  return (
    <div className="evaluation-overlay">
      <div className="evaluation-card">
        <div className="evaluation-header">
          <h2>Evaluación del Profesor</h2>
          <p>Tu opinión nos ayuda a mejorar la calidad educativa</p>
        </div>

        <form onSubmit={handleSubmit} className="evaluation-form">
          {/* Pregunta 1: Calificación (Cerrada) */}
          <div className="form-section">
            <label className="form-label">
              1. ¿Cómo calificarías la enseñanza del profesor? (1-10)
            </label>
            <div className="rating-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answers.rating}
                onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                className="rating-slider"
              />
              <span className="rating-value">{answers.rating}</span>
            </div>
          </div>

          {/* Pregunta 2: Recursos (Abierta) */}
          <div className="form-section">
            <label className="form-label">
              2. ¿Qué opinión tienes sobre los recursos y materiales utilizados? *
            </label>
            <textarea
              className={`form-textarea ${errors.resources ? 'textarea-error' : ''}`}
              placeholder="Comparte tu criterio sobre la calidad y utilidad de los recursos..."
              value={answers.resources}
              onChange={(e) => handleInputChange('resources', e.target.value)}
              rows="3"
            />
            {errors.resources && (
              <span className="error-message">{errors.resources}</span>
            )}
          </div>

          {/* Pregunta 3: Pedagogía (Abierta) */}
          <div className="form-section">
            <label className="form-label">
              3. ¿Cómo describes la metodología pedagógica del profesor? *
            </label>
            <textarea
              className={`form-textarea ${errors.pedagogy ? 'textarea-error' : ''}`}
              placeholder="Describe cómo el profesor explica, interactúa y enseña..."
              value={answers.pedagogy}
              onChange={(e) => handleInputChange('pedagogy', e.target.value)}
              rows="3"
            />
            {errors.pedagogy && (
              <span className="error-message">{errors.pedagogy}</span>
            )}
          </div>

          {/* Pregunta 4: Contenido (Abierta) */}
          <div className="form-section">
            <label className="form-label">
              4. ¿Cómo fue la claridad con que se impartieron los contenidos? *
            </label>
            <textarea
              className={`form-textarea ${errors.content ? 'textarea-error' : ''}`}
              placeholder="Comenta sobre la claridad, profundidad y relevancia del contenido..."
              value={answers.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows="3"
            />
            {errors.content && (
              <span className="error-message">{errors.content}</span>
            )}
          </div>

          {/* Pregunta 5: Mejoras (Cerrada/Sugerencia) */}
          <div className="form-section">
            <label className="form-label">
              5. ¿Qué aspectos crees que podría mejorar?
            </label>
            <textarea
              className="form-textarea"
              placeholder="Sugerencias de mejora (opcional)..."
              value={answers.improvements}
              onChange={(e) => handleInputChange('improvements', e.target.value)}
              rows="2"
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onSkip}
              disabled={isLoading}
            >
              Omitir por ahora
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Enviar Evaluación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherEvaluationForm;
