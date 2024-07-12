import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { validateMACAddress } from '../../services/validation';

const MACAddressNode = memo(({ id, data }) => {
  const [localMAC, setLocalMAC] = useState(data.mac || '');

  useEffect(() => {
    setLocalMAC(data.mac || '');
  }, [data.mac]);

  const isValid = validateMACAddress(localMAC);

  const onChange = useCallback((e) => {
    setLocalMAC(e.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'mac', localMAC);
    }
  }, [id, localMAC, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">MAC Address Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">MAC Address:</label>
          <input
            value={localMAC}
            onChange={onChange}
            onBlur={onBlur}
            className={`node-input ${!isValid && localMAC ? 'border-red-500' : ''}`}
            placeholder="Enter MAC address"
          />
          {!isValid && localMAC && <p className="text-red-500 text-xs mt-1">Invalid MAC address</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default MACAddressNode;