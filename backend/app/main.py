# backend/app/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "ws://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for flows (replace with a database in a real application)
flows = {}

class Flow(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.post("/api/flow")
async def save_flow(flow: Flow):
    # In a real app, you'd save this to a database
    flows["current"] = flow.dict()
    return {"message": "Flow saved successfully"}

@app.get("/api/flow/{flow_id}")
async def load_flow(flow_id: str):
    if flow_id not in flows:
        return {"error": "Flow not found"}
    return flows[flow_id]

@app.post("/api/validate")
async def validate_flow(flow: Flow):
    # Implement your validation logic here
    # This is a simple example that always returns success
    return {"errors": []}

# WebSocket endpoint
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logging.info(f"WebSocket connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logging.info(f"WebSocket disconnected: {websocket.client}")

    async def send_json(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get('type') == 'ping':
                await websocket.send_json({'type': 'pong'})
            elif data.get('type') == 'flowUpdate':
                # Process flow update
                await manager.broadcast(data)
            else:
                # Handle other message types
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)