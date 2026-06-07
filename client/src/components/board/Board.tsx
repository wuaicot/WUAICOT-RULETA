import { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { observer } from 'mobx-react';
import { gameStore } from '../../store/gameStore';
import { BoardItem } from './BoardItem';
import { Chip } from './Chip';
import { matrix } from '../../utils/utils';
import { Bet } from '../../common/types';
import './Board.css';

export const Board = observer(() => {
	const boardRef = useRef<HTMLDivElement | null>(null);
	const { placeBet } = gameStore;

	const [, drop] = useDrop(() => ({
		accept: 'chips',
		drop: (item: { id: string }, monitor) => {
			const boardElement = boardRef.current;
			const clientOffset = monitor.getClientOffset();
			
			if (boardElement && clientOffset) {
				const boardRect = boardElement.getBoundingClientRect();
				// Ajustar para centrar la ficha en el cursor (tamaño ficha = 40px)
				const x = clientOffset.x - boardRect.left - 20;
				const y = clientOffset.y - boardRect.top - 20;

				// Identify the specific cell or item dropped on
				const elem = document.elementFromPoint(clientOffset.x, clientOffset.y);
				const targetId = elem?.id || 'unknown';

				placeBet(+item.id, targetId, { x, y });
				
				return { name: targetId, location: { x, y } };
			}
		},
	}));

	const handleBoardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (gameStore.chipsTaken <= 0) return;

		const target = e.target as HTMLElement;
		let boardItem = target.closest('.item');

		// Si se hace clic en una imagen de ficha ya colocada, buscamos el elemento debajo
		if (!boardItem && target.tagName === 'IMG') {
			const originalPointerEvents = target.style.pointerEvents;
			target.style.pointerEvents = 'none';
			const elem = document.elementFromPoint(e.clientX, e.clientY);
			target.style.pointerEvents = originalPointerEvents;

			if (elem) {
				boardItem = elem.closest('.item');
			}
		}

		if (!boardItem) return;

		const targetId = boardItem.id;
		if (!targetId) return;

		const boardElement = boardRef.current;
		if (boardElement) {
			const boardRect = boardElement.getBoundingClientRect();
			
			// Ubicación del click relativa al contenedor del tablero
			const x = e.clientX - boardRect.left - 20;
			const y = e.clientY - boardRect.top - 20;

			placeBet(gameStore.chipsTaken, targetId, { x, y });
		}
	}, [placeBet]);

	const isTouchDevice = typeof window !== 'undefined' && (
		'ontouchstart' in window || 
		navigator.maxTouchPoints > 0 || 
		window.innerWidth <= 984
	);

	const setRefs = useCallback((node: HTMLDivElement | null) => {
		boardRef.current = node;
		if (node && !isTouchDevice) {
			drop(node);
		}
	}, [drop, isTouchDevice]);

	const trimItem = useCallback((item: string | number) => {
		return typeof item === 'string'
			? item.includes('_')
				? item.split('_')[0]
				: item
			: item;
	}, []);

	return (
		<div className="board-scroll-wrapper">
			<div 
				ref={setRefs} 
				className='board-grid'
				onClick={handleBoardClick}
			>
				{matrix.map((row) =>
					row.map((tableItem) => (
						<BoardItem
							tableItem={trimItem(tableItem)}
							key={tableItem}
							id={tableItem}
						></BoardItem>
					)),
				)}
				{gameStore.bets.map((bet: Bet) => (
					<Chip
						id={bet.betChips[0].id}
						alt={bet.betChips[0].alt}
						url={bet.betChips[0].url}
						key={bet.id}
						style={{
							top: bet.betLocation.y,
							left: bet.betLocation.x,
						}}
					/>
				))}
			</div>
		</div>
	);
});
