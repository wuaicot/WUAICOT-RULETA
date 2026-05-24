import { useState } from 'react';
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

export const Header = (props: HeaderProps) => {
	const { connect, disconnect } = props;
	const [user, setUser] = useState<{token: string, nickname: string} | null>(null);
	const [showWallet, setShowWallet] = useState(false);
	const [showAuth, setShowAuth] = useState(false);

	const handleLogin = (data: { token: string, user: any }) => {
		setUser({ token: data.token, nickname: data.user.nickname });
		gameStore.setNickname(data.user.nickname);
		gameStore.setPlayerId(data.user.id);
		localStorage.setItem('token', data.token);
		connect();
	};

	const handleLogout = () => {
		setUser(null);
		localStorage.removeItem('token');
		disconnect();
	};

	return (
		<>
			<nav className='header'>
				<div className='audio-login-container'>
					<FinancialToggle />
					{user && (
						<Button className='login-button' onClick={() => setShowWallet(!showWallet)}>
							Wallet
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
			{showWallet && user && (
				<div className="absolute top-20 right-10 z-[5000]">
					<WalletDashboard token={user.token} onClose={() => setShowWallet(false)} />
				</div>
			)}
			{showAuth && (
				<AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />
			)}
		</>
	);
};
