import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const InputNode = memo(({ id, data }) => {
  const [localInput, setLocalInput] = useState(data.input || '');

  useEffect(() => {
    setLocalInput(data.input || '');
  }, [data.input]);

  const onChange = useCallback((evt) => {
    setLocalInput(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'input', localInput);
    }
  }, [id, localInput, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      
      <div className="node-title">Input Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Input:</label>
          <input
            value={localInput}
            onChange={onChange}
            onBlur={onBlur}
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