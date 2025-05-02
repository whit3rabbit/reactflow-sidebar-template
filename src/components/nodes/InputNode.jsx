import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const InputNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      <div className="node-title">Input Node</div>
      <div>
        <label htmlFor="input" className="node-label">Input:</label>
        <input 
          id="input" 
          name="input" 
          defaultValue={data.input}
          className="node-input nodrag"
          placeholder="Enter input"
        />
      </div>
      <Handle type="target" position={Position.Left} id="a" className="react-flow__handle" />
    </div>
  );
});

InputNode.displayName = 'InputNode';

export default InputNode;