import { memo, useCallback, useId } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

// Use NodeProps<FlowNodeData> for type-safe access to data fields (avoids unsafe `as any` casts)
const BasicNode = memo(function BasicNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);
  const fieldId = useId();

  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="basic" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label htmlFor={fieldId} className="node-label">Step name</label>
          <input
            id={fieldId}
            value={data.name ?? ''}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
            className="node-input nodrag"
            placeholder="Name this step"
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </>
  );
});

export default BasicNode;
