import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const BasicNode = memo(({ id, data, isConnectable }) => {
  const [localLabel, setLocalLabel] = useState(data.label || '');

  useEffect(() => {
    setLocalLabel(data.label || '');
  }, [data.label]);

  const onChange = useCallback((evt) => {
    setLocalLabel(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onNodeChange) {
      data.onNodeChange(id, { label: localLabel });
    }
  }, [id, localLabel, data.onNodeChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      
      <div className="node-title">Basic Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Name:</label>
          <input
            value={localLabel}
            onChange={onChange}
            onBlur={onBlur}
            className="node-input"
            placeholder="Enter name"
          />
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
});

export default BasicNode;