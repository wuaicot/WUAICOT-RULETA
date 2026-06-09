import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { X } from 'lucide-react';
import { gameStore } from '../../store/gameStore';
import { apiFetch } from '../../utils/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/default';

export const WalletDashboard = observer(({ token, onClose }: { token: string, onClose?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [activeBank, setActiveBank] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  
  const banksData: { [key: string]: { titular: string; rut: string; cuenta: string; tipo: string } } = {
    'Mercado Pago': { titular: 'Naycol Linares', rut: '26091433-2', cuenta: '1080951820', tipo: 'Vista' },
    'Banco Estado': { titular: 'Naycol Linares', rut: '26091433-2', cuenta: '26091433', tipo: 'Cuenta RUT' }
  };

  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Estados del Formulario de Retiro
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Vista');
  const [accountNumber, setAccountNumber] = useState('');
  const [rut, setRut] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);

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

  const fetchWithdrawalHistory = React.useCallback(async () => {
    try {
      const data = await apiFetch('/api/wallet/withdrawal-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWithdrawalHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setWithdrawalHistory([]);
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
    fetchWithdrawalHistory();
  }, [fetchHistory, fetchWithdrawalHistory]);

  useEffect(() => {
    // Escuchar cambios de estado desde el servidor para refrescar el historial y saldo
    const socket = io(SOCKET_URL);
    socket.on('DEPOSIT_STATUS_CHANGED', () => {
      fetchHistory();
      gameStore.syncBalance(token);
    });

    socket.on('WITHDRAWAL_STATUS_CHANGED', () => {
      fetchWithdrawalHistory();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchHistory, fetchWithdrawalHistory, token]);

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

  const handleWithdrawal = async () => {
    if (!withdrawAmount || !bankName || !accountNumber || !rut || !fullName || !email) {
      setStatusMsg({ text: 'Completa todos los campos', type: 'error' });
      return;
    }

    if (Number(withdrawAmount) <= 0) {
      setStatusMsg({ text: 'El monto debe ser mayor a 0', type: 'error' });
      return;
    }

    if (Number(withdrawAmount) > gameStore.balance) {
      setStatusMsg({ text: 'Saldo insuficiente para realizar el retiro', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8888'}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          bankDetails: {
            bankName,
            accountType,
            accountNumber,
            rut,
            fullName,
            email
          }
        }),
      });

      if (response.ok) {
        setStatusMsg({ text: 'Solicitud de retiro enviada con éxito.', type: 'success' });
        setWithdrawAmount('');
        setBankName('');
        setAccountNumber('');
        setRut('');
        setFullName('');
        setEmail('');
        fetchWithdrawalHistory();
        gameStore.fetchBalance(token);
      } else {

        const err = await response.json();
        setStatusMsg({ text: 'Error: ' + (err.error || 'No se pudo procesar'), type: 'error' });
      }
    } catch (e) {
      setStatusMsg({ text: 'Error de conexión', type: 'error' });
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white max-w-lg mx-auto border border-yellow-500/20 w-full sm:w-[420px]">
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
        <div className={`p-3 mb-4 rounded text-center font-bold text-sm ${statusMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {statusMsg.text}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button 
            onClick={() => setActiveTab('balance')} 
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${activeTab === 'balance' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            Saldos
        </button>
        <button 
            onClick={() => setActiveTab('deposit')} 
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${activeTab === 'deposit' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            Depositar
        </button>
        <button 
            onClick={() => setActiveTab('withdraw')} 
            className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${activeTab === 'withdraw' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            Retirar
        </button>
      </div>

      {activeTab === 'balance' ? (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded flex justify-between items-center border border-gray-700">
            <span className="text-gray-300 font-medium">Saldo Jugable</span>
            <span className="font-bold text-2xl text-yellow-500">${gameStore.balance}</span>
          </div>

          <div className="mt-4">
            <h3 className="text-yellow-500 font-bold mb-2 text-sm">Historial de Depósitos</h3>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <p className="text-gray-500 text-xs italic">No hay depósitos registrados.</p>
              ) : (
                history.map((h: any) => (
                  <div key={h.id} className="bg-gray-800 p-2.5 rounded border border-gray-700 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">Monto: ${h.amount}</p>
                      {h.rejectionReason && <p className="text-red-400 italic text-[10px] mt-0.5">Razón: {h.rejectionReason}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.status === 'APPROVED' ? 'bg-green-900/60 text-green-400 border border-green-700/55' :
                      h.status === 'REJECTED' ? 'bg-red-900/60 text-red-400 border border-red-700/55' :
                      'bg-yellow-900/60 text-yellow-400 border border-yellow-700/55'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-gray-800 pt-3">
            <h3 className="text-yellow-500 font-bold mb-2 text-sm">Historial de Retiros</h3>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {withdrawalHistory.length === 0 ? (
                <p className="text-gray-500 text-xs italic">No hay retiros registrados.</p>
              ) : (
                withdrawalHistory.map((w: any) => (
                  <div key={w.id} className="bg-gray-800 p-2.5 rounded border border-gray-700 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">Monto: ${w.amount}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{w.bankDetails?.bankName} • {w.bankDetails?.accountNumber}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.status === 'APPROVED' ? 'bg-green-900/60 text-green-400 border border-green-700/55' :
                      w.status === 'REJECTED' ? 'bg-red-900/60 text-red-400 border border-red-700/55' :
                      'bg-yellow-900/60 text-yellow-400 border border-yellow-700/55'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'deposit' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-yellow-500 font-bold text-sm">Selecciona Banco</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  name: 'Mercado Pago', 
                  color: 'blue',
                  details: { titular: 'Naycol Linares', rut: '26091433-2', cuenta: '1080951820', tipo: 'Vista' } 
                },
                { 
                  name: 'Banco Estado', 
                  color: 'emerald',
                  details: { titular: 'Naycol Linares', rut: '26091433-2', cuenta: '26091433', tipo: 'Cuenta RUT' } 
                }
              ].map((bank) => {
                const isActive = activeBank === bank.name;
                
                const bankStyles: any = {
                    blue: {
                        active: 'bg-blue-900/50 text-white border-blue-500 shadow-lg shadow-blue-900/20',
                        inactive: 'bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500/50 hover:bg-blue-900/20'
                    },
                    emerald: {
                        active: 'bg-emerald-900/50 text-white border-emerald-500 shadow-lg shadow-emerald-900/20',
                        inactive: 'bg-gray-800 text-gray-300 border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-900/20'
                    }
                };
                
                const baseClass = "p-3 rounded-lg text-sm font-bold transition-all border-2";
                const activeClass = bankStyles[bank.color].active;
                const inactiveClass = bankStyles[bank.color].inactive;

                return (
                  <button
                    key={bank.name}
                    onClick={() => setActiveBank(isActive ? null : bank.name)}
                    className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                  >
                    {bank.name}
                  </button>
                );
              })}
            </div>
          </div>

          {activeBank && (
            <div className="p-4 bg-gray-800 rounded text-sm text-gray-300 border border-yellow-500/50 space-y-1">
              <p><strong>Titular:</strong> {banksData[activeBank].titular}</p>
              <p><strong>RUT:</strong> {banksData[activeBank].rut}</p>
              <p><strong>Cuenta:</strong> {banksData[activeBank].cuenta}</p>
              <p><strong>Tipo:</strong> {banksData[activeBank].tipo}</p>
            </div>
          )}
          
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-yellow-500 font-bold">$</span>
            <input 
              type="number" 
              placeholder="Ingresa el monto a depositar" 
              aria-label="Monto a depositar"
              className="w-full pl-8 p-2.5 bg-gray-950 rounded-lg border-2 border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            
            <input 
              type="file" 
              aria-label="Seleccionar comprobante de pago"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 cursor-pointer"
            />
          </div>
          <button 
            onClick={handleDeposit}
            aria-label="Enviar comprobante de depósito"
            className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700 transition-colors text-sm">
            Enviar Comprobante
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          <div className="p-3 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">
            <p><strong>Retirar fondos:</strong> El saldo solicitado se descontará de inmediato de tu saldo jugable para procesar la transferencia.</p>
          </div>
          <input 
            type="number" 
            placeholder="Monto a retirar" 
            aria-label="Monto a retirar"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Banco destinatario" 
            aria-label="Banco"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <select 
            aria-label="Tipo de Cuenta"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500 text-white"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="Vista">Cuenta Vista</option>
            <option value="RUT">Cuenta RUT</option>
            <option value="Corriente">Cuenta Corriente</option>
            <option value="Ahorro">Cuenta de Ahorro</option>
          </select>
          <input 
            type="text" 
            placeholder="Número de Cuenta" 
            aria-label="Número de Cuenta"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="RUT del Titular" 
            aria-label="RUT del titular"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Nombre Completo del Titular" 
            aria-label="Nombre completo del titular"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Correo de Contacto" 
            aria-label="Correo electrónico"
            className="w-full p-2 bg-gray-800 rounded border border-gray-600 text-sm focus:outline-none focus:border-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            onClick={handleWithdrawal}
            aria-label="Solicitar retiro de fondos"
            className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700 transition-colors text-sm">
            Solicitar Retiro
          </button>
        </div>
      )}
    </div>
  );
});

