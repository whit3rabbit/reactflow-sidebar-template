import { debounce } from 'lodash';

export const debouncedSendUpdate = debounce((sendFlowUpdate, flowData) => {
  sendFlowUpdate(flowData);
}, 500);

export const retryWebSocketConnection = (initializeWebSocketConnection) => {
  return setTimeout(() => {
    console.log('Retrying WebSocket connection...');
    initializeWebSocketConnection();
  }, 5000);
};