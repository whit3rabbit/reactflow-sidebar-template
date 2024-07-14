import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { validatePassword } from '../../utils/helpers';
import { Eye, EyeOff } from 'lucide-react';

const PasswordNode = memo(({ id, data }) => {
  const [localPassword, setLocalPassword] = useState(data.password || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLocalPassword(data.password || '');
  }, [data.password]);

  const isValid = validatePassword(localPassword);

  const onChange = useCallback((e) => {
    setLocalPassword(e.target.value);
  }, []);

  const onBlur = useCallback(() => {
    if (data.onChange) {
      data.onChange(id, 'password', localPassword);
    }
  }, [id, localPassword, data.onChange]);

  return (
    <div className="base-node relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => data.onRemove(id)}
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} className="node-handle !bg-blue-500" />
      
      <div className="node-title">Password Node</div>
      <div className="node-content">
        <div>
          <label className="node-label">Password:</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={localPassword}
              onChange={onChange}
              onBlur={onBlur}
              className={`node-input pr-10 ${!isValid && localPassword ? 'border-red-500' : ''}`}
              placeholder="Enter password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {!isValid && localPassword && (
            <p className="text-red-500 text-xs mt-1">
              Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

export default PasswordNode;