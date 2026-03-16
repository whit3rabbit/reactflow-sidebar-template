import { memo, useCallback, useId } from 'react';
import { Handle, Position, useReactFlow, useNodeConnections, type NodeProps } from '@xyflow/react';
import { NodeFrame } from './NodeFrame';
import type { FlowNodeData } from '@/lib/nodeCatalog';

const DecisionNode = memo(function DecisionNode({ id, data }: NodeProps<FlowNodeData>) {
  const { updateNodeData, deleteElements } = useReactFlow();
  const onRemove = useCallback(() => deleteElements({ nodes: [{ id }] }), [id, deleteElements]);
  const fieldId = useId();

  const trueConnections = useNodeConnections({ id, handleId: 'true', handleType: 'source' });
  const falseConnections = useNodeConnections({ id, handleId: 'false', handleType: 'source' });

  return (
    <>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <NodeFrame type="decision" data={data} onRemove={onRemove}>
        <div className="node-field">
          <label htmlFor={fieldId} className="node-label">Gate condition</label>
          <input
            id={fieldId}
            value={data.condition ?? ''}
            onChange={(e) => updateNodeData(id, { condition: e.target.value })}
            className="node-input nodrag"
            placeholder="Example: score >= 8"
          />
        </div>
        <div className="node-branch-legend">
          <span>Yes</span>
          <span>No</span>
        </div>
      </NodeFrame>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="node-handle node-handle--success"
        style={{ top: '36%' }}
        isConnectable={trueConnections.length === 0}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="node-handle node-handle--danger"
        style={{ top: '72%' }}
        isConnectable={falseConnections.length === 0}
      />
    </>
  );
});

export default DecisionNode;
