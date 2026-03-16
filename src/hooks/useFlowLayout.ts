import { useCallback, useEffect, useState } from 'react';
import { useNodesInitialized, useReactFlow, type Node } from '@xyflow/react';
import { useFlowStore } from '@/store/flowStore';
import { getLayoutedElements } from '@/lib/autoLayout';

const FIT_VIEW_OPTIONS = { padding: 0.18, duration: 500 } as const;

export function useFlowLayout() {
  const { fitView, getInternalNode } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const applyLayout = useFlowStore((s) => s.applyLayout);
  const storeLoadStarterFlow = useFlowStore((s) => s.loadStarterFlow);
  const [pendingLayout, setPendingLayout] = useState(false);

  const getMeasuredNodes = useCallback((): Node[] => (
    useFlowStore.getState().nodes.map((node) => {
      const internalNode = getInternalNode(node.id);

      if (!internalNode) {
        return node;
      }

      return {
        ...node,
        measured: internalNode.measured,
        width: internalNode.measured.width ?? node.width,
        height: internalNode.measured.height ?? node.height,
      };
    })
  ), [getInternalNode]);

  const runLayout = useCallback(async () => {
    const currentNodes = getMeasuredNodes();
    const currentEdges = useFlowStore.getState().edges;

    if (currentNodes.length === 0) {
      return;
    }

    const layouted = await getLayoutedElements(currentNodes, currentEdges, {
      nodeSpacing: 84,
      layerSpacing: 120,
    });

    applyLayout(layouted);

    setTimeout(() => {
      void fitView(FIT_VIEW_OPTIONS);
    }, 0);
  }, [applyLayout, fitView, getMeasuredNodes]);

  useEffect(() => {
    if (!pendingLayout || !nodesInitialized) {
      return;
    }

    let cancelled = false;

    void runLayout().finally(() => {
      if (!cancelled) {
        setPendingLayout(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [nodesInitialized, pendingLayout, runLayout]);

  const autoLayout = useCallback(() => {
    if (useFlowStore.getState().nodes.length === 0) {
      return;
    }

    setPendingLayout(true);
  }, []);

  const loadStarterFlow = useCallback(() => {
    storeLoadStarterFlow();
    setPendingLayout(true);
  }, [storeLoadStarterFlow]);

  return { autoLayout, loadStarterFlow };
}
