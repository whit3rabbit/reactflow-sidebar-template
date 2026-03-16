import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
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
import { isNodeType, type NodeType } from './lib/nodeCatalog';
import { useFlowStore } from './store/flowStore';

const nodeTypes = {
  basic: BasicNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  data: DataNode,
  processing: ProcessingNode,
};

function AppContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { resolvedTheme, themePreset } = useTheme();

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);
  const storeLoadStarterFlow = useFlowStore((s) => s.loadStarterFlow);
  const clearCanvas = useFlowStore((s) => s.clearCanvas);

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
    (type: NodeType, position?: XYPosition) => {
      addNode(type, position ?? getDefaultPosition());
    },
    [addNode, getDefaultPosition]
  );

  const loadStarterFlow = useCallback(() => {
    storeLoadStarterFlow();
    requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 500 });
    });
  }, [fitView, storeLoadStarterFlow]);

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
        onAddNode={createNode}
        onLoadStarterFlow={loadStarterFlow}
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
            <div className="canvas-topbar__shortcuts">
              <div className="shortcut-item">
                <span className="shortcut-key">Del</span>
                <span className="shortcut-key">&#x232B;</span>
                <span>Delete selected</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Space</span>
                <span>Drag canvas</span>
              </div>
            </div>
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
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            colorMode={resolvedTheme}
            deleteKeyCode={['Backspace', 'Delete']}
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
              gap={24}
              size={1.2}
              color={gridColorMap[themePreset]}
              style={{ opacity: 0.6 }}
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

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
