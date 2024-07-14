export const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  
  export const onDrop = (reactFlowInstance, addNode, setNodes, fitView, getViewport) => (event) => {
    event.preventDefault();
  
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) {
      return;
    }
  
    const reactFlowBounds = event.target.getBoundingClientRect();
    let position = { x: 0, y: 0 };
  
    if (reactFlowInstance && typeof reactFlowInstance.project === 'function') {
      position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
    } else {
      position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
    }
  
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} node`,
        timestamp: Date.now(),
      },
    };
  
    addNode(newNode);
    setNodes((nds) => [...nds, newNode]);
  
    setTimeout(() => {
      const { zoom: currentZoom } = getViewport();
      const newZoom = Math.max(currentZoom * 0.8, 0.2);
      
      fitView({ 
        padding: 0.2, 
        minZoom: newZoom,
        maxZoom: Math.max(currentZoom, 1.1),
        duration: 800 
      });
    }, 50);
  };