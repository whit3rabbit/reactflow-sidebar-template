import React from 'react';
import {
  BasicNode,
  InputNode,
  OutputNode,
  ProcessingNode,
  DecisionNode,
  DataNode,
  IPAddressNode,
  MACAddressNode,
  PasswordNode
} from '../nodes';
import useFlowStore from '../../store/flowStore';

const createNodeType = (NodeComponent) => {
  return (props) => {
    const { removeNode, updateNode } = useFlowStore();

    const onRemove = (id) => {
      removeNode(id);
    };

    const onNodeChange = (id, newData) => {
      updateNode(id, newData);
    };

    return React.createElement(NodeComponent, {
      ...props,
      data: {
        ...props.data,
        onRemove,
        onNodeChange,
      }
    });
  };
};

const nodeTypes = {
  basicNode: createNodeType(BasicNode),
  inputNode: createNodeType(InputNode),
  outputNode: createNodeType(OutputNode),
  processingNode: createNodeType(ProcessingNode),
  decisionNode: createNodeType(DecisionNode),
  dataNode: createNodeType(DataNode),
  ipAddressNode: createNodeType(IPAddressNode),
  macAddressNode: createNodeType(MACAddressNode),
  passwordNode: createNodeType(PasswordNode),
};

export default nodeTypes;