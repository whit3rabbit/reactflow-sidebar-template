import { memo, useCallback, useId } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const DataNode = memo(function DataNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);
  const fieldId = useId();

  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="data" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label htmlFor={fieldId} className="node-label">Structured payload</label>
          <textarea
            id={fieldId}
            value={data.content ?? ''}
            onChange={(e) => updateNodeData(id, { content: e.target.value })}
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
