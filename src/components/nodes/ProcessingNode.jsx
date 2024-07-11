import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const ProcessingNode = memo(({ data }) => {
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
          <label className="node-label">Process:</label>
          <textarea
            value={data.process || ''}
            onChange={(e) => data.onChange(e.target.value, 'process')}
            className="node-input h-20 resize-none"
            placeholder="Describe the process"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default ProcessingNode;