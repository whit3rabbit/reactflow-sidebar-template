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
    <aside className="w-64 h-full bg-gray-900 text-gray-300 border-r border-gray-800 overflow-y-auto overflow-x-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search nodes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-4">
            <button 
              className="flex items-center justify-between w-full p-3 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => toggleCategory(category.name)}
            >
              <span className="text-base font-medium text-gray-200">{category.name}</span>
              {expandedCategories[category.name] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {expandedCategories[category.name] && (
              <div className="mt-3 space-y-3 pl-4">
                {category.types.map((nodeType) => (
                  <div
                    key={nodeType}
                    className="p-3 rounded border border-gray-700 cursor-move bg-gray-800 hover:bg-gray-700 hover:border-blue-600 transition-colors text-sm text-gray-300 active:opacity-75 active:cursor-grabbing"
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