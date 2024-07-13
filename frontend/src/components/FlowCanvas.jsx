import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { toast } from 'react-toastify';
import useFlowStore from '../store/flowStore';
import { saveFlow, loadFlow, validateFlow, initializeWebSocket, sendFlowUpdate } from '../services/api';
import { debounce } from 'lodash';
import { useDarkMode } from '../DarkModeProvider';

// Import your custom node types
import BasicNode from './nodes/BasicNode';
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import ProcessingNode from './nodes/ProcessingNode';
import DecisionNode from './nodes/DecisionNode';
import DataNode from './nodes/DataNode';
import IPAddressNode from './nodes/IPAddressNode';
import MACAddressNode from './nodes/MACAddressNode';
import PasswordNode from './nodes/PasswordNode';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: 250,
      height: 100,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

const FlowCanvas = () => {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode,
    removeNode,
    updateNode,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useFlowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  const [isLayouting, setIsLayouting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const { reactFlowInstance, fitView, getViewport } = useReactFlow();
  const websocketRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const { isDarkMode } = useDarkMode();
  const defaultViewport = { x: 0, y: 0, zoom: 0.5 };

  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onLayout = useCallback(() => {
    setIsLayouting(true);
    getLayoutedElements(nodes, edges, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      window.requestAnimationFrame(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 200 });
        setIsLayouting(false);
      });
    });
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  const onNodeRemove = useCallback(
    (id) => {
      removeNode(id);
      setNodes((nds) => nds.filter((node) => node.id !== id));
    },
    [removeNode, setNodes]
  );

  const onNodeChange = useCallback(
    (id, newData) => {
      updateNode(id, newData);
      setNodes((nds) =>
        nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node))
      );
    },
    [updateNode, setNodes]
  );

  const nodeTypes = useMemo(
    () => ({
      basicNode: (props) => (
        <BasicNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      inputNode: (props) => (
        <InputNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      outputNode: (props) => (
        <OutputNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      processingNode: (props) => (
        <ProcessingNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      decisionNode: (props) => (
        <DecisionNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      dataNode: (props) => (
        <DataNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      ipAddressNode: (props) => (
        <IPAddressNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      macAddressNode: (props) => (
        <MACAddressNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
      passwordNode: (props) => (
        <PasswordNode
          {...props}
          data={{
            ...props.data,
            onRemove: onNodeRemove,
            onNodeChange: onNodeChange,
          }}
        />
      ),
    }),
    [onNodeRemove, onNodeChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      let position = { x: 0, y: 0 };

      if (reactFlowInstance && typeof reactFlowInstance.project === 'function') {
        position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      } else {
        position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
      }

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} node`,
          timestamp: Date.now(),
        },
      };

      addNode(newNode);
      setNodes((nds) => [...nds, newNode]);

      // Use the current zoom level as a basis for the new zoom
      setTimeout(() => {
        const { zoom: currentZoom } = getViewport();
        const newZoom = Math.max(currentZoom * 0.8, 0.2); // Increased zoom-out
        
        fitView({ 
          padding: 0.2, 
          minZoom: newZoom,
          maxZoom: Math.max(currentZoom, 1.1),
          duration: 800 
        });
      }, 50);
    },
    [reactFlowInstance, addNode, setNodes, fitView, getViewport]
  );

  const handleSaveFlow = useCallback(async () => {
    try {
      setIsLoading(true);
      await saveFlow({ nodes, edges });
      toast.success('Flow saved successfully');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, setIsLoading, setError]);

  const handleLoadFlow = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedFlow = await loadFlow('current');
      setNodes(loadedFlow.nodes || []);
      setEdges(loadedFlow.edges || []);
      fitView({ padding: 0.2, duration: 200 });
      toast.success('Flow loaded successfully');
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Failed to load flow');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges, fitView, setIsLoading, setError]);

  const handleValidateFlow = useCallback(async () => {
    try {
      setIsLoading(true);
      const validationResult = await validateFlow({ nodes, edges });
      setValidationErrors(validationResult.errors || []);
      if (validationResult.errors.length === 0) {
        toast.success('Flow validation passed');
      } else {
        toast.warn('Flow validation failed');
      }
    } catch (error) {
      console.error('Error validating flow:', error);
      toast.error('Error during flow validation');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, setIsLoading, setError]);

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
      const handleUpdate = (data) => {
        console.log('Received update:', data);
        if (data.type === 'flowUpdate') {
          setNodes(data.data.nodes || []);
          setEdges(data.data.edges || []);
        }
      };
  
      websocketRef.current = await initializeWebSocket(handleUpdate);
  
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
  
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [setNodes, setEdges, retryWebSocketConnection]);
  
  useEffect(() => {
    initializeWebSocketConnection();
  }, [initializeWebSocketConnection]);

  const debouncedSendUpdate = useCallback(
    debounce((flowData) => {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        sendFlowUpdate(flowData);
      } else {
        console.warn('WebSocket is not open. Update not sent.');
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSendUpdate({ nodes, edges });
    return () => debouncedSendUpdate.cancel();
  }, [nodes, edges, debouncedSendUpdate]);

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
        defaultViewport={defaultViewport}
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