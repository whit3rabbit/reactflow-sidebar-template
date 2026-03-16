import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DarkModeProvider } from './DarkModeProvider.tsx';

import '@xyflow/react/dist/style.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </React.StrictMode>
); 