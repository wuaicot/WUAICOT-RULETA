import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { observer } from 'mobx-react';
import { gameStore, GameContext } from './store/gameStore';
import { Error } from './components/difStates/Error';
import { Header } from './components/nav/Header';
import { Dashboard } from './components/nav/Dashboard';
import { Board } from './components/board/Board';
import { Chips } from './components/board/Chips';
import { useServer } from './hooks/useServer';
import { GameLoop } from './common/types';
import './App.css';
import { useCallback } from 'react';

const App = observer(() => {
	const { error, connect, disconnect } = useServer();

	const setPointerEvents = useCallback(() => {
		const message = gameStore.msg;
		if (!message) return 'App';
		return message.gameStage === GameLoop.PLACE_BET
			? 'App'
			: 'App no-pointers';
	}, []);

	return (
		<DndProvider backend={HTML5Backend}>
			<GameContext.Provider value={gameStore}>
				{error && <Error error={error} />}
				<Header connect={connect} disconnect={disconnect} />
				<div className={setPointerEvents()}>
					<Dashboard />
					<Board />
					<Chips />
				</div>
			</GameContext.Provider>
		</DndProvider>
	);});

export default App;
