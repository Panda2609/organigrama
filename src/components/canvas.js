import React, { useRef, useState, useEffect } from 'react';
import '../styles/canvas.css';
import Toolbar from './Toolbar';
import Grid from './grid';
import OrgChart from './OrgChart';

function Canvas() {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState([
    { id: 1, x: 300, y: 200, name: 'Juan Pérez', role: 'Gerente', image: '' },
  ]);
  const [connections, setConnections] = useState([]);
  const [pendingConnection, setPendingConnection] = useState(null); // {from: {id, position, x, y}}
  const [mouseSvgPos, setMouseSvgPos] = useState(null); // Posición del mouse en coordenadas SVG para la línea temporal
  const gridSize = 50;

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const invScale = 1 / scale;
  const minX = Math.floor((-offset.x) * invScale / gridSize) * gridSize;
  const maxX = Math.ceil((viewport.width - offset.x) * invScale / gridSize) * gridSize;
  const minY = Math.floor((-offset.y) * invScale / gridSize) * gridSize;
  const maxY = Math.ceil((viewport.height - offset.y) * invScale / gridSize) * gridSize;

  const handleWheel = (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;
    let newScale = scale;
    if (e.deltaY < 0) {
      newScale = Math.min(scale * 1.2, 5);
    } else if (e.deltaY > 0) {
      newScale = Math.max(scale / 1.2, 0.2);
    }
    setOffset({
      x: (offset.x - mouseX * (newScale - scale)),
      y: (offset.y - mouseY * (newScale - scale)),
    });
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) {
      setDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseMove = (e) => {
    if (dragging && lastPos) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };
  const handleMouseUp = (e) => {
    if (e.button === 2) {
      setDragging(false);
      setLastPos(null);
    }
  };
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(s * 1.2, 5));
  };
  const handleZoomOut = () => {
    setScale((s) => Math.max(s / 1.2, 0.2));
  };

  const handleAddCaja = () => {
    const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
    setNodes([
      ...nodes,
      {
        id: newId,
        x: 300 + nodes.length * 40,
        y: 200 + nodes.length * 40,
        name: `Empleado ${newId}`,
        role: 'Nuevo Cargo',
        image: ''
      }
    ]);
  };

  const handleNodeDragStart = (e, id) => {
    if (e.button !== 2) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
    document.body.style.cursor = 'grabbing';
  };

  const handleNodeDrag = (e) => {
    if (draggingId !== null) {
      setNodes(nodes => nodes.map(n =>
        n.id === draggingId
          ? {
              ...n,
              x: n.x + (e.movementX / scale),
              y: n.y + (e.movementY / scale)
            }
          : n
      ));
    }
  };

  const handleNodeDragEnd = () => {
    setDraggingId(null);
    document.body.style.cursor = '';
  };

  const handleEditNode = (id, data) => {
    setNodes(nodes => nodes.map(n => n.id === id ? { ...n, ...data } : n));
  };

  const handleConnectionPointClick = (nodeId, position, x, y) => {
    if (!pendingConnection) {
      setPendingConnection({ from: { id: nodeId, position, x, y } });
      setMouseSvgPos(null); // Limpiar la posición inicial de la línea temporal
    } else {
      // Solo permitir conexiones de 'bottom' a 'top'
      const fromPos = pendingConnection.from.position;
      const toPos = position;
      if (
        pendingConnection.from.id === nodeId ||
        (pendingConnection.from.x === x && pendingConnection.from.y === y) ||
        !(fromPos === 'bottom' && toPos === 'top')
      ) {
        setPendingConnection(null);
        setMouseSvgPos(null); // También limpiar si se cancela aquí
        return;
      }
      setConnections(conns => [
        ...conns,
        { from: pendingConnection.from, to: { id: nodeId, position, x, y } }
      ]);
      setPendingConnection(null);
      setMouseSvgPos(null); // Limpiar después de crear la conexión
    }
  };

  // Actualizar mouseSvgPos solo si hay conexión pendiente
  const handleSvgMouseMove = (e) => {
    if (!pendingConnection) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    setMouseSvgPos({ x: svgP.x, y: svgP.y });
  };

  // Actualizar posiciones de conexiones al mover nodos
  useEffect(() => {
    setConnections(conns =>
      conns.map(conn => {
        const fromNode = nodes.find(n => n.id === conn.from.id);
        const toNode = nodes.find(n => n.id === conn.to.id);
        if (!fromNode || !toNode) return conn;
        const CARD_HEIGHT = 180;
        return {
          from: {
            ...conn.from,
            x: fromNode.x,
            y: conn.from.position === 'top' ? fromNode.y - 18 : fromNode.y + CARD_HEIGHT + 18
          },
          to: {
            ...conn.to,
            x: toNode.x,
            y: conn.to.position === 'top' ? toNode.y - 18 : toNode.y + CARD_HEIGHT + 18
          }
        };
      })
    );
  }, [nodes]);

  // Cancelar conexión pendiente con click derecho
  useEffect(() => {
    const handleCancelConnection = (e) => {
      if (e.button === 2 && pendingConnection) {
        setPendingConnection(null);
        setMouseSvgPos(null); // Limpiar la posición final de la línea temporal
      }
    };
    window.addEventListener('mousedown', handleCancelConnection);
    return () => window.removeEventListener('mousedown', handleCancelConnection);
  }, [pendingConnection]);

  return (
    <div
      className="canvas-container"
      onMouseMove={handleNodeDrag}
      onMouseUp={handleNodeDragEnd}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={{ userSelect: dragging ? 'none' : 'auto' }}
    >
      <Toolbar
        onAdd={handleAddCaja}
        onUndo={() => {}}
        onRedo={() => {}}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={() => {}}
        zoomLevel={scale}
      />
      <svg
        ref={svgRef}
        width={viewport.width}
        height={viewport.height}
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          cursor: dragging ? 'grabbing' : 'default',
          display: 'block',
        }}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        onWheel={handleWheel}
        onMouseMove={handleSvgMouseMove}
      >
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          <Grid minX={minX} maxX={maxX} minY={minY} maxY={maxY} gridSize={gridSize} />
          {connections.map((conn, i) => (
            <line
              key={i}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke="#0ea5e9"
              strokeWidth={3}
              markerEnd="url(#arrowhead)"
            />
          ))}
          {pendingConnection && (
            <line
              x1={pendingConnection.from.x}
              y1={pendingConnection.from.y}
              x2={mouseSvgPos?.x || pendingConnection.from.x}
              y2={mouseSvgPos?.y || pendingConnection.from.y}
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          )}
          <OrgChart
            nodes={nodes}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragEnd={handleNodeDragEnd}
            draggingId={draggingId}
            onEditNode={handleEditNode}
            onConnectionPointClick={handleConnectionPointClick}
          />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
            </marker>
          </defs>
        </g>
      </svg>
    </div>
  );
}

export default Canvas;