import { useCallback, useEffect, useRef } from 'react';
import { initializeWebSocket, sendFlowUpdate } from '../services/api';
import { WEBSOCKET_URL } from '../config/constants';

export const useWebSocket = (onUpdate) => {
  const websocketRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  const retryWebSocketConnection = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    retryTimeoutRef.current = setTimeout(() => {
      console.log('Retrying WebSocket connection...');
      initializeWebSocketConnection();
    }, 5000); // Retry after 5 seconds
  }, []);

  const initializeWebSocketConnection = useCallback(async () => {
    try {
      websocketRef.current = await initializeWebSocket(onUpdate);

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        retryWebSocketConnection();
      };

      websocketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        retryWebSocketConnection();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      retryWebSocketConnection();
    }
  }, [onUpdate, retryWebSocketConnection]);

  useEffect(() => {
    initializeWebSocketConnection();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [initializeWebSocketConnection]);

  const sendUpdate = useCallback((flowData) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      sendFlowUpdate(flowData);
    } else {
      console.warn('WebSocket is not open. Update not sent.');
    }
  }, []);

  return { sendUpdate };
};