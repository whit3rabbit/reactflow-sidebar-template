import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const ProcessingNode = memo(({ id, data }) => {
  const [localProcess, setLocalProcess] = useState(data.process || '');

  useEffect(() => {
    setLocalProcess(data.process || '');
  }, [data.process]);

  const onChange = useCallback((evt) => {
    setLocalProcess(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'process', localProcess);
    }
  }, [id, localProcess, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">Processing Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Process:</label>
          <textarea
            value={localProcess}
            onChange={onChange}
            onBlur={onBlur}
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