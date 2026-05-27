import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config/default';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8888';

export const OperatorDashboard = observer(() => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchDeposits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pending-deposits`);
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error("Error fetching deposits", e);
    }
  };

  useEffect(() => {
    fetchDeposits();

    const socket = io(SOCKET_URL);
    socket.on('NEW_DEPOSIT_REQUEST', (newDeposit: any) => {
      fetchDeposits();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`${API_URL}/api/admin/approve-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id })
    });
    if(res.ok) {
        alert("Aprobado");
        fetchDeposits(); // Refrescar lista
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Razón del rechazo:");
    if (!reason) return;

    const res = await fetch(`${API_URL}/api/admin/reject-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, reason })
    });
    if(res.ok) {
        alert("Rechazado");
        fetchDeposits();
    }
  };
// ... rest of the component

  return (
    <div className="p-10 bg-gray-950 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-500 mb-8">Panel del Operador</h1>
      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-gray-900 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div>
              <p>Usuario: {req.user.nickname}</p>
              <p>Monto: ${req.amount}</p>
              <a href={`${API_URL}/${req.proofUrl.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-400 underline">Ver Comprobante</a>
            </div>
            <div className="flex gap-2">
              <button 
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                  Aprobar
              </button>
              <button 
                  onClick={() => handleReject(req.id)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                  Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
