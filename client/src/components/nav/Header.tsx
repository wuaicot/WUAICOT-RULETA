import { useState, useEffect, useRef } from 'react';
import { Button } from '../../UI/Button';
import { Audio } from './Audio';
import { FinancialToggle } from './FinancialToggle';
import { WalletDashboard } from '../wallet/WalletDashboard';
import { AuthModal } from './AuthModal';
import { assetsURL } from '../../utils/utils';
import { gameStore } from '../../store/gameStore';
// @ts-ignore: CSS module import without type declarations
import './Header.css';

interface HeaderProps {
	connect: () => void;
	disconnect: () => void;
}

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8888';

export const Header = (props: HeaderProps) => {
	const { connect, disconnect } = props;
	const [user, setUser] = useState<{token: string, nickname: string} | null>(null);
	const [showWallet, setShowWallet] = useState(false);
	const [showAuth, setShowAuth] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const walletRef = useRef<HTMLDivElement>(null);
	const walletButtonRef = useRef<HTMLButtonElement>(null);

	// Actualizar usuario local cuando el store cambie
	useEffect(() => {
		if (gameStore.playerId && !user) {
			const token = localStorage.getItem('token');
			if (token) {
				setUser({ token, nickname: gameStore.nickname });
			}
		} else if (!gameStore.playerId && user) {
			setUser(null);
		}
	}, [user]); // Removed gameStore.playerId and gameStore.nickname

	// Cerrar Wallet al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (
				showWallet && 
				walletRef.current && 
				!walletRef.current.contains(event.target as Node) &&
				walletButtonRef.current && 
				!walletButtonRef.current.contains(event.target as Node)
			) {
				setShowWallet(false);
			}
		};

		if (showWallet) {
			document.addEventListener('mousedown', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [showWallet]);

	const handleLogin = (data: { token: string, user: any, isNewUser?: boolean }) => {
		console.log("[AUTH-DEBUG] Login exitoso, datos recibidos:", data);
		setUser({ token: data.token, nickname: data.user.nickname });
		gameStore.setNickname(data.user.nickname);
		gameStore.setPlayerId(data.user.id);
		gameStore.setRole(data.user.role || 'USER');
		console.log("[AUTH-DEBUG] Rol seteado en store:", gameStore.role);
		localStorage.setItem('token', data.token);

		if (data.isNewUser) {
			gameStore.setNotification("¡Bienvenido! recibe Una Luka de regalo 🎁 ver en Billetera");
		}

		// Redirigir si es admin
		if (data.user.role === 'ADMIN') {
			console.log("[AUTH-DEBUG] Es ADMIN, redirigiendo a /admin...");
			window.location.href = '/admin';
		}

		// Cargar saldo inicial
		fetch(`${API_URL}/api/wallet/balance`, {
			headers: { 'Authorization': `Bearer ${data.token}` }
		})
		.then(res => res.json())
		.then(bal => gameStore.setBalance(Number(bal.balance)));

		connect();
	};

	const performLogout = async () => {
		const token = localStorage.getItem('token');
		if (token) {
			await gameStore.syncBalance(token);
		}
		
		// Limpiar estado del juego al salir
		gameStore.setMsg(null);
		gameStore.setBoardClear();
		
		setUser(null);
		localStorage.removeItem('token');
		disconnect();
		setShowLogoutConfirm(false);
	};

	const handleLogout = async () => {
		setShowLogoutConfirm(true);
	};

	return (
		<>
			<nav className='header'>
				<div className='audio-login-container'>
					<FinancialToggle />
					{user && (
						<Button className='login-button' onClick={() => setShowWallet(!showWallet)} ref={walletButtonRef}>
							Billetera
						</Button>
					)}
					{!user ? (
						<Button className='login-button' onClick={() => setShowAuth(true)}>
							Entrar
						</Button>
					) : (
						<Button className='logout-button' onClick={handleLogout}>
							Salir ({user.nickname})
						</Button>
					)}
					<Audio url={assetsURL.soundtrack} loop={true} />
				</div>
			</nav>
            {/* Modal de confirmación */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
                    <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500 w-80">
                        <h2 className="text-xl text-yellow-500 mb-4">Cerrar Sesión</h2>
                        <p className="text-white mb-6">¿Estás seguro de que deseas salir?</p>
                        <div className="flex justify-end gap-2">
                            <Button className="bg-gray-700" onClick={() => setShowLogoutConfirm(false)}>Cancelar</Button>
                            <Button className="bg-red-700" onClick={performLogout}>Salir</Button>
                        </div>
                    </div>
                </div>
            )}
			{showWallet && user && (
				<div className="wallet-overlay-container" ref={walletRef}>
					<WalletDashboard token={user.token} onClose={() => setShowWallet(false)} />
				</div>
			)}
			{showAuth && (
				<AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />
			)}
		</>
	);
};
