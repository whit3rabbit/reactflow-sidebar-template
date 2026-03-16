import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import { buildNodeData, type FlowNodeData, type NodeType } from '@/lib/nodeCatalog';

const createNodeId = (type: NodeType) =>
  `${type}-${crypto.randomUUID()}`;

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

interface FlowState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  previousNodes: Node<FlowNodeData>[] | null;
  previousEdges: Edge[] | null;

  onNodesChange: (changes: NodeChange<Node<FlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: NodeType, position: XYPosition, overrides?: Partial<FlowNodeData>) => void;
  loadStarterFlow: () => void;
  clearCanvas: () => void;
  applyLayout: (layoutedNodes: Node<FlowNodeData>[]) => void;
  undoLayout: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  previousNodes: null,
  previousEdges: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, markerEnd: { type: MarkerType.ArrowClosed } },
        get().edges,
      ),
    });
  },

  addNode: (type, position, overrides = {}) => {
    const newNode: Node<FlowNodeData> = {
      id: createNodeId(type),
      type,
      position,
      data: buildNodeData(type, overrides),
    };
    set({ nodes: get().nodes.concat(newNode) });
  },

  loadStarterFlow: () => {
    const starter = createStarterFlow();
    set({ nodes: starter.nodes, edges: starter.edges });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], previousNodes: null, previousEdges: null });
  },

  applyLayout: (layoutedNodes) => {
    const { nodes, edges } = get();
    set({
      previousNodes: nodes,
      previousEdges: edges,
      nodes: layoutedNodes,
    });
  },

  undoLayout: () => {
    const { previousNodes, previousEdges } = get();
    if (previousNodes && previousEdges) {
      set({
        nodes: previousNodes,
        edges: previousEdges,
        previousNodes: null,
        previousEdges: null,
      });
    }
  },
}));
