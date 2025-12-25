import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Toolbar or sidebar for room actions—add, delete, label, zoom, grid.
 */
export default function RoomToolbar({
  onAddRoom, onDeleteRoom, canDelete,
  selectedLabel, onLabelChange, canEditLabel,
  onZoomIn, onZoomOut, onResetZoom, zoom,
  gridEnabled, onToggleGrid,
  selectedCount
}) {
  return (
    <div className="room-toolbar" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      padding: 24,
      background: 'var(--surface, #ffffff)',
      borderRadius: 14,
      border: '1.5px solid #e5e7eb',
      boxShadow: '0 2px 8px #e0e7ef16',
      minWidth: 240,
      marginRight: 38,
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    }}>
      <div style={{ fontWeight: 700, fontSize: 19, color: '#111827', marginBottom: 7 }}>
        Room Mapper
      </div>
      <button
        style={{ background: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 15, padding: '7px 22px', cursor: 'pointer', boxShadow: '0 1.5px 4px #3b82f616' }}
        onClick={onAddRoom}
        tabIndex={0}
        aria-label="Add new room"
      >+ Add Room</button>
      <button
        style={{
          background: canDelete ? '#EF4444' : '#f3f4f6',
          color: canDelete ? '#fff' : '#aaa',
          fontWeight: 600,
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          padding: '6px 18px',
          cursor: canDelete ? 'pointer' : 'not-allowed',
          marginBottom: 7
        }}
        onClick={onDeleteRoom}
        disabled={!canDelete}
        aria-disabled={!canDelete}
        tabIndex={canDelete ? 0 : -1}
        aria-label="Delete selected rooms"
      >🗑️ Delete Selected</button>
      <div style={{ fontSize: 15, fontWeight: 600, margin: '5px 0 2px', color: '#111827' }}>
        Label
      </div>
      <input
        type="text"
        placeholder="Edit label"
        value={selectedLabel}
        onChange={onLabelChange}
        disabled={!canEditLabel}
        style={{
          fontSize: 15,
          padding: '6px 9px',
          borderRadius: 6,
          border: '1.2px solid #e5e7eb',
          color: canEditLabel ? '#111827' : '#aaa',
          background: canEditLabel ? '#fff' : '#f6f7f9',
          outline: canEditLabel ? '2px solid #3b82f620' : 'none'
        }}
        aria-label="Edit label of selected room"
      />
      <div style={{height:1,borderBottom: '1.5px solid #e5e7eb', width:'100%',margin:'10px 0'}}></div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: '#111827' }}>Zoom</div>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center'}}>
        <button style={zoomBtnStyle} onClick={onZoomOut} aria-label="Zoom out">-</button>
        <span style={{minWidth:36,display:'inline-block',textAlign:'center', fontWeight:600, fontSize:15}}>
          {(zoom * 100).toFixed(0)}%
        </span>
        <button style={zoomBtnStyle} onClick={onZoomIn} aria-label="Zoom in">+</button>
        <button style={{...zoomBtnStyle,padding:'2px 7px'}} onClick={onResetZoom} aria-label="Reset zoom">⟳</button>
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, marginTop: 8, color: '#111827', gap: 9 }}>
        <input
          type="checkbox"
          checked={gridEnabled}
          onChange={onToggleGrid}
          style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
        />
        Grid snap
      </label>
      <div style={{fontSize: 13, color:'#64748b',marginTop:16, lineHeight:1.5}}>
        <b>Instructions:</b><br/>
        - Click <strong>'Add Room'</strong> to add a room.<br/>
        - Drag room to move, drag corners/edges to resize.<br/>
        - Double-click label to edit.<br/>
        - Select, then use <strong>Delete</strong> button or <kbd>Del</kbd> key.<br/>
        - Zoom or toggle grid.<br/>
        - <kbd>Esc</kbd> clears selection.
      </div>
      <div style={{fontSize:13, color:'#9ca3af',marginTop:8}}>Selected: {selectedCount}</div>
    </div>
  );
}
const zoomBtnStyle = {
  background: '#f3f4f6',
  color: '#3b82f6',
  border: '1.5px solid #e5e7eb',
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: '2px 9px',
  cursor: 'pointer',
  transition: 'background .13s'
};
