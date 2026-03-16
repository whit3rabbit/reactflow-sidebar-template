import type { CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';
import { getNodeCatalogItem, type FlowNodeData, type NodeType } from '@/lib/nodeCatalog';

interface NodeFrameProps {
  type: NodeType;
  data: FlowNodeData;
  onRemove?: () => void;
  children: ReactNode;
}

export function NodeFrame({ type, data, onRemove, children }: NodeFrameProps) {
  const meta = getNodeCatalogItem(type);
  const Icon = meta.icon;
  const title = data.title ?? meta.label;
  const description = data.description ?? meta.description;

  return (
    <div
      className="custom-node"
      style={{ '--node-accent': meta.accent } as CSSProperties}
    >
      <div className="node-frame__header">
        <div className="node-frame__icon" aria-hidden="true">
          <Icon size={16} strokeWidth={2.2} />
        </div>
        <div className="node-frame__intro">
          <span className="node-kicker">{meta.category}</span>
          <div className="node-title-row">
            <div className="node-title">{title}</div>
            <span className="node-badge">{meta.badge}</span>
          </div>
          <p className="node-description">{description}</p>
        </div>
        {onRemove ? (
          <button
            type="button"
            className="node-remove"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
      <div className="node-body">{children}</div>
    </div>
  );
}
