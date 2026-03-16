import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const InputNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  return (
    <>
      <NodeFrame type="input" data={data}>
        <div className="node-field">
          <label className="node-label">Input brief</label>
          <textarea
            value={data.inputValue ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'inputValue')}
            className="node-input node-input--textarea nodrag"
            placeholder="Describe the initial prompt, upload, or context."
          />
        </div>
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="out" className="node-handle" />
    </>
  );
});

InputNode.displayName = 'InputNode';

export default InputNode;
