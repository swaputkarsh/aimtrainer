/**
 * usePlayer Hook
 * Manages player state and unique ID
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'aim_trainer_player';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    id: '',
    name: 'Anonymous',
  });

  useEffect(() => {
    // Try to load player from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setPlayer(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load player:', error);
        initializeNewPlayer();
      }
    } else {
      initializeNewPlayer();
    }
  }, []);

  const initializeNewPlayer = () => {
    // Generate unique player ID
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPlayer = { id: playerId, name: 'Anonymous' };
    setPlayer(newPlayer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlayer));
  };

  const updatePlayerName = (name) => {
    const updated = { ...player, name: name || 'Anonymous' };
    setPlayer(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    playerId: player.id,
    playerName: player.name,
    updatePlayerName,
  };
};
