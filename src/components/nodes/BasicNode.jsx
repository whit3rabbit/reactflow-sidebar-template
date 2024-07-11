import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const BasicNode = memo(({ data }) => {
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
          <label className="node-label">Name:</label>
          <input
            value={data.name || ''}
            onChange={(e) => data.onChange(e.target.value, 'name')}
            className="node-input"
            placeholder="Enter name"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default BasicNode;