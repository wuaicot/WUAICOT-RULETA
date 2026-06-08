import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { observer } from 'mobx-react';
import { gameStore, GameContext } from './store/gameStore';
import { Error } from './components/difStates/Error';
import { Notification } from './components/difStates/Notification';
import { Header } from './components/nav/Header';
import { Dashboard } from './components/nav/Dashboard';
import { Board } from './components/board/Board';
import { Chips } from './components/board/Chips';
import { Top10 } from './components/nav/Top10';
import { OperatorDashboard } from './components/admin/OperatorDashboard';
import { useServer } from './hooks/useServer';
import { GameLoop } from './common/types';
import './App.css';
import { useCallback, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8888';

const App = observer(() => {
	const { error, connect, disconnect } = useServer();
	const isAdminPath = window.location.pathname === '/admin';

	// Validación de sesión global
	useEffect(() => {
		const token = localStorage.getItem('token');
		console.log("[AUTH-DEBUG] Token encontrado:", !!token);
		if (token) {
			gameStore.setIsCheckingAuth(true);
			fetch(`${API_URL}/api/auth/me`, {
				headers: { 'Authorization': `Bearer ${token}` }
			})
			.then(res => res.json())
			.then(data => {
				console.log("[AUTH-DEBUG] Respuesta /me:", data);
				if (data.user) {
					gameStore.setNickname(data.user.nickname);
					gameStore.setPlayerId(data.user.id);
					gameStore.setRole(data.user.role || 'USER');
					console.log("[AUTH-DEBUG] Rol asignado en store:", gameStore.role);
					
					// Redirigir si es admin y no está en la ruta admin
					if (data.user.role === 'ADMIN' && window.location.pathname !== '/admin') {
						console.log("[AUTH-DEBUG] Redirigiendo a /admin...");
						window.location.href = '/admin';
					}

					// Cargar saldo inicial
					fetch(`${API_URL}/api/wallet/balance`, {
						headers: { 'Authorization': `Bearer ${token}` }
					})
					.then(res => res.json())
					.then(bal => gameStore.setBalance(Number(bal.balance)));
					
					connect();
				}
			})
			.catch(err => {
				console.error("[AUTH-DEBUG] Error validando sesión:", err);
				localStorage.removeItem('token');
			})
			.finally(() => {
				console.log("[AUTH-DEBUG] Finalizando verificación auth");
				gameStore.setIsCheckingAuth(false);
			});
		} else {
			console.log("[AUTH-DEBUG] No hay token, finalizando auth");
			gameStore.setIsCheckingAuth(false);
		}
	}, [connect]);

	const setPointerEvents = useCallback(() => {
		const message = gameStore.msg;
		if (!message) return 'App';
		return message.gameStage === GameLoop.PLACE_BET
			? 'App'
			: 'App no-pointers';
	}, []);

	if (isAdminPath) {
		if (gameStore.isCheckingAuth) {
			return (
				<div className="bg-gray-950 min-h-screen flex items-center justify-center text-white">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
						<p className="text-yellow-500 font-bold animate-pulse">Verificando Credenciales...</p>
					</div>
				</div>
			);
		}

		if (gameStore.role !== 'ADMIN') {
			return (
				<div className="bg-gray-950 min-h-screen flex items-center justify-center text-white p-6">
					<div className="bg-gray-900 p-8 rounded-lg border border-red-500 shadow-2xl max-w-md text-center">
						<h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
						<p className="text-gray-300 mb-6">No tienes permisos para acceder a esta área. Si eres administrador, asegúrate de haber iniciado sesión correctamente.</p>
						<button 
							onClick={() => window.location.href = '/'}
							className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded transition-colors">
							Volver al Inicio
						</button>
					</div>
				</div>
			);
		}
		return <OperatorDashboard />;
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<GameContext.Provider value={gameStore}>
				{error && <Error error={error} />}
				<Notification />
				<Header connect={connect} disconnect={disconnect} />
				<Top10 />
				<div className={setPointerEvents()}>
					<Dashboard />
					<Board />
					<Chips />
				</div>
			</GameContext.Provider>
		</DndProvider>
	);});

export default App;
