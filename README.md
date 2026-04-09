# Aim Trainer 🎯

A browser-based shooting practice game built with React, FastAPI, and MongoDB. Practice your aim and reflexes with randomly spawning targets. Track your scores on a global leaderboard.

## Features

- **Real-time Gameplay**: Canvas-based rendering for smooth 60FPS gameplay
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Scoring System**: Track hits, misses, and accuracy percentage
- **Leaderboard**: View top scores from all players
- **Session Tracking**: Save and track all your game sessions
- **Configurable Gameplay**: Adjust target spawn rates and game duration from backend
- **Full Stack**: Complete frontend, backend, and database integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, HTML5 Canvas, Vite |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | MongoDB 7.0 |
| **Deployment** | Docker & Docker Compose |

## Project Structure

```
aim-trainer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.jsx       # Main game component
│   │   │   └── GameCanvas.css       # Game styling
│   │   ├── App.jsx                   # Root component
│   │   ├── App.css                   # App styling
│   │   └── index.jsx                 # Entry point
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile                    # Frontend container
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI application
│   │   ├── database.py               # MongoDB connection
│   │   ├── models.py                 # Pydantic schemas
│   │   └── routes/
│   │       ├── sessions.py           # Game session APIs
│   │       ├── leaderboard.py        # Leaderboard APIs
│   │       └── config.py             # Configuration APIs
│   ├── Dockerfile                    # Backend container
│   ├── requirements.txt              # Python dependencies
│   └── .env.example
├── docker-compose.yml                # Multi-container orchestration
├── deploy.sh                         # Deployment script
└── README.md
```

## Installation & Setup

### Prerequisites

- Docker & Docker Compose (recommended) OR
- Node.js 18+ and Python 3.11+
- MongoDB 7.0+

### Option 1: Docker (Recommended)

The easiest way to run the entire application:

```bash
# Built and start all services
chmod +x deploy.sh
./deploy.sh up

# Or with docker-compose directly
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

### Option 2: Local Development

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start MongoDB (ensure it's running)
# On macOS with Homebrew: brew services start mongodb-community
# Or use Docker: docker run -d -p 27017:27017 mongo:7.0

# Run backend
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

## Gameplay Instructions

1. Click **START GAME** to begin
2. Targets appear randomly on screen (green circles with crosshairs)
3. **Click on targets** to hit them (score +1)
4. Each target disappears after ~2.5 seconds if not clicked
5. **60 seconds** to get as many hits as possible
6. Game ends automatically when timer reaches 0
7. View your **Final Score, Accuracy, Hits/Misses**
8. Click **PLAY AGAIN** to restart

## API Endpoints

### Sessions

```http
POST /sessions/start
Content-Type: application/json

{
  "player_id": "player123",
  "player_name": "John Doe"
}

Response:
{
  "session_id": "507f1f77bcf86cd799439011",
  "player_id": "player123",
  "player_name": "John Doe",
  "status": "started"
}
```

```http
POST /sessions/end
{
  "session_id": "507f1f77bcf86cd799439011",
  "score": 45,
  "accuracy": 85.7,
  "hits": 42,
  "misses": 7,
  "shots_taken": 49
}
```

```http
GET /sessions/{session_id}
```

### Leaderboard

```http
GET /leaderboard/top?limit=10
```

```http
GET /leaderboard/player/{player_id}?limit=10
```

### Configuration

```http
GET /config/game
```

### Health

```http
GET /health
```

## Environment Variables

### Backend (.env)

```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=aim_trainer
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (vite.config.js)

```javascript
REACT_APP_API_URL=http://localhost:8000
```

## Deployment Commands

Using the `deploy.sh` script:

```bash
# Start services
./deploy.sh up

# Stop services
./deploy.sh down

# Restart services
./deploy.sh restart

# View logs
./deploy.sh logs

# Clean up (remove volumes)
./deploy.sh clean

# Check status
./deploy.sh status
```

Or with docker-compose directly:

```bash
# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Remove volumes
docker-compose down -v
```

## Game Configuration

Modify game settings by editing `backend/app/routes/config.py`:

```python
@router.get("/game", response_model=GameConfig)
def get_game_config():
    return GameConfig(
        target_spawn_rate=800,        # Milliseconds between spawns
        target_size=30,               # Radius in pixels
        game_duration=60,             # Duration in seconds
        max_targets_on_screen=5,      # Max concurrent targets
    )
```

## Performance

- **FPS**: 60 FPS (Canvas requestAnimationFrame)
- **Spawn Rate**: 800ms (configurable)
- **Target Lifetime**: 2500ms before auto-disappear
- **Accuracy Calculation**: (Hits / Total Shots) * 100%

## Testing

### Manual Testing

1. **Rapid Clicking**: Click multiple times quickly - should register all shots
2. **Screen Resize**: Resize browser - canvas should adapt
3. **Mobile**: Test on mobile device - touch targets should work
4. **Game End**: Verify end screen appears when timer reaches 0
5. **Leaderboard**: Play multiple games and check leaderboard updates

### API Testing

Use the interactive docs at http://localhost:8000/docs (Swagger UI)

## Troubleshooting

### MongoDB Connection Error

If backend shows "Could not connect to MongoDB":
- Ensure MongoDB is running: `docker-compose logs mongodb`
- Check connection string in `.env`
- Backend will run in **demo mode** without database

### Frontend Not Loading

- Clear browser cache (Ctrl+Shift+Delete)
- Check frontend logs: `docker-compose logs frontend`
- Verify port 3000 is not in use

### Docker Build Fails

```bash
# Clean up and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Future Enhancements

- [ ] Multiplayer mode
- [ ] Custom game modes (timed, endless, difficulty levels)
- [ ] Sound effects and music
- [ ] Player profiles and authentication
- [ ] Achievements and badges
- [ ] Replay system
- [ ] Advanced analytics and stats

## License

MIT License

## Author

AI-Assisted Development - Claude Code

---

**Need help?** Check `/help` or visit the project repository.
