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
				const x = clientOffset.x - boardRect.left;
				const y = clientOffset.y - boardRect.top;

				// Identify the specific cell or item dropped on
				const elem = document.elementFromPoint(clientOffset.x, clientOffset.y);
				const targetId = elem?.id || 'unknown';

				placeBet(+item.id, targetId, { x, y });
				
				return { name: targetId, location: { x, y } };
			}
		},
	}));

	const setRefs = useCallback((node: HTMLDivElement | null) => {
		boardRef.current = node;
		drop(node);
	}, [drop]);

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
