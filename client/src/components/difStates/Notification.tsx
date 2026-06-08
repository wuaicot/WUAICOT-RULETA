import { observer } from 'mobx-react';
import { useContext } from 'react';
import { GameContext } from '../../store/gameStore';
import './Notification.css';

export const Notification = observer(() => {
    const { notification } = useContext(GameContext);
    if (!notification) return null;
    return <div className="notification-overlay">{notification}</div>;
});
