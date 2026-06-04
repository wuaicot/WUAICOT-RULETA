import React, { useState } from 'react';
import { Button } from '../../UI/Button';
import { apiFetch } from '../../utils/api';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: { token: string, user: any }) => void;
}

export const AuthModal = ({ onClose, onLogin }: AuthModalProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (nickname.trim().length < 3) return "El nickname debe tener al menos 3 caracteres.";
    if (isRegister) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18) return "Debes ser mayor de 18 años.";
      if (pin !== confirmPin) return "Los PIN no coinciden.";
    }
    if (!/^\d{4}$/.test(pin)) return "El PIN debe ser de 4 dígitos numéricos.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    const endpoint = `/api/auth/${isRegister ? 'register' : 'login'}`;
    const body = isRegister ? { nickname, age, pin } : { nickname, pin };

    try {
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      onLogin(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-8 rounded-lg border border-yellow-500 w-80">
        <h2 className="text-xl text-yellow-500 mb-4">{isRegister ? 'Registro' : 'Ingresar'}</h2>
        
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        
        <input 
          className="w-full p-2 mb-2 bg-gray-800 text-white rounded" 
          placeholder="Nickname" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)} 
        />
        {isRegister && (
          <input 
            className="w-full p-2 mb-2 bg-gray-800 text-white rounded" 
            type="number" 
            placeholder="Edad" 
            value={age}
            onChange={(e) => setAge(e.target.value)} 
          />
        )}
        <input 
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded" 
          type="password" 
          placeholder="PIN (4 dígitos)" 
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)} 
        />
        
        {isRegister && (
          <input 
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded" 
            type="password" 
            placeholder="Confirmar PIN" 
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)} 
          />
        )}
        
        <Button className="w-full mb-2" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Procesando...' : (isRegister ? 'Registrar' : 'Entrar')}
        </Button>
        
        <button className="text-sm text-gray-400 underline w-full text-center" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
};
