import axios from 'axios';
import { debounce } from 'lodash';
import { validateIPAddress, validateMACAddress, validatePassword } from './validation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

console.log('API_BASE_URL:', API_BASE_URL);
console.log('WEBSOCKET_URL:', WEBSOCKET_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveFlow = async (flowData) => {
  try {
    const response = await api.post('/flow', flowData);
    return response.data;
  } catch (error) {
    console.error('Error saving flow:', error);
    throw error;
  }
};

export const loadFlow = async (flowId) => {
  try {
    const response = await api.get(`/flow/${flowId}`);
    return response.data;
  } catch (error) {
    console.error('Error loading flow:', error);
    throw error;
  }
};

export const validateFlow = async (flowData) => {
  try {
    const response = await api.post('/validate', flowData);
    return response.data;
  } catch (error) {
    console.error('Error validating flow:', error);
    throw error;
  }
};

let socket = null;
let keepAliveInterval = null;

export const initializeWebSocket = (onUpdate) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;  // Return existing connection if it's open
  }

  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('WebSocket connected');
    // Start keep-alive ping
    keepAliveInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);  // Send a ping every 30 seconds
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'pong') {
      console.log('Received pong from server');
    } else {
      onUpdate(data);
    }
  };

  socket.onclose = (event) => {
    console.log('WebSocket disconnected:', event.reason);
    clearInterval(keepAliveInterval);
    socket = null;
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return socket;
};

let lastSentUpdate = null;
let DEBUG = import.meta.env.VITE_DEBUG || false;

const debouncedSendUpdate = debounce((flowData) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'flowUpdate', data: flowData }));
  } else {
    console.error('WebSocket is not open. Cannot send flow update.');
  }
}, 300); // 300ms debounce time, adjust as needed

export const sendFlowUpdate = (flowData) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = initializeWebSocket(() => {});  // Reinitialize if not connected
  }
  if (socket.readyState === WebSocket.OPEN) {
    const updateString = JSON.stringify(flowData);
    if (updateString !== lastSentUpdate) {
      debouncedSendUpdate(flowData);
      lastSentUpdate = updateString;
      if (DEBUG) console.log('Sent flow update:', flowData);
    } else {
      if (DEBUG) console.log('Skipped duplicate update');
    }
  } else {
    console.error('WebSocket is not open. Cannot send flow update.');
  }
};
