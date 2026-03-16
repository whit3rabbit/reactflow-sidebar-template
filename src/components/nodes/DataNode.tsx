import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const DataNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="data" data={data}>
        <div className="node-field">
          <label className="node-label">Structured payload</label>
          <textarea
            value={data.content ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'content')}
            className="node-input node-input--textarea nodrag"
            placeholder='Example: {"audience":"founders","tone":"direct"}'
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </>
  );
});

export default DataNode;
