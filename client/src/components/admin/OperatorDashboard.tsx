import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

export const OperatorDashboard = observer(() => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchDeposits = async () => {
    try {
      const res = await fetch('http://localhost:8888/api/admin/pending-deposits');
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error("Error fetching deposits", e);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch('http://localhost:8888/api/admin/approve-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id })
    });
    if(res.ok) {
        alert("Aprobado");
        fetchDeposits(); // Refrescar lista
    }
  };

  return (
    <div className="p-10 bg-gray-950 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-yellow-500 mb-8">Panel del Operador</h1>
      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-gray-900 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div>
              <p>Usuario: {req.userId}</p>
              <p>Monto: ${req.amount}</p>
              <a href={`http://localhost:8888/${req.proofUrl.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-400 underline">Ver Comprobante</a>
            </div>
            <button 
                onClick={() => handleApprove(req.id)}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                Aprobar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
