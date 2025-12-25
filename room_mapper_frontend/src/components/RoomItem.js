import React, { useRef, useState } from 'react';

// Returns true if point (x,y) is inside rect
function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

const COLORS = {
  border: '#3b82f6',
  handle: '#06b6d4',
  handleActive: '#0ea5e9',
  background: '#ffffff',
  backgroundSelected: '#e0f2fe'
};

const HANDLE_SIZE = 12;

const HANDLE_POSITIONS = [
  'nw','n','ne',
  'w',     'e',
  'sw','s','se'
];

function getHandleCursor(handle) {
  switch (handle) {
    case 'nw': return 'nwse-resize';
    case 'n': return 'ns-resize';
    case 'ne': return 'nesw-resize';
    case 'e': return 'ew-resize';
    case 'se': return 'nwse-resize';
    case 's': return 'ns-resize';
    case 'sw': return 'nesw-resize';
    case 'w': return 'ew-resize';
    default: return 'pointer';
  }
}

// PUBLIC_INTERFACE
/**
 * Draggable, resizable room rectangle with label and selection/hover visual cues.
 */
export default function RoomItem({
  id,
  x,
  y,
  width,
  height,
  label,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onLabelEdit,
  onRoomMouseDown,
  zoom,
  gridEnabled,
  allSelectedIds,
}) {
  const roomRef = useRef(null);
  const labelRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);

  const [dragState, setDragState] = useState(null); // {type, start, orig}

  // Calculate handles
  function getHandles() {
    const hs = HANDLE_SIZE / zoom;
    return [
      { pos: 'nw', x: x, y: y },
      { pos: 'n', x: x + width/2, y: y },
      { pos: 'ne', x: x + width, y: y },
      { pos: 'e', x: x + width, y: y + height/2 },
      { pos: 'se', x: x + width, y: y + height },
      { pos: 's', x: x + width/2, y: y + height },
      { pos: 'sw', x: x, y: y + height },
      { pos: 'w', x: x, y: y + height/2 },
    ].map(handle => ({
      ...handle,
      px: handle.x,
      py: handle.y,
    }));
  }

  // Mouse events for dragging and resizing
  const onMouseDownRoom = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    onRoomMouseDown(id, e.shiftKey); // allow for multi-select if desired
    setDragState({
      type: 'move',
      start: { x: e.clientX, y: e.clientY },
      orig: { x, y }
    });
    window.addEventListener('mousemove', onDragging);
    window.addEventListener('mouseup', onStopDrag);
  };

  const onMouseDownHandle = (handle, e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setDragState({
      type: 'resize',
      handle,
      start: { x: e.clientX, y: e.clientY },
      orig: { x, y, width, height }
    });
    window.addEventListener('mousemove', onDragging);
    window.addEventListener('mouseup', onStopDrag);
  };

  // Applies grid snapping if enabled
  function snap(val) {
    if (!gridEnabled) return val;
    const grid = 24 * zoom;
    return Math.round(val / grid) * grid;
  }

  // Drag & resize implementation
  const onDragging = (e) => {
    if (!dragState) return;
    if (dragState.type === 'move') {
      let dx = (e.clientX - dragState.start.x) / zoom;
      let dy = (e.clientY - dragState.start.y) / zoom;
      let newX = snap(dragState.orig.x + dx);
      let newY = snap(dragState.orig.y + dy);
      onMove(id, { x: newX, y: newY });
    } else if (dragState.type === 'resize') {
      const { handle, start, orig } = dragState;
      let mx = (e.clientX - start.x) / zoom;
      let my = (e.clientY - start.y) / zoom;
      let nx = orig.x, ny = orig.y, nw = orig.width, nh = orig.height;
      switch (handle) {
        case 'nw':
          nx = snap(orig.x + mx);
          ny = snap(orig.y + my);
          nw = snap(orig.width - mx);
          nh = snap(orig.height - my);
          break;
        case 'n':
          ny = snap(orig.y + my);
          nh = snap(orig.height - my);
          break;
        case 'ne':
          ny = snap(orig.y + my);
          nh = snap(orig.height - my);
          nw = snap(orig.width + mx);
          break;
        case 'e':
          nw = snap(orig.width + mx);
          break;
        case 'se':
          nw = snap(orig.width + mx);
          nh = snap(orig.height + my);
          break;
        case 's':
          nh = snap(orig.height + my);
          break;
        case 'sw':
          nx = snap(orig.x + mx);
          nw = snap(orig.width - mx);
          nh = snap(orig.height + my);
          break;
        case 'w':
          nx = snap(orig.x + mx);
          nw = snap(orig.width - mx);
          break;
        default:
          break;
      }
      // Minimum size
      nw = Math.max(32, nw);
      nh = Math.max(32, nh);
      onResize(id, { x: nx, y: ny, width: nw, height: nh });
    }
  };

  const onStopDrag = () => {
    setDragState(null);
    window.removeEventListener('mousemove', onDragging);
    window.removeEventListener('mouseup', onStopDrag);
  };

  // Inline label editing
  const handleLabelDblClick = (e) => {
    e.stopPropagation();
    setEditingLabel(true);
    setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.focus();
        labelRef.current.select();
      }
    }, 0);
  };

  const handleLabelChange = (e) => {
    onLabelEdit(id, e.target.value);
  };

  const handleLabelBlur = () => setEditingLabel(false);

  return (
    <div
      ref={roomRef}
      className="room-rect"
      tabIndex={0}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        border: isSelected ? `2.5px solid ${COLORS.border}` : hovered ? `2px dashed #60a5fa` : '2px solid #d1d5db',
        borderRadius: 9,
        background: isSelected ? COLORS.backgroundSelected : COLORS.background,
        boxShadow: isSelected || hovered ? '0 2px 6px #a5b4fc1c' : '0 1.5px 2.5px #e5e7ebaa',
        cursor: dragState ? 'grabbing' : (isSelected ? 'move' : 'pointer'),
        transition: 'border 0.14s, box-shadow 0.15s'
      }}
      onMouseDown={onMouseDownRoom}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Room: ${label} ${isSelected ? '(selected)' : ''}`}
    >
      {/* Resize handles */}
      {isSelected &&
        getHandles().map(h =>
          <div
            key={h.pos}
            style={{
              position: 'absolute',
              left: h.px - x - HANDLE_SIZE/2,
              top: h.py - y - HANDLE_SIZE/2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: 6,
              background: '#fff',
              border: `2px solid ${COLORS.handle}`,
              boxShadow: '0 1.5px 3px #60a5fa20',
              cursor: getHandleCursor(h.pos),
              zIndex: 4,
              transition: 'background .1s, border .12s'
            }}
            onMouseDown={e => onMouseDownHandle(h.pos, e)}
            title="Drag to resize"
            tabIndex={-1}
            aria-hidden
          />
        )
      }
      {/* Room label */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 8,
          right: 12,
          fontWeight: 600,
          color: '#111827',
          fontSize: 16,
          userSelect: editingLabel ? 'auto' : 'none',
          cursor: editingLabel ? 'text' : 'inherit'
        }}
        onDoubleClick={handleLabelDblClick}
        title="Double-click to edit label"
      >
        {editingLabel ? (
          <input
            ref={labelRef}
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={e => { if (e.key === 'Enter') handleLabelBlur(); }}
            style={{
              width: '98%',
              fontSize: 15,
              padding: '2px 5px',
              border: '1.2px solid #e5e7eb',
              borderRadius: 5,
              outline: '2px solid #3b82f650'
            }}
            aria-label="Edit room label"
            autoFocus
          />
        ) : (
          label
        )}
      </div>
    </div>
  );
}
