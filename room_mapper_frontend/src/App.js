import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import RoomMapperCanvas from './components/RoomMapperCanvas';
import RoomToolbar from './components/RoomToolbar';

// Core light theme variables
const THEME = {
  primary: '#3b82f6',
  success: '#06b6d4',
  background: '#f9fafb',
  surface: '#fff',
  text: '#111827'
};

// Room defaults
const DEFAULT_ROOM = {
  width: 140,
  height: 100,
  label: 'Room'
};
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const MIN_ZOOM = 0.45, MAX_ZOOM = 1.7;

function randomLabel() {
  const types = ['Office', 'Bedroom', 'Bath', 'Living', 'Kitchen', 'Store', 'Lab', 'Zone'];
  const n = Math.floor(Math.random() * types.length);
  return types[n];
}

// PUBLIC_INTERFACE
/**
 * Main app for Room Mapper. Handles canvas state, selection, toolbar actions.
 */
function App() {
  // Theme for head styles
  useEffect(() => {
    document.body.style.background = THEME.background;
    document.body.style.color = THEME.text;
  }, []);

  // App state
  const [rooms, setRooms] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [gridEnabled, setGridEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Track focus and keyboard
  const appRef = useRef();

  // === Room actions ===
  const handleAddRoom = () => {
    // Put new room at random un-overlapping spot, but ensure inside canvas
    let nextId = (rooms.reduce((n, r) => Math.max(n, r.id), 0) || 0) + 1;
    let rx = 40 + Math.floor(Math.random() * (CANVAS_WIDTH - 200));
    let ry = 40 + Math.floor(Math.random() * (CANVAS_HEIGHT - 150));
    setRooms(rs => [...rs, {
      id: nextId,
      x: rx,
      y: ry,
      ...DEFAULT_ROOM,
      label: randomLabel() + ' ' + nextId
    }]);
    setTimeout(() => {
      setSelectedIds(new Set([nextId]));
    }, 10);
  };

  const handleDeleteRoom = () => {
    setRooms(rs => rs.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const handleRoomMove = (id, pos) => {
    setRooms(rs => rs.map(r => r.id === id ? { ...r, ...pos } : r));
  };

  const handleRoomResize = (id, newPos) => {
    setRooms(rs => rs.map(r => r.id === id ? { ...r, ...newPos } : r));
  };

  const handleRoomLabelEdit = (id, label) => {
    setRooms(rs => rs.map(r => r.id === id ? { ...r, label } : r));
  };

  // Selection logic
  const handleSelectRoom = (id, multi) => {
    setSelectedIds(old => {
      const s = new Set(old);
      if (multi) {
        if (s.has(id)) s.delete(id);
        else s.add(id);
      } else {
        s.clear();
        s.add(id);
      }
      return s;
    });
  };

  // Select when mouse down on a room
  const handleRoomMouseDown = (id, shiftKey) => {
    handleSelectRoom(id, shiftKey);
  };

  // Main label change via text field in sidebar
  const handleMainLabelChange = (e) => {
    let firstSel = getFirstSelectedRoom();
    if (!firstSel) return;
    handleRoomLabelEdit(firstSel.id, e.target.value);
  };

  // Helpers
  const getFirstSelectedRoom = () => rooms.find(r => selectedIds.has(r.id)) || null;
  const selectedLabel = getFirstSelectedRoom()?.label || '';

  // Deselect
  const handleDeselect = () => setSelectedIds(new Set());

  // Keyboard handlers (delete, esc)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Delete' && selectedIds.size > 0) {
        handleDeleteRoom();
      } else if (e.key === 'Escape') {
        handleDeselect();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [selectedIds]);

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + 0.13));
  const handleZoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - 0.13));
  const handleResetZoom = () => setZoom(1);

  // Grid toggle
  const handleToggleGrid = () => setGridEnabled(g => !g);

  // Style root CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty('--canvas-bg', THEME.background);
    document.documentElement.style.setProperty('--surface', THEME.surface);
    document.documentElement.style.setProperty('--primary', THEME.primary);
    document.documentElement.style.setProperty('--success', THEME.success);
    document.documentElement.style.setProperty('--text', THEME.text);
  }, []);

  return (
    <div
      className="App"
      ref={appRef}
      tabIndex={0}
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: THEME.background,
        color: THEME.text,
        fontFamily: 'Inter, Segoe UI, sans-serif',
        padding: '0',
        margin: '0',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Custom App Header */}
      <header
        style={{
          background: THEME.surface,
          borderBottom: '1.5px solid #e5e7eb',
          color: THEME.text,
          padding: '20px 0 8px 0',
          fontWeight: 800,
          letterSpacing: '0.03em',
          fontSize: 27,
          marginBottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px #e5e7eb0c',
          zIndex: 40
        }}
      >
        <span style={{color: THEME.primary, marginRight: 12, fontWeight:900, fontSize:29}}>▦</span>
        Room Mapper Designer
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          padding: '48px 0',
          background: THEME.background,
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0,
          minHeight: 0
        }}
      >
        {/* Sidebar / Toolbar */}
        <RoomToolbar
          onAddRoom={handleAddRoom}
          onDeleteRoom={handleDeleteRoom}
          canDelete={selectedIds.size > 0}
          selectedLabel={selectedLabel}
          onLabelChange={handleMainLabelChange}
          canEditLabel={selectedIds.size === 1}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          zoom={zoom}
          gridEnabled={gridEnabled}
          onToggleGrid={handleToggleGrid}
          selectedCount={selectedIds.size}
        />
        {/* Main canvas */}
        <RoomMapperCanvas
          rooms={rooms}
          selectedIds={selectedIds}
          onSelect={handleSelectRoom}
          onMove={handleRoomMove}
          onResize={handleRoomResize}
          onLabelEdit={handleRoomLabelEdit}
          onRoomMouseDown={handleRoomMouseDown}
          gridEnabled={gridEnabled}
          zoom={zoom}
          width={Math.round(CANVAS_WIDTH * zoom)}
          height={Math.round(CANVAS_HEIGHT * zoom)}
          onDeselect={handleDeselect}
        />
      </main>
      <footer style={{
        fontSize: 13,
        color: '#64748b',
        borderTop: '1.2px solid #e5e7eb',
        background: THEME.surface,
        textAlign: 'center',
        padding: '10px 0'
      }}>
        No data stored, frontend app only. <span style={{color: THEME.success, fontWeight:600, marginLeft:6}}>KAVIA</span>
      </footer>
    </div>
  );
}

export default App;
