import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const OutputNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="source" position={Position.Right} id="a" className="react-flow__handle" />
      <div className="node-title">Output Node</div>
      <div>
        <label htmlFor="output" className="node-label">Output:</label>
        <div className="p-2 bg-input rounded text-muted-foreground text-xs">
          {data.output || '(No output data)'}
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;