import { ELK_OPTIONS } from '../config/constants';

/**
 * Generates a unique ID
 * @returns {string} A unique ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounces a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Gets the layouted elements using ELK
 * @param {Array} nodes - The nodes to layout
 * @param {Array} edges - The edges to layout
 * @param {Object} elk - The ELK instance
 * @param {Object} options - The layout options
 * @returns {Promise} A promise that resolves to the layouted elements
 */
export const getLayoutedElements = (nodes, edges, elk, options = ELK_OPTIONS) => {
    const isHorizontal = options?.['elk.direction'] === 'RIGHT';
    const graph = {
      id: 'root',
      layoutOptions: options,
      children: nodes.map((node) => ({
        ...node,
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        width: 250,
        height: 100,
      })),
      edges: edges,
    };
  
    return elk.layout(graph)
      .then((layoutedGraph) => ({
        nodes: layoutedGraph.children.map((node) => ({
          ...node,
          position: { x: node.x, y: node.y },
        })),
        edges: layoutedGraph.edges,
      }))
      .catch(console.error);
  };

/**
 * Validates an IP address
 * @param {string} ip - The IP address to validate
 * @returns {boolean} Whether the IP address is valid
 */
export const validateIPAddress = (ip) => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * Validates a MAC address
 * @param {string} mac - The MAC address to validate
 * @returns {boolean} Whether the MAC address is valid
 */
export const validateMACAddress = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password is valid
 */
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};