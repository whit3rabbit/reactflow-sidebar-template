import { useMemo, useState, type CSSProperties } from 'react';
import { Layers3, Palette, Search } from 'lucide-react';
import { useTheme } from '@/DarkModeProvider';
import { NODE_GROUPS, type NodeType } from '@/lib/nodeCatalog';
import { useFlowStore } from '@/store/flowStore';
import { themeModes, themePresets } from '@/lib/themeConfig';

interface NodesSidebarProps {
  onAddNode: (type: NodeType) => void;
  onLoadStarterFlow: () => void;
}

export function NodesSidebar({ onAddNode, onLoadStarterFlow }: NodesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { themeMode, themePreset, setThemeMode, setThemePreset } = useTheme();

  const nodeCount = useFlowStore((s) => s.nodes.length);
  const edgeCount = useFlowStore((s) => s.edges.length);
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

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
                  <button
                    key={node.type}
                    type="button"
                    draggable
                    onClick={() => onAddNode(node.type)}
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
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
