import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const ProcessingNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="processing" data={data}>
        <div className="node-field">
          <label className="node-label">Processing brief</label>
          <textarea
            value={data.process ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'process')}
            className="node-input node-input--textarea nodrag"
            placeholder="Describe the operation or transformation."
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </>
  );
});

export default ProcessingNode;
