import React, { useState } from 'react';
import { Button } from '../../UI/Button';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: { token: string, user: any }) => void;
}

export const AuthModal = ({ onClose, onLogin }: AuthModalProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = async () => {
    const endpoint = isRegister ? 'register' : 'login';
    const body = isRegister ? { nickname, age, pin } : { nickname, pin };

    const res = await fetch(`http://localhost:8888/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      onLogin(data);
      onClose();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-8 rounded-lg border border-yellow-500 w-80">
        <h2 className="text-xl text-yellow-500 mb-4">{isRegister ? 'Registro' : 'Ingresar'}</h2>
        <input className="w-full p-2 mb-2 bg-gray-800 text-white" placeholder="Nickname" onChange={(e) => setNickname(e.target.value)} />
        {isRegister && <input className="w-full p-2 mb-2 bg-gray-800 text-white" type="number" placeholder="Edad" onChange={(e) => setAge(e.target.value)} />}
        <input className="w-full p-2 mb-4 bg-gray-800 text-white" type="password" placeholder="PIN (4 dígitos)" maxLength={4} onChange={(e) => setPin(e.target.value)} />
        <Button className="w-full mb-2" onClick={handleSubmit}>{isRegister ? 'Registrar' : 'Entrar'}</Button>
        <button className="text-sm text-gray-400 underline" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
};
