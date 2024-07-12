import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const DecisionNode = memo(({ id, data }) => {
  const [localCondition, setLocalCondition] = useState(data.condition || '');

  useEffect(() => {
    setLocalCondition(data.condition || '');
  }, [data.condition]);

  const onChange = useCallback((evt) => {
    setLocalCondition(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'condition', localCondition);
    }
  }, [id, localCondition, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">Decision Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Condition:</label>
          <input
            value={localCondition}
            onChange={onChange}
            onBlur={onBlur}
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