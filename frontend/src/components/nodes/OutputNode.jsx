import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const OutputNode = memo(({ id, data }) => {
  const [localOutput, setLocalOutput] = useState(data.output || '');

  useEffect(() => {
    setLocalOutput(data.output || '');
  }, [data.output]);

  const onChange = useCallback((evt) => {
    setLocalOutput(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'output', localOutput);
    }
  }, [id, localOutput, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">Output Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Output:</label>
          <input
            value={localOutput}
            onChange={onChange}
            onBlur={onBlur}
            className="node-input"
            placeholder="Enter output"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default OutputNode;