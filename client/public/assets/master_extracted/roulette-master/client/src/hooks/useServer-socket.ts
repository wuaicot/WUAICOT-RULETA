import { useState, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import { gameStore, GameContext } from '../store/gameStore';
import { SOCKET_URL } from '../config/default';
import { EVENTS } from '../utils/utils';

export const useServer = () => {
	const [error, setError] = useState('');
	const [message, setMessage] = useState<MessageEvent>();
	const { setMsg } = useContext(GameContext);

	const socket = io(SOCKET_URL);

	const connect = useCallback(() => {
		try {
			socket.emit(
				EVENTS.CLIENT.JOIN_GAME,
				JSON.stringify(gameStore.gameData),
			);
			socket.on(EVENTS.SERVER.JOINED_GAME, (value) => {
				console.log(JSON.parse(value));
			});

			socket.on(EVENTS.SERVER.STAGE_CHANGE, (value) => {
				setMessage(JSON.parse(value));
				setMsg(JSON.parse(value));
				socket.emit(
					EVENTS.CLIENT.CLIENT_DATA,
					JSON.stringify(gameStore.gameData),
				);
			});
		} catch (e) {
			setError((e as Error).message);
		}
	}, []);

	const disconnect = useCallback(() => {
		socket.emit(EVENTS.CLIENT.CLOSE);
	}, []);

	return { error, message, connect, disconnect };
};
