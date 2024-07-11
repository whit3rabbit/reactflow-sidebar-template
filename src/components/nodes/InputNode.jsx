import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const InputNode = memo(({ data }) => {
  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={data.onRemove}
      >
        ×
      </button>
      
      <div className="node-title">{data.label}</div>
      <div className="node-content">
        <div>
          <label className="node-label">Input:</label>
          <input
            value={data.input || ''}
            onChange={(e) => data.onChange(e.target.value, 'input')}
            className="node-input"
            placeholder="Enter input"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default InputNode;