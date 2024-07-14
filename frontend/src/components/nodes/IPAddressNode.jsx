import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { validateIPAddress } from '../../utils/helpers';

const IPAddressNode = memo(({ id, data }) => {
  const [localIP, setLocalIP] = useState(data.ip || '');

  useEffect(() => {
    setLocalIP(data.ip || '');
  }, [data.ip]);

  const isValid = validateIPAddress(localIP);

  const onChange = useCallback((e) => {
    setLocalIP(e.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'ip', localIP);
    }
  }, [id, localIP, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">IP Address Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">IP Address:</label>
          <input
            value={localIP}
            onChange={onChange}
            onBlur={onBlur}
            className={`node-input ${!isValid && localIP ? 'border-red-500' : ''}`}
            placeholder="Enter IP address"
          />
          {!isValid && localIP && <p className="text-red-500 text-xs mt-1">Invalid IP address</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default IPAddressNode;