import React, { useState } from 'react';
import Card from './card';
import '../styles/connection-point.css';

function OrgChart({ nodes, onNodeDragStart, onNodeDrag, onNodeDragEnd, draggingId, onEditNode, onConnectionPointClick }) {
  const [hoveredId, setHoveredId] = useState(null);
  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 180;
  return (
    <>
      {nodes.map((node) => (
        <g key={node.id}>
          <foreignObject
            x={node.x - CARD_WIDTH / 2}
            y={node.y}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            style={{ pointerEvents: 'auto' }}
          >
            <Card
              name={node.name}
              role={node.role}
              image={node.image}
              onMouseDown={e => onNodeDragStart(e, node.id)}
              onMouseUp={onNodeDragEnd}
              onEdit={data => onEditNode(node.id, data)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          </foreignObject>
          <circle
            className={`connection-point visible${hoveredId === node.id ? ' active' : ''}`}
            cx={node.x}
            cy={node.y - 18}
            r={8}
            fill="#38bdf8"
            stroke="#0ea5e9"
            strokeWidth={2}
            style={{ pointerEvents: 'auto', opacity: hoveredId === node.id ? 1 : 0.4, transition: 'opacity 0.2s' }}
            onClick={() => onConnectionPointClick && onConnectionPointClick(node.id, 'top', node.x, node.y - 18)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
          <circle
            className={`connection-point visible${hoveredId === node.id ? ' active' : ''}`}
            cx={node.x}
            cy={node.y + CARD_HEIGHT + 18}
            r={8}
            fill="#38bdf8"
            stroke="#0ea5e9"
            strokeWidth={2}
            style={{ pointerEvents: 'move', opacity: hoveredId === node.id ? 1 : 0.4, transition: 'opacity 0.3s' }}
            onClick={() => onConnectionPointClick && onConnectionPointClick(node.id, 'bottom', node.x, node.y + CARD_HEIGHT + 18)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        </g>
      ))}
    </>
  );
}

export default OrgChart;