import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useFlowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  lastServerUpdate: null,

  setNodes: (nodes) => {
    if (Array.isArray(nodes)) {
      console.log('Setting nodes in store:', nodes);
      set({ nodes });
    } else {
      console.error('Attempted to set non-array nodes:', nodes);
    }
  },

  setEdges: (edges) => {
    if (Array.isArray(edges)) {
      set({ edges });
    } else {
      console.error('Attempted to set non-array edges:', edges);
    }
  },

  addNode: (node) => {
    console.log('addNode called with:', node);
    const newNode = {
      ...node,
      id: nanoid(),
      data: {
        ...node.data,
        timestamp: Date.now(),
      },
    };
    console.log('New node created:', newNode);
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }));
    console.log('State updated');
  },

  updateNode: (id, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      )
    }));
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    }));
  },

  addEdge: (edge) => {
    set((state) => ({ edges: [...state.edges, { ...edge, id: nanoid() }] }));
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  updateFlowFromServer: (flowData) => {
    set((state) => {
      if (!flowData || !Array.isArray(flowData.nodes) || !Array.isArray(flowData.edges)) {
        console.error('Invalid flow data received from server');
        return state;
      }

      const updatedNodes = flowData.nodes.map((node) => {
        const existingNode = state.nodes.find((n) => n.id === node.id);
        if (existingNode && existingNode.data && node.data && existingNode.data.timestamp > node.data.timestamp) {
          return existingNode;
        }
        return node;
      });

      return {
        nodes: updatedNodes,
        edges: flowData.edges,
        lastServerUpdate: Date.now(),
      };
    });
  },

  clearFlow: () => {
    set({ nodes: [], edges: [] });
  },

  getNode: (id) => {
    return get().nodes.find((node) => node.id === id);
  },

  getEdge: (id) => {
    return get().edges.find((edge) => edge.id === id);
  },
}));

export default useFlowStore;