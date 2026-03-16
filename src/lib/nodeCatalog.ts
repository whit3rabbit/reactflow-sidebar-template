import {
  Binary,
  Box,
  Database,
  GitBranch,
  SendToBack,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type NodeType = 'input' | 'basic' | 'output' | 'decision' | 'data' | 'processing';

export interface FlowNodeData {
  label?: string;
  title?: string;
  description?: string;
  name?: string;
  inputValue?: string;
  outputValue?: string;
  condition?: string;
  content?: string;
  process?: string;
  onChange?: (value: string, field: EditableNodeField) => void;
  onRemove?: () => void;
}

export type EditableNodeField = Exclude<keyof FlowNodeData, 'onChange' | 'onRemove'>;

export interface NodeCatalogItem {
  type: NodeType;
  label: string;
  shortLabel: string;
  category: string;
  badge: string;
  description: string;
  accent: string;
  icon: LucideIcon;
}

export const NODE_LIBRARY: NodeCatalogItem[] = [
  {
    type: 'input',
    label: 'Input',
    shortLabel: 'Ingest',
    category: 'Capture',
    badge: 'Source',
    description: 'Pull in prompts, files, or user context before the flow starts.',
    accent: '#60a5fa',
    icon: SendToBack,
  },
  {
    type: 'basic',
    label: 'Basic',
    shortLabel: 'Step',
    category: 'Compose',
    badge: 'Core',
    description: 'A flexible step for notes, structure, or lightweight transformations.',
    accent: '#8b5cf6',
    icon: Box,
  },
  {
    type: 'processing',
    label: 'Processing',
    shortLabel: 'Transform',
    category: 'Compose',
    badge: 'Logic',
    description: 'Describe a structured operation, generation step, or model task.',
    accent: '#22c55e',
    icon: Sparkles,
  },
  {
    type: 'decision',
    label: 'Decision',
    shortLabel: 'Branch',
    category: 'Route',
    badge: 'Branch',
    description: 'Split the graph based on validation, review outcomes, or conditions.',
    accent: '#f59e0b',
    icon: GitBranch,
  },
  {
    type: 'data',
    label: 'Data',
    shortLabel: 'Store',
    category: 'Route',
    badge: 'State',
    description: 'Capture structured payloads, memory, or intermediate results.',
    accent: '#14b8a6',
    icon: Database,
  },
  {
    type: 'output',
    label: 'Output',
    shortLabel: 'Deliver',
    category: 'Finish',
    badge: 'Result',
    description: 'Present the final answer, artifact, or handoff from the workflow.',
    accent: '#f97316',
    icon: Binary,
  },
];

export const NODE_GROUPS = NODE_LIBRARY.reduce<Record<string, NodeCatalogItem[]>>((groups, item) => {
  groups[item.category] = [...(groups[item.category] ?? []), item];
  return groups;
}, {});

export function isNodeType(value: string): value is NodeType {
  return NODE_LIBRARY.some((item) => item.type === value);
}

export function getNodeCatalogItem(type: NodeType): NodeCatalogItem {
  const item = NODE_LIBRARY.find((entry) => entry.type === type);

  if (!item) {
    throw new Error(`Unknown node type: ${type}`);
  }

  return item;
}

export function buildNodeData(
  type: NodeType,
  overrides: Partial<Omit<FlowNodeData, 'onChange' | 'onRemove'>> = {}
): FlowNodeData {
  const defaults: Record<NodeType, FlowNodeData> = {
    input: {
      label: 'Input',
      title: 'Gather Inputs',
      description: 'Start with instructions, source material, or external context.',
      inputValue: '',
    },
    basic: {
      label: 'Basic',
      title: 'Shape The Step',
      description: 'Use this as a general-purpose block for composition or review.',
      name: '',
    },
    processing: {
      label: 'Processing',
      title: 'Run Transformation',
      description: 'Define how the content should be transformed or refined.',
      process: '',
    },
    decision: {
      label: 'Decision',
      title: 'Validate Condition',
      description: 'Branch the flow depending on whether the criteria passes.',
      condition: '',
    },
    data: {
      label: 'Data',
      title: 'Persist State',
      description: 'Store structured content, JSON payloads, or notes for later steps.',
      content: '',
    },
    output: {
      label: 'Output',
      title: 'Present Result',
      description: 'Summarize what gets returned or handed off at the end.',
      outputValue: '',
    },
  };

  return {
    ...defaults[type],
    ...overrides,
  };
}
