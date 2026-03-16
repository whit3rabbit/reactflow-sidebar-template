import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type XYPosition,
} from '@xyflow/react';
import { Plus, Sparkles, Wand2 } from 'lucide-react';
import { useTheme } from './DarkModeProvider';
import { NodesSidebar } from './components/NodesSidebar';
import BasicNode from './components/nodes/BasicNode';
import InputNode from './components/nodes/InputNode';
import OutputNode from './components/nodes/OutputNode';
import DecisionNode from './components/nodes/DecisionNode';
import DataNode from './components/nodes/DataNode';
import ProcessingNode from './components/nodes/ProcessingNode';
import {
  buildNodeData,
  isNodeType,
  type EditableNodeField,
  type FlowNodeData,
  type NodeType,
} from './lib/nodeCatalog';

const nodeTypes = {
  basic: BasicNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  data: DataNode,
  processing: ProcessingNode,
};

const initialNodes: Node<FlowNodeData>[] = [];
const initialEdges: Edge[] = [];

const createNodeId = (type: NodeType) =>
  `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const createStarterFlow = (): { nodes: Node<FlowNodeData>[]; edges: Edge[] } => ({
  nodes: [
    {
      id: 'input-brief',
      type: 'input',
      position: { x: 40, y: 180 },
      data: buildNodeData('input', {
        title: 'Campaign Brief',
        description: 'Define audience, goal, and constraints before the flow branches.',
        inputValue: 'Audience: product founders\nGoal: homepage refresh\nTone: confident and clear',
      }),
    },
    {
      id: 'processing-angle',
      type: 'processing',
      position: { x: 320, y: 180 },
      data: buildNodeData('processing', {
        title: 'Generate Directions',
        description: 'Expand the brief into differentiated layout and messaging directions.',
        process: 'Create three directions: editorial, dashboard-inspired, and minimal.',
      }),
    },
    {
      id: 'decision-review',
      type: 'decision',
      position: { x: 620, y: 180 },
      data: buildNodeData('decision', {
        title: 'Review Direction',
        description: 'Only move forward when hierarchy, contrast, and responsiveness hold up.',
        condition: 'Design review score >= 8/10',
      }),
    },
    {
      id: 'data-system',
      type: 'data',
      position: { x: 920, y: 80 },
      data: buildNodeData('data', {
        title: 'Design Tokens',
        description: 'Capture palette, spacing, and motion rules once a direction is approved.',
        content: '{\n  "theme": "ocean",\n  "radius": "20px",\n  "density": "comfortable"\n}',
      }),
    },
    {
      id: 'output-handoff',
      type: 'output',
      position: { x: 920, y: 280 },
      data: buildNodeData('output', {
        title: 'Ship Handoff',
        description: 'Deliver a clear implementation summary when the approved system is ready.',
        outputValue: 'Updated shell, theme switcher, refined node cards, responsive layout.',
      }),
    },
  ],
  edges: [
    { id: 'e1', source: 'input-brief', target: 'processing-angle' },
    { id: 'e2', source: 'processing-angle', target: 'decision-review' },
    { id: 'e3', source: 'decision-review', sourceHandle: 'true', target: 'data-system' },
    { id: 'e4', source: 'decision-review', sourceHandle: 'false', target: 'output-handoff' },
    { id: 'e5', source: 'data-system', target: 'output-handoff' },
  ],
});

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { resolvedTheme, themePreset } = useTheme();

  const updateNodeData = useCallback(
    (nodeId: string, field: EditableNodeField, value: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [field]: value,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setEdges, setNodes]
  );

  const getDefaultPosition = useCallback((): XYPosition => {
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();

    if (!bounds) {
      return {
        x: 120 + (nodes.length % 3) * 48,
        y: 120 + (nodes.length % 4) * 72,
      };
    }

    return screenToFlowPosition({
      x: bounds.left + bounds.width * 0.55 + (nodes.length % 3) * 24,
      y: bounds.top + bounds.height * 0.34 + (nodes.length % 4) * 48,
    });
  }, [nodes.length, screenToFlowPosition]);

  const createNode = useCallback(
    (
      type: NodeType,
      position?: XYPosition,
      overrides: Partial<Omit<FlowNodeData, 'onChange' | 'onRemove'>> = {}
    ) => {
      const newNode: Node<FlowNodeData> = {
        id: createNodeId(type),
        type,
        position: position ?? getDefaultPosition(),
        data: buildNodeData(type, overrides),
      };

      setNodes((currentNodes) => currentNodes.concat(newNode));
    },
    [getDefaultPosition, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          currentEdges
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !isNodeType(type)) {
        return;
      }

      createNode(
        type,
        screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      );
    },
    [createNode, screenToFlowPosition]
  );

  const loadStarterFlow = useCallback(() => {
    const starterFlow = createStarterFlow();
    setNodes(starterFlow.nodes);
    setEdges(starterFlow.edges);

    requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 500 });
    });
  }, [fitView, setEdges, setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setEdges, setNodes]);

  const displayNodes: Node<FlowNodeData>[] = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onRemove: () => removeNode(node.id),
      onChange: (value, field) => updateNodeData(node.id, field, value),
    },
  }));

  const gridColorMap = {
    graphite: resolvedTheme === 'dark' ? 'rgba(125, 211, 252, 0.15)' : 'rgba(99, 102, 241, 0.14)',
    ocean: resolvedTheme === 'dark' ? 'rgba(45, 212, 191, 0.18)' : 'rgba(20, 184, 166, 0.16)',
    ember: resolvedTheme === 'dark' ? 'rgba(251, 146, 60, 0.18)' : 'rgba(249, 115, 22, 0.18)',
  } as const;

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />

      <NodesSidebar
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onAddNode={createNode}
        onLoadStarterFlow={loadStarterFlow}
        onClearCanvas={clearCanvas}
      />

      <main className="canvas-shell">
        <header className="canvas-topbar">
          <div>
            <div className="canvas-topbar__eyebrow">
              <Wand2 size={14} />
              Visual editor
            </div>
            <h2 className="canvas-topbar__title">Build flows with clearer hierarchy and better defaults.</h2>
            <p className="canvas-topbar__copy">
              The old layout worked like a demo. This one behaves more like a workspace.
            </p>
          </div>
          <div className="canvas-topbar__actions">
            <button type="button" className="toolbar-button toolbar-button--primary" onClick={loadStarterFlow}>
              <Sparkles size={16} />
              Starter flow
            </button>
            <button type="button" className="toolbar-button" onClick={() => createNode('basic')}>
              <Plus size={16} />
              Add node
            </button>
          </div>
        </header>

        <div className="flow-stage" ref={reactFlowWrapper}>
          <div className="flow-stage__veil" />
          <ReactFlow
            nodes={displayNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            colorMode={resolvedTheme}
            defaultEdgeOptions={{
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
            className="theme-attribution"
          >
            <Controls className="flow-controls" />
            <MiniMap
              pannable
              zoomable
              className="flow-minimap"
              style={{
                backgroundColor: 'hsl(var(--popover) / 0.88)',
              }}
              maskColor={resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.68)' : 'rgba(241, 245, 249, 0.78)'}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.4}
              color={gridColorMap[themePreset]}
            />
          </ReactFlow>

          {nodes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__badge">Empty canvas</div>
              <h3>Start with a starter flow or drop a node onto the board.</h3>
              <p>
                The previous UI gave you a blank screen with very little guidance. This one keeps the board empty
                by default, but it no longer leaves the user guessing.
              </p>
              <div className="empty-state__actions">
                <button type="button" className="toolbar-button toolbar-button--primary" onClick={loadStarterFlow}>
                  <Sparkles size={16} />
                  Load starter flow
                </button>
                <button type="button" className="toolbar-button" onClick={() => createNode('input')}>
                  <Plus size={16} />
                  Add input node
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
