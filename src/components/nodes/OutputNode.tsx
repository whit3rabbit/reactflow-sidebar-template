import { memo, useCallback, useId } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const OutputNode = memo(function OutputNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);
  const fieldId = useId();

  return (
    <>
      <Handle type="target" position={Position.Left} id="in" className="node-handle" />
      <NodeFrame type="output" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label htmlFor={fieldId} className="node-label">Result summary</label>
          <textarea
            id={fieldId}
            value={data.outputValue ?? ''}
            onChange={(e) => updateNodeData(id, { outputValue: e.target.value })}
            className="node-input node-input--textarea nodrag"
            placeholder="What should this flow deliver?"
          />
        </div>
      </NodeFrame>
    </>
  );
});

export default OutputNode;
