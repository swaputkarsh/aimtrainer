/**
 * API Service Layer
 * Handles all backend API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Create a new game session
 */
export const createSession = async (playerId, playerName) => {
  try {
    const response = await fetch(`${API_URL}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_id: playerId,
        player_name: playerName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create session:', error);
    // Return mock session in case of error
    return {
      session_id: `session_${Date.now()}`,
      player_id: playerId,
      player_name: playerName,
      status: 'started',
    };
  }
};

/**
 * End game session and save results
 */
export const endSession = async (sessionId, score, accuracy, hits, misses, shotsTaken) => {
  try {
    const response = await fetch(`${API_URL}/sessions/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        score,
        accuracy,
        hits,
        misses,
        shots_taken: shotsTaken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to end session:', error);
    return { session_id: sessionId, status: 'completed', score };
  }
};

/**
 * Get session details
 */
export const getSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

/**
 * Get top scores from leaderboard
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/leaderboard/top?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return { entries: [], total: 0 };
  }
};

/**
 * Get player's scores
 */
export const getPlayerScores = async (playerId, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/leaderboard/player/${playerId}?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get player scores:', error);
    return { player_id: playerId, entries: [], total: 0 };
  }
};

/**
 * Get game configuration
 */
export const getGameConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/config/game`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get config:', error);
    // Return defaults
    return {
      target_spawn_rate: 800,
      target_size: 30,
      game_duration: 60,
      max_targets_on_screen: 5,
    };
  }
};

/**
 * Health check
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      return { status: 'unhealthy', database: 'disconnected' };
    }
    return await response.json();
  } catch (error) {
    return { status: 'unhealthy', database: 'disconnected' };
  }
};
