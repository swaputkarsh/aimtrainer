/**
 * Leaderboard Component
 * Displays top scores from backend
 */
import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import './Leaderboard.css';

const Leaderboard = ({ isVisible = false, onClose }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchLeaderboard();
    }
  }, [isVisible]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(10);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="leaderboard-modal">
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h1>LEADERBOARD</h1>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <p>No scores yet</p>
            <p className="empty-hint">Play a game to get on the leaderboard!</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="col rank">Rank</div>
              <div className="col player">Player</div>
              <div className="col score">Score</div>
              <div className="col accuracy">Accuracy</div>
            </div>
            <div className="table-body">
              {entries.map((entry) => (
                <div key={`${entry.rank}-${entry.player_name}`} className="table-row">
                  <div className="col rank">
                    <span className={`rank-badge rank-${entry.rank}`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </span>
                  </div>
                  <div className="col player">{entry.player_name || 'Anonymous'}</div>
                  <div className="col score">{entry.score}</div>
                  <div className="col accuracy">{entry.accuracy.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
