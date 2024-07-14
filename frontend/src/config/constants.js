export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 0.5 };

export const ELK_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
};