// components/Sidebar.jsx
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';

const nodeCategories = [
  {
    name: 'Simple Nodes',
    types: ['basicNode', 'inputNode', 'outputNode']
  },
  {
    name: 'Complex Nodes',
    types: ['processingNode', 'decisionNode', 'dataNode']
  }
];

const Sidebar = () => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    types: category.types.filter(type => 
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.types.length > 0);

  return (
    <aside className="w-64 h-full bg-gray-900 text-gray-300 border-r border-gray-800 overflow-y-auto">
      <div className="p-4">
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search nodes" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        </div>
        
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-4">
            <button 
              className="flex items-center justify-between w-full p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => toggleCategory(category.name)}
            >
              <span className="text-lg font-semibold text-gray-200">{category.name}</span>
              {expandedCategories[category.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedCategories[category.name] && (
              <div className="mt-2 space-y-1">
                {category.types.map((nodeType) => (
                  <div
                    key={nodeType}
                    className="p-2 rounded-md cursor-move bg-gray-800 hover:bg-gray-700 transition-colors"
                    draggable
                    onDragStart={(event) => onDragStart(event, nodeType)}
                  >
                    {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;