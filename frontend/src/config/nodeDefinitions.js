export const nodeDefinitions = [
    {
      category: 'Simple Nodes',
      nodes: [
        { type: 'basicNode', label: 'Basic Node' },
        { type: 'inputNode', label: 'Input Node' },
        { type: 'outputNode', label: 'Output Node' }
      ]
    },
    {
      category: 'Complex Nodes',
      nodes: [
        { type: 'processingNode', label: 'Processing Node' },
        { type: 'decisionNode', label: 'Decision Node' },
        { type: 'dataNode', label: 'Data Node' }
      ]
    },
    {
      category: 'Validated Nodes',
      nodes: [
        { type: 'ipAddressNode', label: 'IP Address Node' },
        { type: 'macAddressNode', label: 'MAC Address Node' },
        { type: 'passwordNode', label: 'Password Node' }
      ]
    }
  ];