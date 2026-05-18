import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { gameStore } from '../../store/gameStore';

export const WalletDashboard = observer(() => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit'>('balance');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleDeposit = async () => {
    if (!amount || !file) return alert('Completa todos los campos');
    
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('proof', file);

    try {
      // Apuntamos explícitamente al puerto del backend
      const response = await fetch('http://localhost:8888/api/wallet/deposit', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) alert('Solicitud enviada con éxito');
      else {
        const err = await response.json();
        alert('Error: ' + (err.error || 'No se pudo procesar'));
      }
    } catch (e) {
      alert('Error de conexión: Verifica que el servidor esté activo');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white max-w-lg mx-auto mt-10 border border-yellow-500/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">Mi Wallet</h2>
        <button className="text-sm underline" onClick={() => setActiveTab('balance')}>Cerrar</button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
            onClick={() => setActiveTab('balance')} 
            className={`flex-1 py-2 rounded ${activeTab === 'balance' ? 'bg-yellow-600' : 'bg-gray-800'}`}>
            Saldos
        </button>
        <button 
            onClick={() => setActiveTab('deposit')} 
            className={`flex-1 py-2 rounded ${activeTab === 'deposit' ? 'bg-yellow-600' : 'bg-gray-800'}`}>
            Depositar
        </button>
      </div>

      {activeTab === 'balance' ? (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded flex justify-between">
            <span>Saldo Jugable</span>
            <span className="font-bold text-xl">${gameStore.balance}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded text-sm text-gray-300">
            <p><strong>Mercado Pago:</strong> Alias: WUAICOT.RULETA</p>
            <p><strong>Banco Estado:</strong> Cuenta RUT: 12345678</p>
          </div>
          <input 
            type="number" 
            placeholder="Monto" 
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full"
          />
          <button 
            onClick={handleDeposit}
            className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700">
            Enviar Comprobante
          </button>
          <a href="https://wa.me/56900000000" target="_blank" rel="noreferrer" className="block text-center text-green-400 mt-2 hover:underline">
            Enviar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
});
