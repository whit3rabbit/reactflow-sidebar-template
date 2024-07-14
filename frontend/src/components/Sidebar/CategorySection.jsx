import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import NodeItem from './NodeItem';

const CategorySection = ({ category, nodes, expanded, toggleCategory, onDragStart, searchTerm }) => {
  const filteredNodes = nodes.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredNodes.length === 0) return null;

  return (
    <div className="mb-4">
      <button 
        className="flex items-center justify-between w-full p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => toggleCategory(category)}
      >
        <span className="text-lg font-semibold text-gray-200">{category}</span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          {filteredNodes.map((node) => (
            <NodeItem key={node.type} node={node} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySection;