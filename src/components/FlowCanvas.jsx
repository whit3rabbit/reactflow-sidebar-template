import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';

// Import node components
import BasicNode from './nodes/BasicNode';
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import ProcessingNode from './nodes/ProcessingNode';
import DecisionNode from './nodes/DecisionNode';
import DataNode from './nodes/DataNode';

const nodeTypes = {
  basicNode: BasicNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  processingNode: ProcessingNode,
  decisionNode: DecisionNode,
  dataNode: DataNode,
};

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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, getZoom } = useReactFlow();
  const [isLayouting, setIsLayouting] = useState(false);

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
        fitView();
        setIsLayouting(false);
      });
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const onNodeRemove = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

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
  
      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };
  
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          onChange: (value, field) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === newNode.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      [field]: value,
                    },
                  };
                }
                return node;
              })
            );
          },
          onRemove: () => onNodeRemove(newNode.id),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      setTimeout(() => {
        const zoom = getZoom();
        fitView({ padding: 0.2, minZoom: zoom, maxZoom: zoom });
      }, 0);
    },
    [setNodes, onNodeRemove, fitView, getZoom]
  );

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
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={1}
        fitViewOptions={{ padding: 0.2 }}
        className="w-full h-full"
      >
        <Controls className="bg-background text-foreground" />
        <MiniMap className="bg-background" />
        <Background variant="dots" gap={12} size={1} className="bg-muted" />
      </ReactFlow>
      <div className="absolute top-4 right-4">
        <button 
          onClick={onLayout} 
          disabled={isLayouting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLayouting ? 'Layouting...' : 'Auto Layout'}
        </button>
      </div>
    </div>
  );
};

export default FlowCanvas;