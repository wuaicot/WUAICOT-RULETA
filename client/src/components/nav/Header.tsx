import { useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameContext } from '../../store/gameStore';
import { Button } from '../../UI/Button';
import { Audio } from './Audio';
import { assetsURL } from '../../utils/utils';
import './Header.css';

interface HeaderProps {
	connect: () => void;
	disconnect: () => void;
}

export const Header = (props: HeaderProps) => {
	const { connect, disconnect } = props;
	const [loggedIn, setLoggedIn] = useState(false);
	const { setPlayerId } = useContext(GameContext);

	const logInHandler = useCallback(() => {
		setLoggedIn(true);
		const id = uuidv4();
		setPlayerId(id);
		connect();
	}, []);

	const logOutHandler = useCallback(() => {
		setLoggedIn(false);
		setPlayerId('');
		disconnect();
	}, []);

	return (
		<nav className='header'>
			<a
				href='https://www.roulettesites.org/rules/'
				rel='noreferrer'
				target='blank'
			>
				<Button className='logo  '>Wuaicot Ruleta</Button>
			</a>
			<div className='audio-login-container'>
				{!loggedIn && (
					<Button className='login-button' onClick={logInHandler}>
						Log In
					</Button>
				)}
				{loggedIn && (
					<Button className='logout-button' onClick={logOutHandler}>
						Log Out
					</Button>
				)}
				<Audio url={assetsURL.soundtrack} loop={true} />
			</div>
		</nav>
	);
};
