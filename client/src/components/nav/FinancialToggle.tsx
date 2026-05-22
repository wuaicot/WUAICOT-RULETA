import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import "./FinancialToggle.css";

export const FinancialToggle = observer(() => {
    const [isVisible, setIsVisible] = useState(false);

    const handleToggle = () => {
        setIsVisible(!isVisible);
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
                $
            </button>
            <div className={`financial-info ${isVisible ? 'show' : ''}`}>
                <span>Saldo: $0</span>
                <span>Apuesta: $0</span>
                <span>Resultado: $0</span>
            </div>
        </div>
    );
});
