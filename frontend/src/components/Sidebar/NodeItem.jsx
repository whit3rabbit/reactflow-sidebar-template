import React from 'react';

const NodeItem = ({ node, onDragStart }) => (
  <div
    className="p-2 rounded-md cursor-move bg-gray-800 hover:bg-gray-700 transition-colors"
    draggable
    onDragStart={(event) => onDragStart(event, node.type)}
  >
    {node.label}
  </div>
);

export default NodeItem;