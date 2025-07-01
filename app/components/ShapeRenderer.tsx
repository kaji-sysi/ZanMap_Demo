import React from 'react';
import type { WarehouseArea } from '../types/warehouse';

interface ShapeRendererProps {
  area: WarehouseArea;
  zoom: number;
  isSelected: boolean;
  showControlPoints?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  area,
  zoom,
  isSelected,
  showControlPoints = false,
  onMouseDown
}) => {
  const { shape } = area;

  // 矩形エリアの場合
  if (!shape || shape.type === 'rectangle') {
    return (
      <div
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-2xl transform scale-105' 
            : 'hover:shadow-lg hover:transform hover:scale-102'
        }`}
        style={{
          left: `${area.x * zoom}px`,
          top: `${area.y * zoom}px`,
          width: `${area.width * zoom}px`,
          height: `${area.height * zoom}px`,
          backgroundColor: area.color,
          border: `2px solid ${area.borderColor}`,
          borderRadius: shape?.borderRadius ? `${shape.borderRadius}px` : '0px'
        }}
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="font-bold text-gray-800 text-lg mb-1">{area.code}</div>
            <div className="text-sm text-gray-600 font-medium">{area.name}</div>
            {area.description && (
              <div className="text-xs text-gray-500 mt-1 max-w-full truncate px-2">
                {area.description}
              </div>
            )}
          </div>
        </div>
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    );
  }

  // 円形エリアの場合
  if (shape.type === 'circle') {
    const radius = shape.radius || Math.min(area.width, area.height) / 2;
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;

    return (
      <div
        className={`absolute cursor-pointer transition-all duration-200 rounded-full ${
          isSelected 
            ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-2xl transform scale-105' 
            : 'hover:shadow-lg hover:transform hover:scale-102'
        }`}
        style={{
          left: `${(centerX - radius) * zoom}px`,
          top: `${(centerY - radius) * zoom}px`,
          width: `${radius * 2 * zoom}px`,
          height: `${radius * 2 * zoom}px`,
          backgroundColor: area.color,
          border: `2px solid ${area.borderColor}`
        }}
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="font-bold text-gray-800 text-lg mb-1">{area.code}</div>
            <div className="text-sm text-gray-600 font-medium">{area.name}</div>
            {area.description && (
              <div className="text-xs text-gray-500 mt-1 max-w-full truncate px-2">
                {area.description}
              </div>
            )}
          </div>
        </div>
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    );
  }

  // 多角形エリアの場合
  if (shape.type === 'polygon' && shape.points && shape.points.length >= 3) {
    const points = shape.points;
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${(area.x + point.x) * zoom} ${(area.y + point.y) * zoom}`
    ).join(' ') + ' Z';

    // 多角形の境界ボックスを計算
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return (
      <div className="absolute inset-0">
        <svg
          className={`absolute cursor-pointer transition-all duration-200 ${
            isSelected ? 'filter drop-shadow-2xl' : 'hover:filter hover:drop-shadow-lg'
          }`}
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <path
            d={pathData}
            fill={area.color}
            stroke={area.borderColor}
            strokeWidth="2"
            className="cursor-pointer"
            style={{ pointerEvents: 'all' }}
            onMouseDown={onMouseDown}
          />
          {isSelected && (
            <circle
              cx={(area.x + centerX) * zoom}
              cy={(area.y + centerY) * zoom}
              r="8"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
            />
          )}
        </svg>
        
        {/* テキストラベル */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${(area.x + centerX) * zoom - 50}px`,
            top: `${(area.y + centerY) * zoom - 30}px`,
            width: '100px',
            textAlign: 'center'
          }}
        >
          <div className="font-bold text-gray-800 text-lg mb-1">{area.code}</div>
          <div className="text-sm text-gray-600 font-medium">{area.name}</div>
          {area.description && (
            <div className="text-xs text-gray-500 mt-1 max-w-full truncate px-2">
              {area.description}
            </div>
          )}
        </div>

        {/* コントロールポイント表示 */}
        {showControlPoints && points.map((point, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-blue-500 border-2 border-blue-700 rounded-full cursor-pointer hover:bg-blue-600 hover:scale-125 transition-all duration-200"
            style={{
              left: `${(area.x + point.x) * zoom - 6}px`,
              top: `${(area.y + point.y) * zoom - 6}px`,
              zIndex: 10
            }}
            title={`ポイント ${index + 1}`}
          />
        ))}
      </div>
    );
  }

  // フォールバック: 不明な形状の場合は矩形として表示
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-2xl transform scale-105' 
          : 'hover:shadow-lg hover:transform hover:scale-102'
      }`}
      style={{
        left: `${area.x * zoom}px`,
        top: `${area.y * zoom}px`,
        width: `${area.width * zoom}px`,
        height: `${area.height * zoom}px`,
        backgroundColor: area.color,
        border: `2px solid ${area.borderColor}`,
        borderRadius: '4px'
      }}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="font-bold text-gray-800 text-lg mb-1">{area.code}</div>
          <div className="text-sm text-gray-600 font-medium">{area.name}</div>
          <div className="text-xs text-red-500 mt-1">不明な形状</div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ShapeRenderer; 