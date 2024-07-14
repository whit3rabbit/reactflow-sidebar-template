import React, { useRef } from 'react';
import { ReactFlow, Controls, MiniMap, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'react-toastify';
import { useDarkMode } from '../../contexts/DarkModeProvider';
import { DEFAULT_VIEWPORT } from '../../config/constants';
import useFlowCanvas from './useFlowCanvas';
import nodeTypes from './nodeTypes';

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    isLayouting,
    isLoading,
    validationErrors,
    error,
    handleSaveFlow,
    handleLoadFlow,
    handleValidateFlow,
    onLayout,
  } = useFlowCanvas();

  const reactFlowWrapper = useRef(null);
  const { isDarkMode } = useDarkMode();

  return (
    <div className="w-full h-full bg-background" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultViewport={DEFAULT_VIEWPORT}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
      >
        <Controls className="bg-background text-foreground" />
        <MiniMap className="bg-background" />
        <Background
          variant="dots"
          gap={20}
          size={1}
          color={isDarkMode ? '#4a5568' : '#e2e8f0'}
        />
      </ReactFlow>
      <div className="absolute top-4 right-4 space-x-2">
        <button 
          onClick={onLayout} 
          disabled={isLayouting || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLayouting ? 'Layouting...' : 'Auto Layout'}
        </button>
        <button 
          onClick={handleSaveFlow}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Flow'}
        </button>
        <button 
          onClick={handleLoadFlow}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Load Flow'}
        </button>
        <button 
          onClick={handleValidateFlow}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Validating...' : 'Validate Flow'}
        </button>
      </div>
      {validationErrors.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <strong className="font-bold">Validation Errors:</strong>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <strong className="font-bold">Error:</strong>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;