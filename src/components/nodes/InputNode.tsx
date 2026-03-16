import { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const InputNode = memo(function InputNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);

  return (
    <>
      <NodeFrame type="input" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label className="node-label">Input brief</label>
          <textarea
            value={data.inputValue ?? ''}
            onChange={(e) => updateNodeData(id, { inputValue: e.target.value })}
            className="node-input node-input--textarea nodrag"
            placeholder="Describe the initial prompt, upload, or context."
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="out" className="node-handle" />
    </>
  );
});

export default InputNode;
