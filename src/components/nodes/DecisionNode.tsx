import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const DecisionNode = memo(function DecisionNode({ data }: NodeProps<FlowNodeData>) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="decision" data={data}>
        <div className="node-field">
          <label className="node-label">Gate condition</label>
          <input
            value={data.condition ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'condition')}
            className="node-input nodrag"
            placeholder="Example: score >= 8"
          />
        </div>
        <div className="node-branch-legend">
          <span>Yes</span>
          <span>No</span>
        </div>
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="node-handle node-handle--success"
        style={{ top: '36%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="node-handle node-handle--danger"
        style={{ top: '72%' }}
      />
    </>
  );
});

export default DecisionNode;
