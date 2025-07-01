import React, { useState } from 'react';
import { 
  Square, 
  Circle, 
  Hexagon, 
  Move,
  Edit3,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import type { ShapeTemplate, ShapeType } from '../types/warehouse';

interface ShapeTransform {
  rotation: number;
  scaleX: number;
  scaleY: number;
  flipX: boolean;
  flipY: boolean;
}

interface ShapeToolPaletteProps {
  selectedTool: ShapeType | null;
  onToolSelect: (tool: ShapeType) => void;
  onTemplateSelect: (template: ShapeTemplate) => void;
  selectedArea?: any;
  onTransformArea?: (areaId: string, transform: ShapeTransform) => void;
}

const ShapeToolPalette: React.FC<ShapeToolPaletteProps> = ({
  selectedTool,
  onToolSelect,
  onTemplateSelect,
  selectedArea,
  onTransformArea
}) => {
  const [transform, setTransform] = useState<ShapeTransform>({
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    flipX: false,
    flipY: false
  });

  // 基本形状ツール
  const basicTools = [
    { id: 'rectangle', name: '矩形', icon: Square },
    { id: 'circle', name: '円形', icon: Circle },
    { id: 'ellipse', name: '楕円', icon: Circle },
    { id: 'polygon', name: '多角形', icon: Hexagon },
    { id: 'custom', name: '自由形状', icon: Edit3 }
  ];

  // 変形操作（直接適用方式）
  const handleRotate = (degrees: number) => {
    if (!selectedArea || !onTransformArea) return;
    
    // 直接回転を適用（累積ではなく相対変更）
    onTransformArea(selectedArea.id, {
      type: 'rotate',
      value: degrees
    });
  };

  const handleScale = (scaleX: number, scaleY: number) => {
    if (!selectedArea || !onTransformArea) return;
    
    // 直接縮尺を適用（累積ではなく相対変更）
    onTransformArea(selectedArea.id, {
      type: 'scale',
      scaleX,
      scaleY
    });
  };

  const handleFlip = (axis: 'x' | 'y') => {
    if (!selectedArea || !onTransformArea) return;
    
    // 直接反転を適用
    onTransformArea(selectedArea.id, {
      type: 'flip',
      axis
    });
  };

  const resetTransform = () => {
    if (!selectedArea || !onTransformArea) return;
    
    // 直接リセットを適用
    onTransformArea(selectedArea.id, {
      type: 'reset'
    });
    
    // UI状態もリセット
    setTransform({
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      flipX: false,
      flipY: false
    });
  };



  // 形状テンプレート
  const shapeTemplates: ShapeTemplate[] = [
    {
      id: 'l-shape',
      name: 'L字型',
      description: 'L字型エリア',
      icon: '⌐',
      category: 'basic',
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 150, y: 0 },
          { x: 150, y: 80 },
          { x: 80, y: 80 },
          { x: 80, y: 200 },
          { x: 0, y: 200 }
        ]
      }
    },
    {
      id: 't-shape',
      name: 'T字型',
      description: 'T字型エリア',
      icon: '⊤',
      category: 'basic',
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 60 },
          { x: 130, y: 60 },
          { x: 130, y: 180 },
          { x: 70, y: 180 },
          { x: 70, y: 60 },
          { x: 0, y: 60 }
        ]
      }
    },
    {
      id: 'u-shape',
      name: 'U字型',
      description: 'U字型エリア',
      icon: '∪',
      category: 'basic',
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 60, y: 0 },
          { x: 60, y: 140 },
          { x: 140, y: 140 },
          { x: 140, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 200 },
          { x: 0, y: 200 }
        ]
      }
    },
    {
      id: 'cross-shape',
      name: '十字型',
      description: '十字型エリア',
      icon: '✚',
      category: 'basic',
      shape: {
        type: 'polygon',
        points: [
          { x: 70, y: 0 },
          { x: 130, y: 0 },
          { x: 130, y: 70 },
          { x: 200, y: 70 },
          { x: 200, y: 130 },
          { x: 130, y: 130 },
          { x: 130, y: 200 },
          { x: 70, y: 200 },
          { x: 70, y: 130 },
          { x: 0, y: 130 },
          { x: 0, y: 70 },
          { x: 70, y: 70 }
        ]
      }
    },
    {
      id: 'rounded-rect',
      name: '角丸矩形',
      description: '角が丸い矩形',
      icon: '▢',
      category: 'basic',
      shape: {
        type: 'rectangle',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 150 },
          { x: 0, y: 150 }
        ],
        borderRadius: 20
      }
    },
    {
      id: 'warehouse-dock',
      name: '搬入口',
      description: '搬入口エリア',
      icon: '🚛',
      category: 'industrial',
      shape: {
        type: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 120, y: 20 },
          { x: 120, y: 80 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ]
      }
    },
    {
      id: 'curved-corner',
      name: '曲線コーナー',
      description: '曲線を含むエリア',
      icon: '◗',
      category: 'complex',
      shape: {
        type: 'custom',
        bezierPoints: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { 
            x: 200, 
            y: 150, 
            controlPoint1: { x: 200, y: 50 },
            controlPoint2: { x: 200, y: 100 }
          },
          { 
            x: 50, 
            y: 150, 
            controlPoint1: { x: 150, y: 150 },
            controlPoint2: { x: 100, y: 150 }
          },
          { x: 0, y: 100 },
          { x: 0, y: 0 }
        ]
      }
    }
  ];

  return (
    <div className="bg-white border-r border-gray-200 w-64 flex flex-col">
      {/* 基本形状ツール */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">基本形状</h3>
        <div className="grid grid-cols-2 gap-2">
          {basicTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id as ShapeType)}
              className={`p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex flex-col items-center gap-1 ${
                selectedTool === tool.id ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <tool.icon className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-700">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 変形コントロール */}
      {(selectedArea && selectedArea.shape?.points) && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {selectedArea?.name} - 変形
          </h3>
          
          <div className="mb-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
            ボタンクリックで即座に変形が適用されます
          </div>
          
          {/* 回転 */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              回転（相対）
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => handleRotate(-90)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                -90°
              </button>
              <button
                onClick={() => handleRotate(-15)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                -15°
              </button>
              <button
                onClick={() => handleRotate(15)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                +15°
              </button>
              <button
                onClick={() => handleRotate(90)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                +90°
              </button>
            </div>
          </div>

          {/* 縮尺 */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              縮尺（相対）
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleScale(0.8, 0.8)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
              >
                <ZoomOut className="w-3 h-3" />
                縮小
              </button>
              <button
                onClick={() => handleScale(1.25, 1.25)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1"
              >
                <ZoomIn className="w-3 h-3" />
                拡大
              </button>
              <button
                onClick={() => handleScale(0.8, 1)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                幅縮小
              </button>
              <button
                onClick={() => handleScale(1.25, 1)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                幅拡大
              </button>
            </div>
          </div>

          {/* 反転 */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">反転</label>
            <div className="flex gap-1">
              <button
                onClick={() => handleFlip('x')}
                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1 bg-white"
              >
                <FlipHorizontal className="w-3 h-3" />
                左右
              </button>
              <button
                onClick={() => handleFlip('y')}
                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1 bg-white"
              >
                <FlipVertical className="w-3 h-3" />
                上下
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-center">
            <button
              onClick={resetTransform}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              リセット
            </button>
          </div>
        </div>
      )}

      {/* 形状テンプレート */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-900 mb-3">形状テンプレート</h3>
        
        {/* 基本形状 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">基本</h4>
          <div className="space-y-1">
            {shapeTemplates.filter(t => t.category === 'basic').map(template => (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className="w-full p-2 border border-gray-200 rounded hover:bg-gray-50 text-left transition-colors flex items-center gap-2"
              >
                <span className="text-lg">{template.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 産業用 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">産業用</h4>
          <div className="space-y-1">
            {shapeTemplates.filter(t => t.category === 'industrial').map(template => (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className="w-full p-2 border border-gray-200 rounded hover:bg-gray-50 text-left transition-colors flex items-center gap-2"
              >
                <span className="text-lg">{template.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 複雑な形状 */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">複雑な形状</h4>
          <div className="space-y-1">
            {shapeTemplates.filter(t => t.category === 'complex').map(template => (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className="w-full p-2 border border-gray-200 rounded hover:bg-gray-50 text-left transition-colors flex items-center gap-2"
              >
                <span className="text-lg">{template.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ヘルプ */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">操作方法:</div>
          <div>• 形状テンプレートをクリックで配置</div>
          <div>• エリア選択後に変形可能</div>
          <div>• ボタンクリックで即座に反映</div>
        </div>
      </div>
    </div>
  );
};

export default ShapeToolPalette; 