import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { gameStore } from '../../store/gameStore';
import { REDS, BLACKS } from '../../utils/utils';
import { GameLoop } from '../../common/types';
import './Top10.css';

export const Top10 = observer(() => {
    const [history, setHistory] = useState<number[]>([]);

    useEffect(() => {
        // Solo actualizar cuando el estado del juego sea WINNER
        const currentWinner = gameStore.msg?.winningNumber;
        const currentStage = gameStore.msg?.gameStage;

        if (currentStage === GameLoop.WINNER && currentWinner !== undefined && currentWinner !== history[0]) {
            setHistory(prev => [currentWinner, ...prev].slice(0, 10));
        }
    }, [gameStore.msg]);

    return (
        <div className="top10-container">
            <h3 className="top10-title">Últimos</h3>
            <div className="top10-list">
                {history.map((num, index) => (
                    <div 
                        key={index} 
                        className={`history-item ${index === 0 ? 'latest' : ''} ${REDS.includes(num) ? 'red' : BLACKS.includes(num) ? 'black' : 'plain'}`}
                    >
                        {num}
                    </div>
                ))}
            </div>
        </div>
    );
});

