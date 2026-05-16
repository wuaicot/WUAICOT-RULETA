import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { gameStore } from '../../store/gameStore';
import "./FinancialToggle.css";

export const FinancialToggle = observer(() => {
    const [isVisible, setIsVisible] = useState(false);

    const handleToggle = () => {
        setIsVisible(true);
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <div className="financial-toggle-wrapper">
            <button className="financial-btn" onClick={handleToggle}>
                $ Info
            </button>
            <div className={`financial-info ${isVisible ? 'show' : ''}`}>
                <span>Saldo: ${gameStore.balance}</span>
                <span>Apuesta: ${gameStore.totalBet}</span>
                <span>Resultado: {gameStore.lastResult}</span>
            </div>
        </div>
    );
});
