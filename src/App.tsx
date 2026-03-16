import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
  type Connection,
} from '@xyflow/react';
import { LayoutGrid, Plus, Sparkles, Trash2, Undo2 } from 'lucide-react';
import { useTheme } from './DarkModeProvider';
import { NodesSidebar } from './components/NodesSidebar';
import BasicNode from './components/nodes/BasicNode';
import InputNode from './components/nodes/InputNode';
import OutputNode from './components/nodes/OutputNode';
import DecisionNode from './components/nodes/DecisionNode';
import DataNode from './components/nodes/DataNode';
import ProcessingNode from './components/nodes/ProcessingNode';
import DeletableEdge from './components/edges/DeletableEdge';
import { useFlowStore } from './store/flowStore';
import { useFlowDragDrop } from './hooks/useFlowDragDrop';
import { useFlowLayout } from './hooks/useFlowLayout';
import { getGridColor } from './lib/themeConfig';

const nodeTypes = {
  basic: BasicNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  data: DataNode,
  processing: ProcessingNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

const defaultEdgeOptions = {
  type: 'deletable',
  markerEnd: { type: MarkerType.ArrowClosed },
};

const minimapStyle = {
  backgroundColor: 'hsl(var(--popover) / 0.88)',
};

const backgroundStyle = { opacity: 0.6 };

function AppContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { resolvedTheme, themePreset } = useTheme();

  // Controlled mode: nodes/edges passed as props causes re-renders on every change.
  // Fine for small-to-medium graphs. For 100+ nodes, switch to uncontrolled mode
  // with onInit + instance methods. See: https://reactflow.dev/learn/advanced-use/uncontrolled-flow
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const undoLayout = useFlowStore((s) => s.undoLayout);
  const hasPreviousLayout = useFlowStore((s) => s.previousNodes !== null);
  const clearCanvas = useFlowStore((s) => s.clearCanvas);

  const { createNode, onDragOver, onDrop } = useFlowDragDrop(reactFlowWrapper);
  const { autoLayout, loadStarterFlow } = useFlowLayout();

  const isValidConnection = useCallback(
    (connection: Connection) => connection.source !== connection.target,
    []
  );

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />

      <NodesSidebar
        onAddNode={createNode}
        onLoadStarterFlow={loadStarterFlow}
      />

      <main className="canvas-shell">
        <div className="flow-stage" ref={reactFlowWrapper}>
          <div className="flow-stage__veil" />
          <div className="canvas-topbar">
            <div className="canvas-topbar__group">
              <button
                type="button"
                className="canvas-chip"
                onClick={() => void autoLayout()}
                disabled={nodes.length === 0}
              >
                <LayoutGrid size={14} />
                <span>Auto layout</span>
              </button>
              <button type="button" className="canvas-chip" onClick={undoLayout} disabled={!hasPreviousLayout}>
                <Undo2 size={14} />
                <span>Undo layout</span>
              </button>
              <button type="button" className="canvas-chip canvas-chip--danger" onClick={clearCanvas} disabled={nodes.length === 0}>
                <Trash2 size={14} />
                <span>Clear canvas</span>
              </button>
            </div>
            <div className="canvas-topbar__group canvas-topbar__group--shortcuts">
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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            colorMode={resolvedTheme}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={defaultEdgeOptions}
            className="theme-attribution"
          >
            <Controls className="flow-controls" />
            <MiniMap
              pannable
              zoomable
              className="flow-minimap"
              style={minimapStyle}
              maskColor={resolvedTheme === 'dark' ? 'rgba(15, 23, 42, 0.68)' : 'rgba(241, 245, 249, 0.78)'}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color={getGridColor(themePreset, resolvedTheme)}
              style={backgroundStyle}
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
