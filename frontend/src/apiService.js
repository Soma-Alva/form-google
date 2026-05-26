// Detectar si estamos en desarrollo o producción
const API_BASE_URL = 'https://form-google-production.up.railway.app/api';

const apiService = {
  async submitLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar los datos');
      }

      return data;
    } catch (error) {
      console.error('Error en submitLogin:', error);
      throw error;
    }
  },

  async submitEvaluation(submissionId, evaluation) {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          rating: evaluation.rating,
          resources: evaluation.resources,
          pedagogy: evaluation.pedagogy,
          content: evaluation.content,
          improvements: evaluation.improvements
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la evaluación');
      }

      return data;
    } catch (error) {
      console.error('Error en submitEvaluation:', error);
      throw error;
    }
  },

  async getAllSubmissions() {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los datos');
      }

      return data;
    } catch (error) {
      console.error('Error en getAllSubmissions:', error);
      throw error;
    }
  }
};

export default apiService;
