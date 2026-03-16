import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const BasicNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="basic" data={data}>
        <div className="node-field">
          <label className="node-label">Step name</label>
          <input
            value={data.name ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'name')}
            className="node-input nodrag"
            placeholder="Name this step"
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </>
  );
});

BasicNode.displayName = 'BasicNode';

export default BasicNode;
