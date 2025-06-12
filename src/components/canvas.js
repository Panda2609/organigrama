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
  // Estado para los nodos (empleados)
  const [nodes, setNodes] = useState([
    // Ejemplo inicial
    { id: 1, x: 300, y: 200, name: 'Juan Pérez', role: 'Gerente', image: '' },
  ]);
  const gridSize = 50; // Tamaño de la cuadrícula en píxeles

  // Actualiza el tamaño del viewport al redimensionar
  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcula el rango visible en coordenadas del mundo
  const invScale = 1 / scale;
  const minX = Math.floor((-offset.x) * invScale / gridSize) * gridSize;
  const maxX = Math.ceil((viewport.width - offset.x) * invScale / gridSize) * gridSize;
  const minY = Math.floor((-offset.y) * invScale / gridSize) * gridSize;
  const maxY = Math.ceil((viewport.height - offset.y) * invScale / gridSize) * gridSize;

  // Eventos de zoom y pan
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
    // Zoom centrado en el puntero
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

  // Zoom desde toolbar
  const handleZoomIn = () => {
    setScale((s) => Math.min(s * 1.2, 5));
  };
  const handleZoomOut = () => {
    setScale((s) => Math.max(s / 1.2, 0.2));
  };

  // Añadir empleado
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
        image: '' // Puedes luego permitir subir imagen
      }
    ]);
  };

  const handleNodeDragStart = (e, id) => {
    if (e.button !== 2) return; // Solo click derecho
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

  // Editar nombre/cargo de un nodo
  const handleEditNode = (id, data) => {
    setNodes(nodes => nodes.map(n => n.id === id ? { ...n, ...data } : n));
  };

  // Callback para click en punto de conexión
  const handleConnectionPointClick = (nodeId, position, x, y) => {
    console.log('Punto de conexión clickeado:', { nodeId, position, x, y });
    // Aquí puedes iniciar la lógica de conexión visual
  };

  return (
    // Renderiza el canvas con la cuadrícula y las herramientas
    <div
      className="canvas-container"
      onMouseMove={handleNodeDrag}
      onMouseUp={handleNodeDragEnd}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={{ userSelect: dragging ? 'none' : 'auto' }}
    >
        {/* Renderiza la barra de herramientas */}
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
        onMouseMove={handleMouseMove}
      >
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          <Grid minX={minX} maxX={maxX} minY={minY} maxY={maxY} gridSize={gridSize} />
          <OrgChart
            nodes={nodes}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragEnd={handleNodeDragEnd}
            draggingId={draggingId}
            onEditNode={handleEditNode}
            onConnectionPointClick={handleConnectionPointClick}
          />
        </g>
      </svg>
    </div>
  );
}

export default Canvas;