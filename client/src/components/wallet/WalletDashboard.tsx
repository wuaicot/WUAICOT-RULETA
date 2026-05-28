import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { X } from 'lucide-react';
import { gameStore } from '../../store/gameStore';
import { apiFetch } from '../../utils/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/default';

export const WalletDashboard = observer(({ token, onClose }: { token: string, onClose?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit'>('balance');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchHistory = React.useCallback(async () => {
    try {
      const data = await apiFetch('/api/wallet/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setHistory([]);
    }
  }, [token]);

  // Auto-limpiar mensaje de estado
  useEffect(() => {
    if (statusMsg) {
        const timer = setTimeout(() => setStatusMsg(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    // Escuchar cambios de estado desde el servidor para refrescar el historial
    const socket = io(SOCKET_URL);
    socket.on('DEPOSIT_STATUS_CHANGED', () => {
      fetchHistory();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchHistory]);

  const handleDeposit = async () => {
    if (!amount || !file) {
        setStatusMsg({ text: 'Completa todos los campos', type: 'error' });
        return;
    }
    
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('proof', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8888'}/api/wallet/deposit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        setStatusMsg({ text: 'Solicitud enviada con éxito.', type: 'success' });
        setAmount('');
        setFile(null);
        fetchHistory();
      }
      else {
        const err = await response.json();
        setStatusMsg({ text: 'Error: ' + (err.error || 'No se pudo procesar'), type: 'error' });
      }
    } catch (e) {
        setStatusMsg({ text: 'Error de conexión', type: 'error' });
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white max-w-lg mx-auto mt-10 border border-yellow-500/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">Mi Wallet</h2>
        <button 
            title="Cerrar" 
            className="bg-gray-700 p-2 rounded hover:bg-red-600 transition-colors group" 
            onClick={onClose}
        >
            <X size={18} className="text-gray-300 group-hover:text-white" />
        </button>
      </div>

      {statusMsg && (
        <div className={`p-3 mb-4 rounded text-center font-bold ${statusMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {statusMsg.text}
        </div>
      )}

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
          <h3 className="text-yellow-500 font-bold">Historial de Depósitos</h3>
          {history.map((h: any) => (
            <div key={h.id} className="bg-gray-800 p-3 rounded border border-gray-700 text-sm">
                <p>Monto: ${h.amount} - <span className={h.status === 'REJECTED' ? 'text-red-500' : 'text-green-500'}>{h.status}</span></p>
                {h.rejectionReason && <p className="text-gray-400 italic">Razón: {h.rejectionReason}</p>}
            </div>
          ))}
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
            aria-label="Monto a depositar"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input 
            type="file" 
            aria-label="Seleccionar comprobante de pago"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full"
          />
          <button 
            onClick={handleDeposit}
            aria-label="Enviar comprobante de depósito"
            className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700">
            Enviar Comprobante
          </button>
        </div>
      )}
    </div>
  );
});
