import React from 'react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';

function App() {
  return (
    <div className="flex w-screen h-screen bg-background text-foreground" style={{ width: '100vw', height: '100vh' }}>
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <FlowCanvas />
      </div>
    </div>
  );
}

export default App;
