import React, { useRef, useEffect } from 'react';
import RoomItem from './RoomItem';

const GRID_SIZE = 24;

/**
 * PUBLIC_INTERFACE
 * @param {{
 *  rooms: Array,
 *  selectedIds: Set,
 *  onSelect: Function,
 *  onMove: Function,
 *  onResize: Function,
 *  onLabelEdit: Function,
 *  onRoomMouseDown: Function,
 *  gridEnabled: boolean,
 *  zoom: number,
 *  width: number,
 *  height: number,
 *  onDeselect: Function
 * }} props
 * The main canvas for mapping rooms, handles grid drawing, selection, and children.
 */
export default function RoomMapperCanvas({
  rooms,
  selectedIds,
  onSelect,
  onMove,
  onResize,
  onLabelEdit,
  onRoomMouseDown,
  gridEnabled,
  zoom,
  width,
  height,
  onDeselect,
}) {
  const canvasRef = useRef(null);

  // Draws grid on canvas background if enabled
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      if (gridEnabled) {
        ctx.save();
        ctx.strokeStyle = '#e5e7eb'; // grid line color—light gray
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += GRID_SIZE * zoom) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += GRID_SIZE * zoom) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }, [gridEnabled, width, height, zoom]);

  // Deselect if background clicked
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onDeselect();
    }
  };

  return (
    <div
      className="room-canvas-wrapper"
      tabIndex={0}
      style={{
        width: width,
        height: height,
        position: 'relative',
        background: 'var(--canvas-bg, #f9fafb)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 4px 16px 0 #e5e7eb77',
        border: '1.5px solid #e5e7eb',
        transition: 'box-shadow 0.2s',
        outline: 'none',
      }}
      onClick={handleBackgroundClick}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: '#f9fafb',
          pointerEvents: 'none'
        }}
        aria-hidden
      />
      {/* Render room items */}
      {rooms.map(room =>
        <RoomItem
          key={room.id}
          {...room}
          isSelected={selectedIds.has(room.id)}
          onSelect={onSelect}
          onMove={onMove}
          onResize={onResize}
          onLabelEdit={onLabelEdit}
          onRoomMouseDown={onRoomMouseDown}
          zoom={zoom}
          gridEnabled={gridEnabled}
          allSelectedIds={selectedIds}
        />
      )}
    </div>
  );
}
