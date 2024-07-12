import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { toast } from 'react-toastify';
import useFlowStore from '../store/flowStore';
import { saveFlow, loadFlow, validateFlow, initializeWebSocket, sendFlowUpdate } from '../services/api';
import { debounce } from 'lodash';

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

  const [nodes, setNodes] = useState(storeNodes);
  const [edges, setEdges] = useState(storeEdges);

  const [isLayouting, setIsLayouting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const { fitView } = useReactFlow();
  const websocketRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onLayout = useCallback(() => {
    setIsLayouting(true);
    getLayoutedElements(nodes, edges, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 200 });
        setIsLayouting(false);
      });
    });
  }, [nodes, edges, fitView]);

  const onNodeRemove = useCallback(
    (id) => {
      removeNode(id);
      setNodes((nds) => nds.filter((node) => node.id !== id));
    },
    [removeNode]
  );

  const onNodeChange = useCallback(
    (id, newData) => {
      updateNode(id, newData);
      setNodes((nds) =>
        nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node))
      );
    },
    [updateNode]
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
      console.log('onDrop triggered');

      const type = event.dataTransfer.getData('application/reactflow');
      console.log('Node type:', type);
      if (typeof type === 'undefined' || !type) {
        console.log('Invalid node type, returning');
        return;
      }

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };
      console.log('Drop position:', position);

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} node`,
          timestamp: Date.now(),
        },
      };
      console.log('New node:', newNode);

      addNode(newNode);
      console.log('Node added to store');
      
      setNodes((nds) => [...nds, newNode]);
      console.log('Nodes updated in component state');

      // Adjust the fitView call to prevent excessive zooming
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 200, maxZoom: 1.5 });
        console.log('View fitted');
      }, 100);
    },
    [addNode, setNodes, fitView]
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

  const initializeWebSocketConnection = useCallback(() => {
    const handleUpdate = (data) => {
      console.log('Received update:', data);
      if (data.type === 'flowUpdate') {
        setNodes(data.data.nodes || []);
        setEdges(data.data.edges || []);
      }
    };

    websocketRef.current = initializeWebSocket(handleUpdate);

    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      retryWebSocketConnection();
    };

    websocketRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.reason);
      retryWebSocketConnection();
    };

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
    return initializeWebSocketConnection();
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
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Controls className="bg-background text-foreground" />
        <MiniMap className="bg-background" />
        <Background variant="dots" gap={12} size={1} className="bg-muted" />
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