import React from 'react';

interface ResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  onResize: (newWidth: number, newHeight: number, newX?: number, newY?: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  x,
  y,
  width,
  height,
  zoom,
  onResize,
  onResizeStart,
  onResizeEnd
}) => {
  const handleSize = 8;
  const handleStyle = {
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    backgroundColor: '#3B82F6',
    border: '1px solid #1E40AF',
    borderRadius: '2px',
    position: 'absolute' as const,
    cursor: 'pointer',
    zIndex: 1000
  };

  const handleMouseDown = (corner: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onResizeStart();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = x;
      let newY = y;
      
      switch (corner) {
        case 'se': // 右下
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'sw': // 左下
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = x + (startWidth - newWidth);
          break;
        case 'ne': // 右上
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = y + (startHeight - newHeight);
          break;
        case 'nw': // 左上
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newX = x + (startWidth - newWidth);
          newY = y + (startHeight - newHeight);
          break;
        case 'e': // 右
          newWidth = Math.max(20, startWidth + deltaX);
          break;
        case 'w': // 左
          newWidth = Math.max(20, startWidth - deltaX);
          newX = x + (startWidth - newWidth);
          break;
        case 's': // 下
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'n': // 上
          newHeight = Math.max(20, startHeight - deltaY);
          newY = y + (startHeight - newHeight);
          break;
      }
      
      onResize(newWidth, newHeight, newX, newY);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onResizeEnd();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* 角のハンドル */}
      <div
        style={{
          ...handleStyle,
          left: `${(x + width) * zoom - handleSize / 2}px`,
          top: `${(y + height) * zoom - handleSize / 2}px`,
          cursor: 'se-resize'
        }}
        onMouseDown={handleMouseDown('se')}
        title="右下角をドラッグしてリサイズ"
      />
      <div
        style={{
          ...handleStyle,
          left: `${x * zoom - handleSize / 2}px`,
          top: `${(y + height) * zoom - handleSize / 2}px`,
          cursor: 'sw-resize'
        }}
        onMouseDown={handleMouseDown('sw')}
        title="左下角をドラッグしてリサイズ"
      />
      <div
        style={{
          ...handleStyle,
          left: `${(x + width) * zoom - handleSize / 2}px`,
          top: `${y * zoom - handleSize / 2}px`,
          cursor: 'ne-resize'
        }}
        onMouseDown={handleMouseDown('ne')}
        title="右上角をドラッグしてリサイズ"
      />
      <div
        style={{
          ...handleStyle,
          left: `${x * zoom - handleSize / 2}px`,
          top: `${y * zoom - handleSize / 2}px`,
          cursor: 'nw-resize'
        }}
        onMouseDown={handleMouseDown('nw')}
        title="左上角をドラッグしてリサイズ"
      />
      
      {/* 辺のハンドル */}
      <div
        style={{
          ...handleStyle,
          left: `${(x + width) * zoom - handleSize / 2}px`,
          top: `${(y + height / 2) * zoom - handleSize / 2}px`,
          cursor: 'e-resize'
        }}
        onMouseDown={handleMouseDown('e')}
        title="右辺をドラッグして幅を変更"
      />
      <div
        style={{
          ...handleStyle,
          left: `${x * zoom - handleSize / 2}px`,
          top: `${(y + height / 2) * zoom - handleSize / 2}px`,
          cursor: 'w-resize'
        }}
        onMouseDown={handleMouseDown('w')}
        title="左辺をドラッグして幅を変更"
      />
      <div
        style={{
          ...handleStyle,
          left: `${(x + width / 2) * zoom - handleSize / 2}px`,
          top: `${(y + height) * zoom - handleSize / 2}px`,
          cursor: 's-resize'
        }}
        onMouseDown={handleMouseDown('s')}
        title="下辺をドラッグして高さを変更"
      />
      <div
        style={{
          ...handleStyle,
          left: `${(x + width / 2) * zoom - handleSize / 2}px`,
          top: `${y * zoom - handleSize / 2}px`,
          cursor: 'n-resize'
        }}
        onMouseDown={handleMouseDown('n')}
        title="上辺をドラッグして高さを変更"
      />
    </>
  );
};

export default ResizeHandles; 