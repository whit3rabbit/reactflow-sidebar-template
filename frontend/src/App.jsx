import React from 'react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex w-screen h-screen bg-background text-foreground" style={{ width: '100vw', height: '100vh' }}>
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <FlowCanvas />
        </div>
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;