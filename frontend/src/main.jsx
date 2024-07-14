import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css'   // Base styles, resets, etc.
import './styles/global.css' // Your global styles and Tailwind directives
import { ReactFlowProvider } from '@xyflow/react';
import { DarkModeProvider } from './contexts/DarkModeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <DarkModeProvider>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </DarkModeProvider>
  </React.StrictMode>,
);