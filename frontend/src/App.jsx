import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="App">
      <GameCanvas />

      {/* Leaderboard Button - Always Visible */}
      <button
        title="View top scores"
        className="leaderboard-btn"
        onClick={() => setShowLeaderboard(true)}
      >
        🏆
      </button>

      {/* Leaderboard Modal */}
      <Leaderboard
        isVisible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}

export default App;
