import React, { useState } from 'react';
import { Search } from 'lucide-react';
import CategorySection from './CategorySection';
import { nodeDefinitions } from '../../config/nodeDefinitions';

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
        
        {nodeDefinitions.map(({ category, nodes }) => (
          <CategorySection 
            key={category}
            category={category}
            nodes={nodes}
            expanded={expandedCategories[category]}
            toggleCategory={toggleCategory}
            onDragStart={onDragStart}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;