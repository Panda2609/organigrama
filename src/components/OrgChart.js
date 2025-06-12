import Card from './card';
import React, { useRef, useState } from 'react';



function OrgChart({ nodes, onNodeDragStart, onNodeDrag, onNodeDragEnd, draggingId, onEditNode }) {
  return (
    <>
      {nodes.map((node) => (
        <foreignObject
          key={node.id}
          x={node.x - 110}
          y={node.y}
          width={220}
          height={180}
          style={{ pointerEvents: 'auto' }}
        >
          <Card
            name={node.name}
            role={node.role}
            image={node.image}
            onMouseDown={e => onNodeDragStart(e, node.id)}
            onMouseUp={onNodeDragEnd}
            onEdit={data => onEditNode(node.id, data)}
          />
        </foreignObject>
      ))}
    </>
  );
}

export default OrgChart;