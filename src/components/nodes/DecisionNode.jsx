import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const DecisionNode = memo(({ data }) => {
  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={data.onRemove}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">{data.label}</div>
      <div className="node-content">
        <div>
          <label className="node-label">Condition:</label>
          <input
            value={data.condition || ''}
            onChange={(e) => data.onChange(e.target.value, 'condition')}
            className="node-input"
            placeholder="Enter condition"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="true" className="node-handle !bg-green-500 !top-1/3" />
      <Handle type="source" position={Position.Right} id="false" className="node-handle !bg-red-500 !bottom-1/3" />
    </div>
  );
});

export default DecisionNode;