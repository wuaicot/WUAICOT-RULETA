import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { gameStore, GameContext } from './store/gameStore';
//import { Loader } from './components/difStates/Loader';
import { Error } from './components/difStates/Error';
import { Header } from './components/nav/Header';
import { Dashboard } from './components/nav/Dashboard';
import { Board } from './components/board/Board';
import { Chips } from './components/board/Chips';
import { useServer } from './hooks/useServer';
import { GameLoop, GameData } from './types';
import './App.css';
import { useCallback } from 'react';

function App() {
	const { error, connect, disconnect } = useServer();

	const setPointerEvents = useCallback((message: GameData | null) => {
		if (!message) return 'App';
		if (message) {
			return message.gameStage === GameLoop.PLACE_BET
				? 'App'
				: 'App no-pointers';
		} else if (error) {
			return 'App no-pointers';
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DndProvider backend={HTML5Backend}>
			<div className={setPointerEvents(gameStore.msg)}>
				<GameContext.Provider value={gameStore}>
					{/* {loading && <Loader loading={loading} />} */}
					{error && <Error error={error} />}
					<Header connect={connect} disconnect={disconnect} />
					<Dashboard />
					<Board />
					<Chips />
				</GameContext.Provider>
			</div>
		</DndProvider>
	);
}

export default App;
