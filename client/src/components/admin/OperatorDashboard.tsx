import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config/default';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8888';

export const OperatorDashboard = observer(() => {
  const [requests, setRequests] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const getAuthHeader = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("[ADMIN-DEBUG] No se encontró token en localStorage");
        return {};
    }
    return { 'Authorization': `Bearer ${token}` };
  }, []);

  const fetchDeposits = useCallback(async () => {
    try {
      console.log("[ADMIN-DEBUG] Buscando depósitos pendientes...");
      const headers = getAuthHeader();
      const res = await fetch(`${API_URL}/api/admin/pending-deposits`, {
        headers
      });
      const data = await res.json();
      console.log("[ADMIN-DEBUG] Depósitos recibidos:", data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching deposits", e);
    }
  }, [getAuthHeader]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      console.log("[ADMIN-DEBUG] Buscando retiros pendientes...");
      const headers = getAuthHeader();
      const res = await fetch(`${API_URL}/api/admin/pending-withdrawals`, {
        headers
      });
      const data = await res.json();
      console.log("[ADMIN-DEBUG] Retiros recibidos:", data);
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching withdrawals", e);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchDeposits();
    fetchWithdrawals();

    const socket = io(SOCKET_URL);
    socket.on('NEW_DEPOSIT_REQUEST', () => {
      console.log("[ADMIN-DEBUG] Nueva solicitud de depósito detectada vía Socket");
      fetchDeposits();
    });
    socket.on('NEW_WITHDRAWAL_REQUEST', () => {
      console.log("[ADMIN-DEBUG] Nueva solicitud de retiro detectada vía Socket");
      fetchWithdrawals();
    });
    socket.on('WITHDRAWAL_STATUS_CHANGED', () => {
      fetchWithdrawals();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDeposits, fetchWithdrawals]);

  const handleApprove = async (id: string) => {
    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };
    const res = await fetch(`${API_URL}/api/admin/approve-deposit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ depositId: id })
    });
    if(res.ok) {
        alert("Depósito Aprobado");
        fetchDeposits(); // Refrescar lista
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Razón del rechazo:");
    if (!reason) return;

    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };
    const res = await fetch(`${API_URL}/api/admin/reject-deposit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ depositId: id, reason })
    });
    if(res.ok) {
        alert("Depósito Rechazado");
        fetchDeposits();
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    const confirmApprove = window.confirm("¿Estás seguro de que deseas APROBAR este retiro? Confirma que ya realizaste la transferencia bancaria.");
    if (!confirmApprove) return;

    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };
    const res = await fetch(`${API_URL}/api/admin/approve-withdrawal`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ withdrawalId: id })
    });
    if (res.ok) {
      alert("Retiro Aprobado");
      fetchWithdrawals();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "No se pudo procesar"));
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    const confirmReject = window.confirm("¿Estás seguro de que deseas RECHAZAR este retiro? El dinero se le reembolsará automáticamente en la wallet del usuario.");
    if (!confirmReject) return;

    const headers = { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };
    const res = await fetch(`${API_URL}/api/admin/reject-withdrawal`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ withdrawalId: id })
    });
    if (res.ok) {
      alert("Retiro Rechazado y saldo reembolsado con éxito");
      fetchWithdrawals();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "No se pudo procesar"));
    }
  };

  return (
    <div className="p-10 bg-gray-950 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-500 mb-8 border-b border-yellow-500/20 pb-4">Panel del Operador</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna de Depósitos */}
        <div>
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            📥 Solicitudes de Depósito Pendientes
            <span className="bg-green-900/60 text-green-400 border border-green-700/50 px-2 py-0.5 rounded-full text-xs font-semibold">{requests.length}</span>
          </h2>
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No hay depósitos pendientes.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="bg-gray-900 p-5 rounded-lg border border-gray-800 shadow-lg flex justify-between items-center transition-all hover:border-gray-700">
                  <div>
                    <p className="font-semibold text-white">Usuario: <span className="text-yellow-500">{req.user.nickname}</span></p>
                    <p className="text-sm text-gray-300 mt-1">Monto: <span className="text-green-400 font-bold">${req.amount}</span></p>
                    <a href={`${API_URL}/${req.proofUrl.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs mt-2 inline-block">Ver Comprobante de Pago</a>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleApprove(req.id)}
                        className="bg-green-600 px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition-colors">
                        Aprobar
                    </button>
                    <button 
                        onClick={() => handleReject(req.id)}
                        className="bg-red-600 px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors">
                        Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna de Retiros */}
        <div>
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            📤 Solicitudes de Retiro Pendientes
            <span className="bg-red-900/60 text-red-400 border border-red-700/50 px-2 py-0.5 rounded-full text-xs font-semibold">{withdrawals.length}</span>
          </h2>
          <div className="grid gap-4">
            {withdrawals.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No hay retiros pendientes.</p>
            ) : (
              withdrawals.map(w => (
                <div key={w.id} className="bg-gray-900 p-5 rounded-lg border border-gray-800 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-700">
                  <div className="flex-1 w-full">
                    <p className="font-semibold text-white">Usuario: <span className="text-yellow-500">{w.user.nickname}</span></p>
                    <p className="text-sm text-gray-300 mt-1">Monto solicitado: <span className="text-red-400 font-bold">${w.amount}</span></p>
                    
                    {w.bankDetails && (
                      <div className="mt-3 p-3 bg-gray-800/80 rounded border border-gray-700 text-xs text-gray-300 space-y-1 w-full">
                        <p><strong>Banco:</strong> {w.bankDetails.bankName}</p>
                        <p><strong>Tipo Cuenta:</strong> {w.bankDetails.accountType}</p>
                        <p><strong>Nº Cuenta:</strong> {w.bankDetails.accountNumber}</p>
                        <p><strong>RUT / ID:</strong> {w.bankDetails.rut}</p>
                        <p><strong>Titular:</strong> {w.bankDetails.fullName}</p>
                        <p><strong>Correo:</strong> {w.bankDetails.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 self-end md:self-center">
                    <button 
                        onClick={() => handleApproveWithdrawal(w.id)}
                        className="bg-green-600 px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition-colors whitespace-nowrap">
                        Aprobar
                    </button>
                    <button 
                        onClick={() => handleRejectWithdrawal(w.id)}
                        className="bg-red-600 px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap">
                        Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
