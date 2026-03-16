import { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const ProcessingNode = memo(function ProcessingNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);

  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="processing" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label className="node-label">Processing brief</label>
          <textarea
            value={data.process ?? ''}
            onChange={(e) => updateNodeData(id, { process: e.target.value })}
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
