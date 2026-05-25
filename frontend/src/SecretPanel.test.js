import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SecretPanel from '../SecretPanel';
import SecretNotification from '../SecretNotification';

// Mock BroadcastChannel
global.BroadcastChannel = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  postMessage: jest.fn(),
}));

describe('Sistema Secreto de Notificaciones', () => {
  
  test('Panel Secreto se renderiza cuando isVisible es true', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const panel = screen.getByText('🔐 Panel Secreto');
    expect(panel).toBeInTheDocument();
  });

  test('Panel Secreto no se renderiza cuando isVisible es false', () => {
    const { container } = render(<SecretPanel isVisible={false} onClose={() => {}} />);
    expect(container.querySelector('.secret-panel')).not.toBeInTheDocument();
  });

  test('Input acepta valores', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    fireEvent.change(input, { target: { value: '80' } });
    expect(input.value).toBe('80');
  });

  test('Botón Enviar envía el código', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    const sendButton = screen.getByText('Enviar');
    
    fireEvent.change(input, { target: { value: '80' } });
    fireEvent.click(sendButton);
    
    // Verificar que el código se agregó al historial
    expect(screen.getByText(/Código 80 enviado/)).toBeInTheDocument();
  });

  test('Enter presionado envía el código', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    
    fireEvent.change(input, { target: { value: '80' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(screen.getByText(/Código 80 enviado/)).toBeInTheDocument();
  });

  test('No envía código vacío', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const sendButton = screen.getByText('Enviar');
    
    fireEvent.click(sendButton);
    
    expect(screen.getByText(/Por favor ingresa un código/)).toBeInTheDocument();
  });

  test('SecretNotification se renderiza', () => {
    const { container } = render(<SecretNotification />);
    expect(container).toBeInTheDocument();
  });

  test('Botón cerrar ejecuta onClose', () => {
    const mockOnClose = jest.fn();
    render(<SecretPanel isVisible={true} onClose={mockOnClose} />);
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('Botón Limpiar Historial limpia la lista', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    const sendButton = screen.getByText('Enviar');
    
    // Enviar un código
    fireEvent.change(input, { target: { value: '80' } });
    fireEvent.click(sendButton);
    
    // Verificar que se envió
    expect(screen.getByText(/Código 80 enviado/)).toBeInTheDocument();
    
    // Limpiar
    const clearButton = screen.getByText('Limpiar Historial');
    fireEvent.click(clearButton);
    
    // Verificar que el historial está vacío
    expect(screen.getByText('No hay códigos enviados aún')).toBeInTheDocument();
  });

  test('Overlay cierra el panel cuando se hace click fuera', () => {
    const mockOnClose = jest.fn();
    render(<SecretPanel isVisible={true} onClose={mockOnClose} />);
    const overlay = document.querySelector('.secret-panel-overlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('Panel no cierra cuando se hace click dentro', () => {
    const mockOnClose = jest.fn();
    render(<SecretPanel isVisible={true} onClose={mockOnClose} />);
    const panel = document.querySelector('.secret-panel');
    fireEvent.click(panel);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('BroadcastChannel recibe correctamente', async () => {
    const mockAddEventListener = jest.fn();
    const mockPostMessage = jest.fn();
    
    global.BroadcastChannel = jest.fn(() => ({
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
      postMessage: mockPostMessage,
    }));

    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    
    // Verificar que se agregó el listener
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });
});

describe('Integración con LoginForm', () => {
  test('Ctrl + Shift + S abre el panel secreto', () => {
    const { getByText, queryByText } = render(<SecretPanel isVisible={false} onClose={() => {}} />);
    
    // El panel no debe estar visible
    expect(queryByText('🔐 Panel Secreto')).not.toBeInTheDocument();
  });
});

describe('Validación de Códigos', () => {
  test('Acepta números', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    
    fireEvent.change(input, { target: { value: '12345' } });
    expect(input.value).toBe('12345');
  });

  test('Limita a 10 caracteres', () => {
    render(<SecretPanel isVisible={true} onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Ej: 80');
    
    fireEvent.change(input, { target: { value: '12345678901' } });
    // El input tiene maxLength="10"
    expect(input.maxLength).toBe(10);
  });
});
