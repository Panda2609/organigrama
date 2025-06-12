import React from 'react';

// Calcula el rango visible en coordenadas del mundo
export function getGridBounds(scale, offset, viewport, gridSize) {
  const invScale = 1 / scale;
  const minX = Math.floor((-offset.x) * invScale / gridSize) * gridSize;
  const maxX = Math.ceil((viewport.width - offset.x) * invScale / gridSize) * gridSize;
  const minY = Math.floor((-offset.y) * invScale / gridSize) * gridSize;
  const maxY = Math.ceil((viewport.height - offset.y) * invScale / gridSize) * gridSize;
  return { minX, maxX, minY, maxY };
}

function Grid({ minX, maxX, minY, maxY, gridSize }) {
  const lines = [];
  for (let x = minX; x <= maxX; x += gridSize) {
    lines.push(
      <line
        key={`v-${x}`}
        className="grid-line"
        x1={x}
        y1={minY}
        x2={x}
        y2={maxY}
        stroke={x % (gridSize * 4) === 0 ? '#888' : '#bbb'}
        strokeWidth={x % (gridSize * 4) === 0 ? 2 : 1}
      />
    );
  }
  for (let y = minY; y <= maxY; y += gridSize) {
    lines.push(
      <line
        key={`h-${y}`}
        className="grid-line"
        x1={minX}
        y1={y}
        x2={maxX}
        y2={y}
        stroke={y % (gridSize * 4) === 0 ? '#888' : '#bbb'}
        strokeWidth={y % (gridSize * 4) === 0 ? 2 : 1}
      />
    );
  }
  return <>{lines}</>;
}

export default Grid;
