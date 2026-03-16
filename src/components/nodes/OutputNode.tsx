import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const OutputNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} id="in" className="node-handle" />
      <NodeFrame type="output" data={data}>
        <div className="node-field">
          <label className="node-label">Result summary</label>
          <textarea
            value={data.outputValue ?? ''}
            onChange={(event) => data.onChange?.(event.target.value, 'outputValue')}
            className="node-input node-input--textarea nodrag"
            placeholder="What should this flow deliver?"
          />
        </div>
      </NodeFrame>
    </>
  );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;
