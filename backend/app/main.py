import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.game_engine import game_engine
import asyncio
import json
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    asyncio.create_task(game_engine.run_loop(broadcast_game_state))
    yield
    # Shutdown logic
    game_engine.is_running = False

# Initialize FastAPI app with lifespan
app = FastAPI(title="Wuaicot Ruleta API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://wuaicot-ruleta-n2qj-theta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.on("join_game")
async def handle_join(sid, data):
    print(f"Player joining: {sid}")
    if data:
        await handle_client_data(sid, data)

@sio.on("client_data")
async def handle_client_data(sid, data):
    try:
        if isinstance(data, str):
            data = json.loads(data)
        
        player_id = data.get("playerId")
        if player_id:
            game_engine.update_player_data(player_id, data)
        else:
            # If no ID, we might want to assign one or ignore
            pass
    except Exception as e:
        print(f"Error handling client data from {sid}: {e}")

async def broadcast_game_state(state: dict):
    await sio.emit("stage_change", json.dumps(state))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8888)
