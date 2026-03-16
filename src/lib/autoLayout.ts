import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

const DEFAULT_WIDTH = 290;
const DEFAULT_HEIGHT = 180;

interface LayoutOptions {
  direction?: 'RIGHT' | 'DOWN';
  nodeSpacing?: number;
  layerSpacing?: number;
}

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): Promise<Node[]> {
  const {
    direction = 'RIGHT',
    nodeSpacing = 60,
    layerSpacing = 80,
  } = options;

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layouted = await elk.layout(elkGraph);

  return nodes.map((node) => {
    const elkNode = layouted.children?.find((n) => n.id === node.id);
    if (!elkNode) return node;

    return {
      ...node,
      position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
    };
  });
}
