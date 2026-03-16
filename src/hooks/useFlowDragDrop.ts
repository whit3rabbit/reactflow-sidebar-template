import { useCallback, type RefObject } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { isNodeType, type NodeType } from '@/lib/nodeCatalog';
import { useFlowStore } from '@/store/flowStore';

export function useFlowDragDrop(wrapperRef: RefObject<HTMLDivElement | null>) {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useFlowStore((s) => s.addNode);

  const getDefaultPosition = useCallback((): XYPosition => {
    const count = useFlowStore.getState().nodes.length;
    const bounds = wrapperRef.current?.getBoundingClientRect();

    if (!bounds) {
      return {
        x: 120 + (count % 3) * 48,
        y: 120 + (count % 4) * 72,
      };
    }

    return screenToFlowPosition({
      x: bounds.left + bounds.width * 0.55 + (count % 3) * 24,
      y: bounds.top + bounds.height * 0.34 + (count % 4) * 48,
    });
  }, [screenToFlowPosition, wrapperRef]);

  const createNode = useCallback(
    (type: NodeType, position?: XYPosition) => {
      addNode(type, position ?? getDefaultPosition());
    },
    [addNode, getDefaultPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !isNodeType(type)) {
        return;
      }

      createNode(
        type,
        screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
      );
    },
    [createNode, screenToFlowPosition]
  );

  return { createNode, onDragOver, onDrop };
}
