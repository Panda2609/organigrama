import React from 'react';
import '../styles/toolbar.css';
import { FaPlus, FaUndo, FaRedo, FaSearchPlus, FaSearchMinus, FaFileExport } from 'react-icons/fa';

function Toolbar({ onAdd, onUndo, onRedo, onZoomIn, onZoomOut, onExport, zoomLevel }) {
  return (
    <>
      <button className="toolbar-btn export-btn" onClick={onExport} title="Exportar">
        <FaFileExport style={{ marginRight: 8 }} /> Exportar
      </button>
      <button className="toolbar-btn add-btn" onClick={onAdd} title="Añadir elemento">
        <FaPlus style={{ marginRight: 8 }} /> Añadir elemento
      </button>
      <div className="toolbar-bottom-center">
        <button className="toolbar-btn undo-btn" onClick={onUndo} title="Undo">
          <FaUndo style={{ marginRight: 8 }} /> Undo
        </button>
        <button className="toolbar-btn redo-btn" onClick={onRedo} title="Redo">
          <FaRedo style={{ marginRight: 8 }} /> Redo
        </button>
      </div>
      <div className="toolbar-bottom-right">
        <button className="toolbar-btn zoomin-btn" onClick={onZoomIn} title="Acercar">
          <FaSearchPlus style={{ marginRight: 8 }} />
        </button>
        <div className="zoom-level">{Math.round(zoomLevel * 100)}%</div>
        <button className="toolbar-btn zoomout-btn" onClick={onZoomOut} title="Alejar">
          <FaSearchMinus style={{ marginRight: 8 }} />
        </button>
      </div>
    </>
  );
}

export default Toolbar;
