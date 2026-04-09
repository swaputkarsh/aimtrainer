import React, { useEffect, useRef, useState } from 'react';
import './GameCanvas.css';
import { createSession, endSession, checkHealth } from '../services/api';
import { usePlayer } from '../hooks/usePlayer';

/**
 * GameCanvas Component
 * Handles the main game rendering with HTML5 Canvas
 * Manages game state, targets, scoring, and timer
 */
const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { playerId, playerName } = usePlayer();

  const [gameState, setGameState] = useState({
    score: 0,
    hits: 0,
    misses: 0,
    shots: 0,
    accuracy: 0,
    timeLeft: 60,
    isGameActive: false,
    isGameOver: false,
  });

  const [sessionId, setSessionId] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(null);

  const gameRef = useRef({
    targets: [],
    animationId: null,
    lastSpawnTime: 0,
    spawnInterval: 800, // ms between target spawns
    targetLifetime: 2500, // ms before target disappears
    targetRadius: 30,
    score: 0,
    hits: 0,
    misses: 0,
    shots: 0,
    timeLeft: 60,
    gameDuration: 60,
    isGameActive: false,
    isGameOver: false,
  });

  /**
   * Check backend connectivity on mount
   */
  useEffect(() => {
    const checkBackend = async () => {
      const health = await checkHealth();
      setIsBackendConnected(health.status === 'healthy');
    };

    checkBackend();
  }, []);

  /**
   * Initialize canvas and add event listeners
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Click handler for shooting
    const handleClick = (e) => {
      if (!gameRef.current.isGameActive || gameRef.current.isGameOver) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      handleShoot(clickX, clickY);
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  /**
   * Check if click hit any target
   * Updates score and target list
   */
  const handleShoot = (clickX, clickY) => {
    gameRef.current.shots++;
    let hitDetected = false;

    gameRef.current.targets = gameRef.current.targets.filter((target) => {
      const distance = Math.sqrt(
        Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
      );

      if (distance < target.radius) {
        gameRef.current.hits++;
        hitDetected = true;
        return false; // Remove target
      }
      return true;
    });

    if (!hitDetected) {
      gameRef.current.misses++;
    }

    updateGameState();
  };

  /**
   * Spawn a new target at random position
   */
  const spawnTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newTarget = {
      x: Math.random() * (canvas.width - gameRef.current.targetRadius * 2) + gameRef.current.targetRadius,
      y: Math.random() * (canvas.height - gameRef.current.targetRadius * 2) + gameRef.current.targetRadius,
      radius: gameRef.current.targetRadius,
      spawnTime: Date.now(),
    };

    gameRef.current.targets.push(newTarget);
  };

  /**
   * Update game state and trigger re-render
   */
  const updateGameState = () => {
    const accuracy = gameRef.current.shots > 0
      ? Math.round((gameRef.current.hits / gameRef.current.shots) * 100)
      : 0;

    setGameState({
      score: gameRef.current.hits,
      hits: gameRef.current.hits,
      misses: gameRef.current.misses,
      shots: gameRef.current.shots,
      accuracy,
      timeLeft: gameRef.current.timeLeft,
      isGameActive: gameRef.current.isGameActive,
      isGameOver: gameRef.current.isGameOver,
    });
  };

  /**
   * Main game loop - runs every frame
   */
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw targets
    gameRef.current.targets.forEach((target) => {
      const age = Date.now() - target.spawnTime;

      // Remove if expired
      if (age > gameRef.current.targetLifetime) {
        gameRef.current.targets = gameRef.current.targets.filter(t => t !== target);
        return;
      }

      // Draw target circle with fade effect
      const opacity = 1 - (age / gameRef.current.targetLifetime) * 0.3; // Slight fade
      ctx.fillStyle = `rgba(0, 200, 100, ${opacity})`;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw target outline
      ctx.strokeStyle = `rgba(0, 255, 150, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw crosshair in center
      ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(target.x - 10, target.y);
      ctx.lineTo(target.x + 10, target.y);
      ctx.moveTo(target.x, target.y - 10);
      ctx.lineTo(target.x, target.y + 10);
      ctx.stroke();
    });

    // Spawn new targets
    if (gameRef.current.isGameActive && !gameRef.current.isGameOver) {
      if (Date.now() - gameRef.current.lastSpawnTime > gameRef.current.spawnInterval) {
        spawnTarget();
        gameRef.current.lastSpawnTime = Date.now();
      }
    }

    gameRef.current.animationId = requestAnimationFrame(gameLoop);
  };

  /**
   * Start a new game
   */
  const startGame = async () => {
    // Create session on backend
    const session = await createSession(playerId, playerName);
    setSessionId(session.session_id);

    // Reset game state
    gameRef.current = {
      targets: [],
      animationId: null,
      lastSpawnTime: 0,
      spawnInterval: 800,
      targetLifetime: 2500,
      targetRadius: 30,
      score: 0,
      hits: 0,
      misses: 0,
      shots: 0,
      timeLeft: 60,
      gameDuration: 60,
      isGameActive: true,
      isGameOver: false,
    };

    updateGameState();

    // Start game timer
    const timerInterval = setInterval(() => {
      gameRef.current.timeLeft--;
      updateGameState();

      if (gameRef.current.timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame(session.session_id);
      }
    }, 1000);

    // Start render loop
    gameLoop();
  };

  /**
   * End game and show results
   */
  const endGame = async (currentSessionId) => {
    gameRef.current.isGameActive = false;
    gameRef.current.isGameOver = true;

    if (gameRef.current.animationId) {
      cancelAnimationFrame(gameRef.current.animationId);
    }

    // Save session to backend
    if (currentSessionId) {
      await endSession(
        currentSessionId,
        gameRef.current.hits,
        gameState.accuracy,
        gameRef.current.hits,
        gameRef.current.misses,
        gameRef.current.shots
      );
    }

    updateGameState();
  };

  /**
   * Reset game for Play Again
   */
  const playAgain = () => {
    startGame();
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />

      {/* HUD - Always visible */}
      {gameState.isGameActive && !gameState.isGameOver && (
        <div className="hud">
          <div className="hud-item">
            <div className="hud-label">Score</div>
            <div className="hud-value">{gameState.score}</div>
          </div>
          <div className="hud-item">
            <div className="hud-label">Time</div>
            <div className="hud-value">{gameState.timeLeft}s</div>
          </div>
          <div className="hud-item">
            <div className="hud-label">Accuracy</div>
            <div className="hud-value">{gameState.accuracy}%</div>
          </div>
          <div className="hud-item">
            <div className="hud-label">Shots</div>
            <div className="hud-value">{gameState.shots}</div>
          </div>
          {isBackendConnected !== null && (
            <div className="hud-item">
              <div className="hud-label">Status</div>
              <div className={`hud-value ${isBackendConnected ? 'status-online' : 'status-offline'}`}>
                {isBackendConnected ? '🟢' : '🔴'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Start Screen */}
      {!gameState.isGameActive && !gameState.isGameOver && (
        <div className="screen start-screen">
          <div className="screen-content">
            <h1>AIM TRAINER</h1>
            <p>Click on targets to practice your aim.</p>
            <p>60 seconds. How many can you hit?</p>
            <button onClick={startGame} className="btn btn-primary">
              START GAME
            </button>
          </div>
        </div>
      )}

      {/* End Screen - CRITICAL: Must be visible and not hidden */}
      {gameState.isGameOver && (
        <div className="screen end-screen">
          <div className="screen-content">
            <h1>GAME OVER</h1>
            <div className="stats">
              <div className="stat-row">
                <span className="stat-label">Final Score:</span>
                <span className="stat-value">{gameState.score}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">{gameState.accuracy}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Hits:</span>
                <span className="stat-value">{gameState.hits}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Misses:</span>
                <span className="stat-value">{gameState.misses}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Shots:</span>
                <span className="stat-value">{gameState.shots}</span>
              </div>
            </div>
            <button onClick={playAgain} className="btn btn-primary">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
