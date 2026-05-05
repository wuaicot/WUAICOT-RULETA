import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { gameStore, GameContext } from '../store/gameStore';
import { SOCKET_URL } from '../config/default';

export const useServer = () => {
	const [error, setError] = useState('');
	const { setMsg } = useContext(GameContext);
	const socketRef = useRef<Socket | null>(null);

	const connect = useCallback(() => {
		if (socketRef.current?.connected) return;

		const socket = io(SOCKET_URL, {
			transports: ['websocket'],
			reconnectionAttempts: 5,
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('Connected to FastAPI server');
			setError('');
			// Initial join
			socket.emit('join_game', JSON.stringify(gameStore.gameData));
		});

		socket.on('connect_error', (err) => {
			setError(`Connection error: ${err.message}`);
		});

		socket.on('stage_change', (data: string) => {
			try {
				const parsedData = JSON.parse(data);
				setMsg(parsedData);
				// Send back current bets/player data to keep server updated
				socket.emit('client_data', JSON.stringify(gameStore.gameData));
			} catch (e) {
				console.error('Error parsing game data:', e);
			}
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from server');
		});

	}, [setMsg]);

	const disconnect = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	return { error, connect, disconnect };
};
