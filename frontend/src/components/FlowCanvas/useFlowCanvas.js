import { useCallback, useEffect, useRef, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { toast } from 'react-toastify';
import useFlowStore from '../../store/flowStore';
import { saveFlow, loadFlow, validateFlow, initializeWebSocket, sendFlowUpdate } from '../../services/api';
import { getLayoutedElements } from '../../utils/helpers';
import { ELK_OPTIONS } from '../../config/constants';
import { onDrop, onDragOver } from './eventHandlers';
import { debouncedSendUpdate, retryWebSocketConnection } from './utils';

const elkInstance = new ELK();

const useFlowCanvas = () => {
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
    getLayoutedElements(nodes, edges, elkInstance, ELK_OPTIONS).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 200 });
        setIsLayouting(false);
      });
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

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
        retryWebSocketConnection(initializeWebSocketConnection);
      };
  
      websocketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        retryWebSocketConnection(initializeWebSocketConnection);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      retryWebSocketConnection(initializeWebSocketConnection);
    }
  
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [setNodes, setEdges]);
  
  useEffect(() => {
    initializeWebSocketConnection();
  }, [initializeWebSocketConnection]);

  useEffect(() => {
    debouncedSendUpdate(sendFlowUpdate, { nodes, edges });
    return () => debouncedSendUpdate.cancel();
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop: onDrop(reactFlowInstance, addNode, setNodes, fitView, getViewport),
    onDragOver,
    isLayouting,
    isLoading,
    validationErrors,
    error,
    handleSaveFlow,
    handleLoadFlow,
    handleValidateFlow,
    onLayout,
    onNodeRemove,
    onNodeChange,
  };
};

export default useFlowCanvas;