import axios from 'axios';
import { debounce } from 'lodash';
import { validateIPAddress, validateMACAddress, validatePassword } from './validation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('WEBSOCKET_URL:', WEBSOCKET_URL);

// Axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// WebSocket related variables
let socket = null;
let keepAliveInterval = null;
let lastSentUpdate = null;

// API functions
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

// WebSocket functions
export const initializeWebSocket = (onUpdate) => {
  return new Promise((resolve, reject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      resolve(socket);
      return;
    }

    socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('WebSocket connected');
      startKeepAlive();
      resolve(socket);
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
      reject(error);
    };
  });
};

const startKeepAlive = () => {
  keepAliveInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);  // Send a ping every 30 seconds
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
};

const debouncedSendUpdate = debounce((flowData) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'flowUpdate', data: flowData }));
  } else {
    console.error('WebSocket is not open. Cannot send flow update.');
  }
}, 300); // 300ms debounce time

export const sendFlowUpdate = (flowData) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not open. Cannot send flow update.');
    return;
  }

  const updateString = JSON.stringify(flowData);
  if (updateString !== lastSentUpdate) {
    debouncedSendUpdate(flowData);
    lastSentUpdate = updateString;
    if (DEBUG) console.log('Sent flow update:', flowData);
  } else {
    if (DEBUG) console.log('Skipped duplicate update');
  }
};

export { validateIPAddress, validateMACAddress, validatePassword };