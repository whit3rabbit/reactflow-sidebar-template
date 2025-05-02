import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const BasicNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} className="react-flow__handle" />
      <div className="node-title">Basic Node</div>
      <div>
        <label htmlFor="name" className="node-label">Name:</label>
        <input 
          id="name" 
          name="name" 
          defaultValue={data.name}
          className="node-input nodrag"
        />
      </div>
      <Handle type="source" position={Position.Right} className="react-flow__handle" />
    </div>
  );
});

BasicNode.displayName = 'BasicNode';

export default BasicNode;