# Project Structure & Architecture

## Directory Layout

```
aim-trainer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.jsx          # Main game component (Canvas, game loop, timer)
│   │   │   ├── GameCanvas.css          # Game styling (HUD, screens, animations)
│   │   │   ├── Leaderboard.jsx         # Leaderboard modal component
│   │   │   └── Leaderboard.css         # Leaderboard styling
│   │   ├── hooks/
│   │   │   └── usePlayer.js            # Player state management (ID, name)
│   │   ├── services/
│   │   │   └── api.js                  # API client (sessions, leaderboard, config)
│   │   ├── App.jsx                     # Root component
│   │   ├── App.css                     # App-wide styling
│   │   └── index.jsx                   # React entry point
│   ├── public/
│   │   └── index.html                  # HTML template
│   ├── Dockerfile                      # Frontend container (Node.js + Vite build)
│   ├── package.json                    # Dependencies
│   ├── vite.config.js                  # Vite configuration
│   └── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI app, lifespan, routes
│   │   ├── database.py                 # MongoDB connection & initialization
│   │   ├── models.py                   # Pydantic schemas for validation
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── sessions.py             # POST/GET /sessions endpoints
│   │       ├── leaderboard.py          # GET /leaderboard endpoints
│   │       └── config.py               # GET /config endpoint
│   ├── Dockerfile                      # Backend container (Python 3.11 + Uvicorn)
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment variables template
│   └── .gitignore
│
├── docker-compose.yml                  # Orchestrates MongoDB, backend, frontend
├── deploy.sh                           # Deployment script (up/down/logs/clean)
├── setup.sh                            # Local development setup
├── README.md                           # Comprehensive documentation
├── ARCHITECTURE.md                     # This file
└── .gitignore
```

## Component Architecture

### Frontend

#### GameCanvas Component
- **Purpose**: Main game rendering and logic
- **Features**:
  - HTML5 Canvas rendering (60 FPS via requestAnimationFrame)
  - Target spawning at configurable intervals (800ms default)
  - Click detection for hit/miss calculation
  - Real-time HUD display (score, time, accuracy, shots)
  - 60-second countdown timer
  - End screen with final statistics
  - Backend session integration

- **State Management**:
  - `gameState`: UI state (score, hits, misses, etc.)
  - `gameRef`: Game loop state (targets, timing, counters)
  - Uses `usePlayer` hook for player identification
  - Calls API service for session lifecycle

#### Leaderboard Component
- **Purpose**: Display top 10 scores from backend
- **Features**:
  - Modal overlay UI
  - Real-time data fetching
  - Medal badges for top 3
  - Responsive table layout
  - Loading and empty states

#### usePlayer Hook
- **Purpose**: Persistent player identification
- **Features**:
  - Generates unique player ID (timestamp + random string)
  - Stores player data in localStorage
  - Persists across sessions

#### API Service
- **Purpose**: Frontend-to-backend communication
- **Endpoints**:
  - `createSession(playerId, playerName)` → POST /sessions/start
  - `endSession(...)` → POST /sessions/end
  - `getSession(sessionId)` → GET /sessions/{id}
  - `getLeaderboard(limit)` → GET /leaderboard/top
  - `getPlayerScores(playerId, limit)` → GET /leaderboard/player/{id}
  - `getGameConfig()` → GET /config/game
  - `checkHealth()` → GET /health

- **Error Handling**: Graceful fallbacks if backend is down
  - Demo mode session IDs generated locally
  - Empty leaderboard if fetch fails
  - Default game config if fetch fails

### Backend

#### FastAPI Application (main.py)
```python
# Lifespan events
- Startup: Connect to MongoDB, create indexes
- Shutdown: Close MongoDB connection

# Routers
- /sessions/* → sessions.py
- /leaderboard/* → leaderboard.py
- /config/* → config.py

# Middleware
- CORS: Allow all origins (configure for production)

# Endpoints
- GET /health → Health check with DB status
- GET / → API info
```

#### Database Connection (database.py)
- **MongoDB Setup**:
  - Collections: `sessions`, `leaderboard`
  - Indexes: session lookup, leaderboard scoring
  - Connection pooling and timeout handling
  - Demo mode fallback if MongoDB unavailable

#### Pydantic Models (models.py)
```python
# Request Schemas
- GameSessionCreate: player_id, player_name
- GameSessionEnd: session_id, score, accuracy, hits, misses, shots_taken

# Response Schemas
- GameSession: Full session data
- LeaderboardEntry: Ranked score entry
- GameConfig: Game settings
- HealthResponse: Health status

# Validation
- Type checking
- Range validation (accuracy 0-100, negative prevention)
- Required/optional field handling
```

#### Routes

**Sessions (sessions.py)**
- `POST /sessions/start` → Create session, return ID
- `POST /sessions/end` → Save stats, add to leaderboard
- `GET /sessions/{session_id}` → Retrieve session details

**Leaderboard (leaderboard.py)**
- `GET /leaderboard/top?limit=10` → Top scores globally
- `GET /leaderboard/player/{player_id}?limit=10` → Player's personal scores

**Config (config.py)**
- `GET /config/game` → Get game settings
  - target_spawn_rate (800ms)
  - target_size (30px)
  - game_duration (60s)
  - max_targets_on_screen (5)

## Game Loop Architecture

### Canvas Render Loop
```
requestAnimationFrame(gameLoop)
│
├─ Clear canvas (black background)
├─ Draw all targets (circles + crosshairs)
│  └─ Apply fade effect based on age
├─ Spawn new targets (if active, interval reached)
└─ Request next frame (60 FPS)
```

### Game State Machine
```
INITIAL
  ↓ [START GAME clicked]
  ├─ Create session on backend
  ├─ Reset game state
  ├─ Start timer (60s countdown)
  └─ Start render loop
  ↓
ACTIVE PLAY
  ├─ Constantly spawn targets
  ├─ Listen for clicks
  ├─ Detect hits/misses
  ├─ Update score in real-time
  └─ Update HUD
  ↓ [Timer reaches 0]
GAME OVER
  ├─ Stop render loop
  ├─ Stop spawning targets
  ├─ Save session to backend
  ├─ Add to leaderboard
  └─ Display end screen
  ↓ [PLAY AGAIN clicked]
  └─ Return to INITIAL
```

## Data Flow

### Session Lifecycle
```
1. Player clicks START
   ↓
2. Frontend calls POST /sessions/start
   ↓
3. Backend creates session document in MongoDB
   {"_id": ObjectId, "player_id": "...", "created_at": ...}
   ↓
4. Backend returns session_id
   ↓
5. Frontend stores session_id in memory
   ↓
6. Game plays for 60 seconds
   ↓
7. Timer ends, game stops
   ↓
8. Frontend calls POST /sessions/end with stats
   ↓
9. Backend updates session: score, accuracy, hits, misses, ended_at
   ↓
10. Backend inserts leaderboard entry (denormalized for fast queries)
    ↓
11. Frontend shows end screen with final stats
    ↓
12. Player can view leaderboard (calls GET /leaderboard/top)
```

## Performance Considerations

### Canvas Optimization
- **60 FPS Target**: Use requestAnimationFrame (syncs with display refresh)
- **Target Pool**: Targets removed after 2.5s automatically
- **Minimal Redraws**: Full canvas clear and redraw each frame (standard approach)
- **No Complex Shadows**: Keep rendering simple for performance

### Backend Optimization
- **Indexes**: Sessions by player_id, leaderboard by score (descending)
- **Pagination**: Leaderboard limited to 10 entries by default
- **Connection Pooling**: MongoDB driver handles this automatically
- **Stateless API**: Each request is independent (easy scaling)

## Security Considerations

### Frontend
- **No Sensitive Data**: Player ID is public-facing UUID
- **CORS**: Relies on backend CORS config
- **Input Validation**: Basic player name length check

### Backend
- **Input Validation**: Pydantic enforces types and ranges
- **SQL Injection**: N/A (MongoDB with native driver, not string queries)
- **CORS**: Configured to allow all origins (configure restrictively for production)
- **Rate Limiting**: Not implemented (add if public-facing)

## Deployment Architecture

### Docker Compose Setup
```
MongoDB (Port 27017)
   ↓ (internal network)
Backend (Port 8000)
   ↓ (internal network + REST API)
Frontend (Port 3000)
```

### Container Details
- **Frontend**: Node 18 Alpine + Vite build + serve
- **Backend**: Python 3.11 Slim + Uvicorn
- **MongoDB**: Official mongo:7.0 image
- **Network**: Bridge network (`aim-trainer-network`)

### Health Checks
- MongoDB: `mongosh --eval "db.adminCommand('ping')"`
- Backend: HTTP GET /health
- Frontend: HTTP GET on port 3000

## API Response Examples

### Create Session
```json
// POST /sessions/start
{
  "session_id": "507f1f77bcf86cd799439011",
  "player_id": "player_123456",
  "player_name": "John Doe",
  "status": "started"
}
```

### End Session
```json
// POST /sessions/end
{
  "session_id": "507f1f77bcf86cd799439011",
  "status": "completed",
  "score": 45
}
```

### Get Leaderboard
```json
// GET /leaderboard/top
{
  "entries": [
    {
      "rank": 1,
      "player_name": "ProGamer",
      "score": 82,
      "accuracy": 94.1,
      "created_at": "2024-04-09T15:30:00"
    },
    ...
  ],
  "total": 10
}
```

## Configuration Files

### Environment Variables (.env)
```
# Backend
MONGODB_URL=mongodb://mongodb:27017
DB_NAME=aim_trainer
API_HOST=0.0.0.0
API_PORT=8000

# Frontend (in vite.config.js)
REACT_APP_API_URL=http://localhost:8000
```

### Game Settings (backend/app/routes/config.py)
Edit the `return GameConfig(...)` to adjust gameplay:
- `target_spawn_rate`: milliseconds between new targets
- `target_size`: radius in pixels
- `game_duration`: total game length in seconds
- `max_targets_on_screen`: concurrent targets limit

## Testing Checklist

- [ ] Canvas renders without lag at 60 FPS
- [ ] Targets spawn at regular intervals
- [ ] Click detection works accurately
- [ ] Rapid clicking registers all shots
- [ ] Timer counts down consistently
- [ ] Accuracy calculation is correct: (hits / shots) * 100
- [ ] End screen appears when timer reaches 0
- [ ] Session saves to MongoDB successfully
- [ ] Leaderboard displays top scores
- [ ] Mobile responsive (targets clickable on touch)
- [ ] Responsive design works on 800x600, 1920x1080, mobile
- [ ] Backend health check works
- [ ] Demo mode works if MongoDB unavailable

---

**Last Updated**: April 2026
**Version**: 1.0.0
