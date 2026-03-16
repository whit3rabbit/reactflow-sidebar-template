import { useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Layers3, LayoutGrid, Palette, Search, Undo2 } from 'lucide-react';
import { useTheme, type ThemeMode, type ThemePreset } from '@/DarkModeProvider';
import { NODE_GROUPS, type NodeType } from '@/lib/nodeCatalog';
import { useFlowStore } from '@/store/flowStore';

interface NodesSidebarProps {
  onAddNode: (type: NodeType) => void;
  onLoadStarterFlow: () => void;
  onAutoLayout: () => void;
  onUndoLayout: () => void;
  hasUndoLayout: boolean;
}

const themeModes: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

const themePresets: { value: ThemePreset; label: string; swatch: string }[] = [
  {
    value: 'graphite',
    label: 'Graphite',
    swatch: 'linear-gradient(135deg, #7dd3fc 0%, #8b5cf6 100%)',
  },
  {
    value: 'ocean',
    label: 'Ocean',
    swatch: 'linear-gradient(135deg, #38bdf8 0%, #14b8a6 100%)',
  },
  {
    value: 'ember',
    label: 'Ember',
    swatch: 'linear-gradient(135deg, #fb7185 0%, #f59e0b 100%)',
  },
];

export function NodesSidebar({ onAddNode, onLoadStarterFlow, onAutoLayout, onUndoLayout, hasUndoLayout }: NodesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { themeMode, themePreset, setThemeMode, setThemePreset } = useTheme();

  const nodeCount = useFlowStore((s) => s.nodes.length);
  const edgeCount = useFlowStore((s) => s.edges.length);
  const clearCanvas = useFlowStore((s) => s.clearCanvas);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return Object.entries(NODE_GROUPS).reduce<Record<string, (typeof NODE_GROUPS)[string]>>(
      (groups, [groupName, nodes]) => {
        const filteredNodes = nodes.filter((node) => {
          if (!query) {
            return true;
          }

          return [node.label, node.description, node.shortLabel]
            .join(' ')
            .toLowerCase()
            .includes(query);
        });

        if (filteredNodes.length > 0) {
          groups[groupName] = filteredNodes;
        }

        return groups;
      },
      {}
    );
  }, [searchTerm]);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, nodeType: NodeType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onAddNode(nodeType);
    }
  };

  return (
    <aside className="sidebar-shell custom-scroll">
      <div className="sidebar-hero">
        <div className="sidebar-stats">
          <div className="stat-card">
            <span>Nodes</span>
            <strong>{nodeCount}</strong>
          </div>
          <div className="stat-card">
            <span>Edges</span>
            <strong>{edgeCount}</strong>
          </div>
          <div className="stat-card">
            <span>Library</span>
            <strong>{Object.values(NODE_GROUPS).flat().length}</strong>
          </div>
        </div>
      </div>

      <div className="sidebar-panel">
        <div className="sidebar-panel__header">
          <div>
            <p className="sidebar-panel__label">Quick actions</p>
            <h2 className="sidebar-panel__title">Start with structure</h2>
          </div>
          <Layers3 size={16} />
        </div>
        <div className="sidebar-actions">
          <button type="button" className="sidebar-button sidebar-button--primary" onClick={onLoadStarterFlow}>
            Load starter flow
          </button>
          {nodeCount > 0 && (
            <button type="button" className="sidebar-button" onClick={onAutoLayout}>
              <LayoutGrid size={14} />
              Auto layout
            </button>
          )}
          {hasUndoLayout && (
            <button type="button" className="sidebar-button" onClick={onUndoLayout}>
              <Undo2 size={14} />
              Undo layout
            </button>
          )}
          <button type="button" className="sidebar-button" onClick={clearCanvas}>
            Clear canvas
          </button>
        </div>
      </div>

      <div className="sidebar-panel">
        <div className="sidebar-panel__header">
          <div>
            <p className="sidebar-panel__label">Appearance</p>
            <h2 className="sidebar-panel__title">Theme controls</h2>
          </div>
          <Palette size={16} />
        </div>

        <div className="mode-toggle" role="tablist" aria-label="Theme mode">
          {themeModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              className="mode-toggle__button"
              data-active={themeMode === mode.value}
              onClick={() => setThemeMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="palette-grid">
          {themePresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className="palette-card"
              data-active={themePreset === preset.value}
              onClick={() => setThemePreset(preset.value)}
            >
              <span className="palette-card__swatch" style={{ backgroundImage: preset.swatch }} />
              <span className="palette-card__label">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-panel">
        <label className="search-field">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search nodes, behaviors, and roles"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <div className="sidebar-groups">
        {Object.entries(filteredGroups).map(([groupName, nodes]) => (
          <section key={groupName} className="sidebar-group">
            <div className="sidebar-group__header">
              <h3>{groupName}</h3>
              <span>{nodes.length}</span>
            </div>
            <div className="sidebar-grid">
              {nodes.map((node) => {
                const Icon = node.icon;

                return (
                  <div
                    key={node.type}
                    role="button"
                    tabIndex={0}
                    draggable
                    onClick={() => onAddNode(node.type)}
                    onKeyDown={(event) => onCardKeyDown(event, node.type)}
                    onDragStart={(event) => onDragStart(event, node.type)}
                    className="node-library-card"
                    style={{ '--card-accent': node.accent } as CSSProperties}
                  >
                    <div className="node-library-card__icon">
                      <Icon size={18} strokeWidth={2.1} />
                    </div>
                    <div className="node-library-card__content">
                      <div className="node-library-card__topline">
                        <strong>{node.label}</strong>
                        <span>{node.badge}</span>
                      </div>
                      <p>{node.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
