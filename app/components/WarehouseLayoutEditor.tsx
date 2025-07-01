import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Save, 
  Undo, 
  Redo, 
  Grid, 
  Eye,
  Plus,
  Edit3,
  Package,
  X,
  Search,
  Filter,
  RotateCw,
  Move,
  Maximize,
  FlipHorizontal,
  FlipVertical,
  RotateCcw
} from 'lucide-react';
import type { 
  WarehouseLayout, 
  WarehouseArea, 
  StorageMaster,
  LayoutStorage,
  FacilityMaster,
  LayoutFacility, 
  StorageType,
  StorageTypeMaster
} from '../types/warehouse';
import { storageMasterManager } from '../lib/storageMasterData';
import ShapeRenderer from './ShapeRenderer';

import ContextMenu from './ContextMenu';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ResizeHandles from './ResizeHandles';
import FacilityMasterSelectDialog from './FacilityMasterSelectDialog';

interface WarehouseLayoutEditorProps {
  layout: WarehouseLayout;
  onSave: (layout: WarehouseLayout) => void;
  onCancel: () => void;
}

const WarehouseLayoutEditor: React.FC<WarehouseLayoutEditorProps> = ({
  layout,
  onSave,
  onCancel
}) => {
  const [currentLayout, setCurrentLayout] = useState<WarehouseLayout>(layout);

  // propsのlayoutが変更された場合、currentLayoutを更新
  useEffect(() => {
    console.log('WarehouseLayoutEditor: レイアウトプロパティ変更', {
      newLayoutId: layout.id,
      newLayoutName: layout.name,
      currentLayoutId: currentLayout.id,
      isLayoutChanged: layout.id !== currentLayout.id
    });
    
    // レイアウトIDが変更された場合のみ更新
    if (layout.id !== currentLayout.id) {
      setCurrentLayout(layout);
      setSelectedItem(null); // 選択をクリア
    }
  }, [layout.id]); // IDのみを監視
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showPreview, setShowPreview] = useState(false);


  const [activeTab, setActiveTab] = useState<'tools' | 'properties'>('tools');
  const [showStorageMasterSelector, setShowStorageMasterSelector] = useState(false);
  const [showFacilityMasterSelector, setShowFacilityMasterSelector] = useState(false);
  const [storageMasterSearchTerm, setStorageMasterSearchTerm] = useState('');
  const [storageMasterSelectedType, setStorageMasterSelectedType] = useState<string>('all');
  const [showActiveStorageOnly, setShowActiveStorageOnly] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: any;
    type: 'area' | 'storage' | 'facility';
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: any;
    type: 'area' | 'storage' | 'facility';
  }>({ isOpen: false, item: null, type: 'area' });
  
  // 凹凸エリア編集関連の状態
  const [isCreatingPolygonArea, setIsCreatingPolygonArea] = useState(false);
  const [isEditingAreaPoints, setIsEditingAreaPoints] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);



  // マウスイベントハンドラ
  const handleMouseDown = useCallback((e: React.MouseEvent, item: any, type: 'area' | 'storage' | 'facility') => {
    e.preventDefault();
    setSelectedItem(item.id);
    setActiveTab('properties'); // アイテム選択時にプロパティタブに切り替え
    setContextMenu(null); // コンテキストメニューを閉じる

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - item.x * zoom,
      y: e.clientY - rect.top - item.y * zoom
    });
  }, [zoom]);

  // 右クリックハンドラ
  const handleRightClick = useCallback((e: React.MouseEvent, item: any, type: 'area' | 'storage' | 'facility') => {
    e.preventDefault();
    setSelectedItem(item.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedItem) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, (e.clientX - rect.left - dragOffset.x) / zoom);
    const newY = Math.max(0, (e.clientY - rect.top - dragOffset.y) / zoom);

    // グリッドスナップ
    const gridSize = 10;
    const snappedX = showGrid ? Math.round(newX / gridSize) * gridSize : newX;
    const snappedY = showGrid ? Math.round(newY / gridSize) * gridSize : newY;

    updateItemPosition(selectedItem, snappedX, snappedY);
  }, [isDragging, selectedItem, dragOffset, zoom, showGrid]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setDraggedPointIndex(null);
  }, []);

  // キャンバスクリックハンドラ（凹凸エリア作成用）
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!isCreatingPolygonArea && !isEditingAreaPoints) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    if (isCreatingPolygonArea) {
      setPolygonPoints(prev => [...prev, { x, y }]);
    }
  }, [isCreatingPolygonArea, isEditingAreaPoints, zoom]);

  // ポイントドラッグハンドラ
  const handlePointMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (!isEditingAreaPoints) return;
    e.stopPropagation();
    setDraggedPointIndex(index);
  }, [isEditingAreaPoints]);

  const handlePointMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedPointIndex === null || !isEditingAreaPoints) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    setPolygonPoints(prev => prev.map((point, index) => 
      index === draggedPointIndex ? { x, y } : point
    ));
  }, [draggedPointIndex, isEditingAreaPoints, zoom]);

  // ポイント削除ハンドラ
  const handlePointDelete = useCallback((index: number) => {
    if (polygonPoints.length <= 3) {
      alert('最低3つのポイントが必要です');
      return;
    }
    setPolygonPoints(prev => prev.filter((_, i) => i !== index));
  }, [polygonPoints.length]);

  // マウスホイールによるズーム
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 3);
      
      setZoom(newZoom);
    }
  }, [zoom]);

  // アイテム位置更新
  const updateItemPosition = (itemId: string, x: number, y: number) => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === itemId ? { ...area, x, y } : area
      ),
      storages: prev.storages?.map(storage => 
        storage.id === itemId ? { ...storage, x, y } : storage
      ) || [],
      facilities: prev.facilities.map(facility => 
        facility.id === itemId ? { ...facility, x, y } : facility
      )
    }));
  };

  // アイテム名前更新
  const updateItemName = (itemId: string, newName: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === itemId ? { ...area, name: newName } : area
      ),
      storages: prev.storages?.map(storage => 
        storage.id === itemId ? { ...storage, name: newName } : storage
      ) || [],
      facilities: prev.facilities.map(facility => 
        facility.id === itemId ? { ...facility, name: newName } : facility
      )
    }));
  };

  // アイテム説明更新
  const updateItemDescription = (itemId: string, newDescription: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === itemId ? { ...area, description: newDescription } : area
      ),
      storages: prev.storages?.map(storage => 
        storage.id === itemId ? { ...storage, description: newDescription } : storage
      ) || [],
      facilities: prev.facilities.map(facility => 
        facility.id === itemId ? { ...facility, description: newDescription } : facility
      )
    }));
  };

  // エリアの色を更新
  const updateAreaColor = (areaId: string, color: string, borderColor?: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === areaId ? { 
          ...area, 
          color,
          borderColor: borderColor || area.borderColor
        } : area
      )
    }));
  };

  // アイテムサイズ更新
  const updateItemSize = (itemId: string, width: number, height: number, x?: number, y?: number) => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(area => {
        if (area.id === itemId) {
          // エリアの場合は形状も更新
          const updatedArea = { 
            ...area, 
            width, 
            height,
            ...(x !== undefined && { x }),
            ...(y !== undefined && { y })
          };
          if (area.shape && area.shape.type === 'rectangle') {
            updatedArea.shape = {
              ...area.shape,
              points: [
                { x: 0, y: 0 },
                { x: width, y: 0 },
                { x: width, y: height },
                { x: 0, y: height }
              ]
            };
          }
          return updatedArea;
        }
        return area;
      }),
      storages: prev.storages?.map(storage => 
        storage.id === itemId ? { 
          ...storage, 
          width, 
          height,
          ...(x !== undefined && { x }),
          ...(y !== undefined && { y })
        } : storage
      ) || [],
      facilities: prev.facilities.map(facility => 
        facility.id === itemId ? { 
          ...facility, 
          width, 
          height,
          ...(x !== undefined && { x }),
          ...(y !== undefined && { y })
        } : facility
      )
    }));
  };

  // 削除確認ダイアログを表示
  const showDeleteConfirm = (item: any, type: 'area' | 'storage' | 'facility') => {
    setDeleteDialog({
      isOpen: true,
      item,
      type
    });
  };

  // アイテム削除（確認後）
  const handleDeleteItem = (itemId: string, type: 'area' | 'storage' | 'facility') => {
    setCurrentLayout(prev => ({
      ...prev,
      areas: type === 'area' ? prev.areas.filter(a => a.id !== itemId) : prev.areas,
      storages: type === 'storage' ? (prev.storages?.filter(s => s.id !== itemId) || []) : (prev.storages || []),
      facilities: type === 'facility' ? prev.facilities.filter(f => f.id !== itemId) : prev.facilities
    }));
    setSelectedItem(null);
  };

  // コンテキストメニューのハンドラ
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleContextMenuDelete = () => {
    if (contextMenu) {
      showDeleteConfirm(contextMenu.item, contextMenu.type);
    }
  };



  // 置き場マスタから置き場を追加
  const addStorageFromMaster = (storageMaster: StorageMaster, x: number = 100, y: number = 100) => {
    const newStorage: LayoutStorage = {
      ...storageMaster,
      id: `storage_${Date.now()}`,
      areaId: currentLayout.areas[0]?.id || '',
      x,
      y
    };

    setCurrentLayout(prev => ({
      ...prev,
      storages: [...(prev.storages || []), newStorage]
    }));

    setSelectedItem(newStorage.id);
    setShowStorageMasterSelector(false);
  };





  // 設備マスタから設備を追加
  const addFacilityFromMaster = (facilityMaster: FacilityMaster, x: number = 100, y: number = 100) => {
    const facilityDefaults: Record<string, { width: number; height: number }> = {
      entrance: { width: 120, height: 60 },
      exit: { width: 120, height: 60 },
      office: { width: 150, height: 100 },
      storage: { width: 200, height: 120 },
      workstation: { width: 100, height: 80 },
      loading: { width: 180, height: 100 },
      shipping: { width: 180, height: 100 },
      meeting: { width: 140, height: 90 },
      restroom: { width: 100, height: 80 },
      safety: { width: 80, height: 80 }
    };
    
    const defaults = facilityDefaults[facilityMaster.type] || { width: 100, height: 80 };
    
    const newFacility: LayoutFacility = {
      id: `facility_${Date.now()}`,
      type: facilityMaster.type,
      name: `${facilityMaster.name}_${currentLayout.facilities.length + 1}`,
      x: x,
      y: y,
      width: defaults.width,
      height: defaults.height,
      isActive: facilityMaster.isActive
    };

    setCurrentLayout(prev => ({
      ...prev,
      facilities: [...prev.facilities, newFacility]
    }));

    setSelectedItem(newFacility.id);
    setShowFacilityMasterSelector(false);
  };

  // 新しいエリアを追加
  const addNewArea = () => {
    const newArea: WarehouseArea = {
      id: `area_${Date.now()}`,
      name: `エリア${currentLayout.areas.length + 1}`,
      code: String.fromCharCode(65 + currentLayout.areas.length), // A, B, C...
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color: '#EBF8FF',
      borderColor: '#3182CE',
      description: '新しいエリア',
      isActive: true,
      shape: {
        type: 'rectangle',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 150 },
          { x: 0, y: 150 }
        ]
      }
    };

    setCurrentLayout(prev => ({
      ...prev,
      areas: [...prev.areas, newArea]
    }));
  };

  // 凹凸エリア作成開始
  const startCreatingPolygonArea = () => {
    setIsCreatingPolygonArea(true);
    setIsEditingAreaPoints(false);
    setPolygonPoints([]);
    setSelectedItem(null);
  };

  // 凹凸エリア作成完了
  const finishCreatingPolygonArea = () => {
    if (polygonPoints.length < 3) {
      alert('最低3つのポイントが必要です');
      return;
    }

    // 境界ボックスを計算
    const minX = Math.min(...polygonPoints.map(p => p.x));
    const maxX = Math.max(...polygonPoints.map(p => p.x));
    const minY = Math.min(...polygonPoints.map(p => p.y));
    const maxY = Math.max(...polygonPoints.map(p => p.y));
    
    const width = Math.max(maxX - minX, 50);
    const height = Math.max(maxY - minY, 50);
    
    // 相対座標に変換
    const normalizedPoints = polygonPoints.map(point => ({
      x: point.x - minX,
      y: point.y - minY
    }));

    const newArea: WarehouseArea = {
      id: `area_${Date.now()}`,
      name: `凹凸エリア${currentLayout.areas.length + 1}`,
      code: String.fromCharCode(65 + currentLayout.areas.length),
      x: minX,
      y: minY,
      width,
      height,
      color: '#F0FDF4',
      borderColor: '#16A34A',
      description: '凹凸エリア',
      isActive: true,
      shape: {
        type: 'polygon',
        points: normalizedPoints
      }
    };

    setCurrentLayout(prev => ({
      ...prev,
      areas: [...prev.areas, newArea]
    }));

    // 作成モードを終了
    setIsCreatingPolygonArea(false);
    setPolygonPoints([]);
    setSelectedItem(newArea.id);
  };

  // 凹凸エリア作成キャンセル
  const cancelCreatingPolygonArea = () => {
    setIsCreatingPolygonArea(false);
    setPolygonPoints([]);
  };

  // エリアのポイント編集開始
  const startEditingAreaPoints = (areaId: string) => {
    const area = currentLayout.areas.find(a => a.id === areaId);
    if (!area || area.shape?.type !== 'polygon') return;

    setIsEditingAreaPoints(true);
    setIsCreatingPolygonArea(false);
    setSelectedItem(areaId);
    
    // 絶対座標に変換
    const absolutePoints = area.shape.points.map(point => ({
      x: point.x + area.x,
      y: point.y + area.y
    }));
    setPolygonPoints(absolutePoints);
  };

  // エリアのポイント編集完了
  const finishEditingAreaPoints = () => {
    if (!selectedItem || polygonPoints.length < 3) return;

    const area = currentLayout.areas.find(a => a.id === selectedItem);
    if (!area) return;

    // 境界ボックスを再計算
    const minX = Math.min(...polygonPoints.map(p => p.x));
    const maxX = Math.max(...polygonPoints.map(p => p.x));
    const minY = Math.min(...polygonPoints.map(p => p.y));
    const maxY = Math.max(...polygonPoints.map(p => p.y));
    
    const width = Math.max(maxX - minX, 50);
    const height = Math.max(maxY - minY, 50);
    
    // 相対座標に変換
    const normalizedPoints = polygonPoints.map(point => ({
      x: point.x - minX,
      y: point.y - minY
    }));

    setCurrentLayout(prev => ({
      ...prev,
      areas: prev.areas.map(a => 
        a.id === selectedItem ? {
          ...a,
          x: minX,
          y: minY,
          width,
          height,
          shape: {
            ...a.shape!,
            points: normalizedPoints
          }
        } : a
      )
    }));

    setIsEditingAreaPoints(false);
    setPolygonPoints([]);
  };

  // エリアのポイント編集キャンセル
  const cancelEditingAreaPoints = () => {
    setIsEditingAreaPoints(false);
    setPolygonPoints([]);
  };



  // エリア操作ツール（新実装）
  const transformArea = (areaId: string, operation: any) => {
    if (!areaId) {
      console.error('Transform area: areaId is required');
      return;
    }
    
    console.log('Transform area:', areaId, operation);
    
    setCurrentLayout(prev => {
      const updatedAreas = prev.areas.map(area => {
        if (area.id !== areaId) return area;
        
        console.log('Original area:', area);
        console.log('Operation:', operation);

        switch (operation.type) {
          case 'rotate':
            // 回転処理：エリア全体を回転
            const angle = operation.value || 0;
            console.log(`Rotating area ${area.name} by ${angle} degrees`);
            const rotatedArea = rotateArea(area, angle);
            console.log('Rotated area:', rotatedArea);
            return rotatedArea;

          case 'scale':
            // 縮尺処理：エリア全体を拡大・縮小
            const scaleX = operation.scaleX || 1;
            const scaleY = operation.scaleY || 1;
            const scaledArea = scaleArea(area, scaleX, scaleY);
            console.log('Scaled area:', scaledArea);
            return scaledArea;

          case 'flip':
            // 反転処理：エリア全体を反転
            const flippedArea = flipArea(area, operation.axis);
            console.log('Flipped area:', flippedArea);
            return flippedArea;

          default:
            console.warn('Unknown operation type:', operation.type);
            return area;
        }
      });
      
      return {
        ...prev,
        areas: updatedAreas,
        updatedAt: new Date().toISOString()
      };
    });
  };

  // エリア回転処理
  const rotateArea = (area: WarehouseArea, angleDegrees: number) => {
    // 形状データが存在しない場合は、デフォルトの矩形形状を作成
    if (!area.shape?.points || area.shape.points.length === 0) {
      area = {
        ...area,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: area.width, y: 0 },
            { x: area.width, y: area.height },
            { x: 0, y: area.height }
          ]
        }
      };
    }
    
    // 矩形エリアの場合は特別処理（位置を固定し、形状のみ回転）
    if (area.shape.type === 'rectangle') {
      console.log(`Rectangle rotation for ${area.name}: ${angleDegrees}°`);
      console.log(`  Maintaining position: (${area.x}, ${area.y}) and size: ${area.width}×${area.height}`);
      
      // 元のサイズを基準に形状を回転
      const originalWidth = area.width;
      const originalHeight = area.height;
      const centerX = originalWidth / 2;
      const centerY = originalHeight / 2;
      
      const angle = (angleDegrees * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // 元の矩形の頂点を回転
      const originalPoints = [
        { x: 0, y: 0 },
        { x: originalWidth, y: 0 },
        { x: originalWidth, y: originalHeight },
        { x: 0, y: originalHeight }
      ];
      
      const rotatedPoints = originalPoints.map(point => {
        const x = point.x - centerX;
        const y = point.y - centerY;
        
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        
        return {
          x: Math.round(rotatedX + centerX),
          y: Math.round(rotatedY + centerY)
        };
      });
      
      return {
        ...area,
        shape: {
          ...area.shape,
          points: rotatedPoints
        }
      };
    }
    
    // 非矩形エリアの場合は従来の処理
    const absoluteCenterX = area.x + area.width / 2;
    const absoluteCenterY = area.y + area.height / 2;
    
    const angle = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const centerX = area.width / 2;
    const centerY = area.height / 2;
    
    const rotatedPoints = area.shape.points.map(point => {
      const x = point.x - centerX;
      const y = point.y - centerY;
      
      const rotatedX = x * cos - y * sin;
      const rotatedY = x * sin + y * cos;
      
      return {
        x: rotatedX + centerX,
        y: rotatedY + centerY
      };
    });
    
    const minX = Math.min(...rotatedPoints.map(p => p.x));
    const maxX = Math.max(...rotatedPoints.map(p => p.x));
    const minY = Math.min(...rotatedPoints.map(p => p.y));
    const maxY = Math.max(...rotatedPoints.map(p => p.y));
    
    const normalizedPoints = rotatedPoints.map(point => ({
      x: Math.round(point.x - minX),
      y: Math.round(point.y - minY)
    }));
    
    const newWidth = Math.ceil(Math.max(maxX - minX, 50));
    const newHeight = Math.ceil(Math.max(maxY - minY, 50));
    
    const newX = Math.max(0, Math.round(absoluteCenterX - newWidth / 2));
    const newY = Math.max(0, Math.round(absoluteCenterY - newHeight / 2));
    
    console.log(`Non-rectangle rotation for ${area.name}: ${angleDegrees}°`);
    console.log(`  Position: (${area.x}, ${area.y}) → (${newX}, ${newY})`);
    console.log(`  Size: ${area.width}×${area.height} → ${newWidth}×${newHeight}`);
    
    return {
      ...area,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      shape: {
        ...area.shape,
        points: normalizedPoints
      }
    };
  };

  // エリア縮尺処理
  const scaleArea = (area: WarehouseArea, scaleX: number, scaleY: number) => {
    // 形状データが存在しない場合は、デフォルトの矩形形状を作成
    if (!area.shape?.points || area.shape.points.length === 0) {
      area = {
        ...area,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: area.width, y: 0 },
            { x: area.width, y: area.height },
            { x: 0, y: area.height }
          ]
        }
      };
    }
    
    // 縮尺の最小・最大値をチェック
    const clampedScaleX = Math.max(0.1, Math.min(5, scaleX));
    const clampedScaleY = Math.max(0.1, Math.min(5, scaleY));
    
    const centerX = area.width / 2;
    const centerY = area.height / 2;
    
    // 形状の頂点を縮尺
    const scaledPoints = area.shape.points.map(point => {
      const x = (point.x - centerX) * clampedScaleX + centerX;
      const y = (point.y - centerY) * clampedScaleY + centerY;
      
      return { x, y };
    });
    
    // 縮尺後の境界ボックスを計算
    const minX = Math.min(...scaledPoints.map(p => p.x));
    const maxX = Math.max(...scaledPoints.map(p => p.x));
    const minY = Math.min(...scaledPoints.map(p => p.y));
    const maxY = Math.max(...scaledPoints.map(p => p.y));
    
    const newWidth = Math.ceil(Math.abs(maxX - minX));
    const newHeight = Math.ceil(Math.abs(maxY - minY));
    
    // 座標を正規化
    const normalizedPoints = scaledPoints.map(point => ({
      x: Math.round(point.x - minX),
      y: Math.round(point.y - minY)
    }));
    
    // 元の中心位置を維持
    const originalCenterX = area.x + area.width / 2;
    const originalCenterY = area.y + area.height / 2;
    
    const newX = Math.max(0, Math.round(originalCenterX - newWidth / 2));
    const newY = Math.max(0, Math.round(originalCenterY - newHeight / 2));
    
    return {
      ...area,
      x: newX,
      y: newY,
      width: Math.max(50, newWidth),
      height: Math.max(50, newHeight),
      shape: {
        ...area.shape,
        points: normalizedPoints
      }
    };
  };

  // エリア反転処理
  const flipArea = (area: WarehouseArea, axis: 'x' | 'y') => {
    // 形状データが存在しない場合は、デフォルトの矩形形状を作成
    if (!area.shape?.points || area.shape.points.length === 0) {
      area = {
        ...area,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: area.width, y: 0 },
            { x: area.width, y: area.height },
            { x: 0, y: area.height }
          ]
        }
      };
    }
    
    // 形状の頂点を反転
    let flippedPoints = area.shape.points.map(point => {
      if (axis === 'x') {
        // 水平反転
        return {
          x: area.width - point.x,
          y: point.y
        };
      } else {
        // 垂直反転
        return {
          x: point.x,
          y: area.height - point.y
        };
      }
    });
    
    // 正方形の矩形の場合、反転効果を視覚的に分かりやすくするため、
    // 形状を少し変形させる
    if (area.shape.type === 'rectangle' && area.width === area.height) {
      if (axis === 'x') {
        // 水平反転時：右上角を少し内側に移動
        flippedPoints = [
          { x: 0, y: 0 },
          { x: area.width - 20, y: 0 },
          { x: area.width, y: 20 },
          { x: area.width, y: area.height },
          { x: 0, y: area.height }
        ];
      } else {
        // 垂直反転時：左下角を少し内側に移動
        flippedPoints = [
          { x: 0, y: 0 },
          { x: area.width, y: 0 },
          { x: area.width, y: area.height },
          { x: 20, y: area.height },
          { x: 0, y: area.height - 20 }
        ];
      }
    }
    
    return {
      ...area,
      shape: {
        ...area.shape,
        points: flippedPoints
      }
    };
  };





  // 選択されたエリアを取得
  const getSelectedArea = () => {
    return currentLayout.areas.find(area => area.id === selectedItem);
  };

  // 選択されたアイテムを取得
  const getSelectedItem = () => {
    if (!selectedItem) return null;
    
    const area = currentLayout.areas.find(a => a.id === selectedItem);
    if (area) return { ...area, type: 'area' };
    
    const storage = currentLayout.storages?.find(s => s.id === selectedItem);
    if (storage) return { ...storage, type: 'storage' };
    
    const facility = currentLayout.facilities.find(f => f.id === selectedItem);
    if (facility) return { ...facility, type: 'facility' };
    
    return null;
  };

  // 置き場マスタのフィルタリング
  const getFilteredStorageMasters = () => {
    let filtered = showActiveStorageOnly 
      ? storageMasterManager.getActiveStorageMasters()
      : storageMasterManager.getAllStorageMasters();

    // 検索フィルタ
    if (storageMasterSearchTerm) {
      const lowerSearch = storageMasterSearchTerm.toLowerCase();
      filtered = filtered.filter(storage =>
        storage.name.toLowerCase().includes(lowerSearch) ||
        storage.code.toLowerCase().includes(lowerSearch)
      );
    }

    // タイプフィルタ
    if (storageMasterSelectedType !== 'all') {
      filtered = filtered.filter(storage => storage.storageType === storageMasterSelectedType);
    }

    return filtered;
  };

  return (
    <div className="flex h-screen bg-gray-100">

      
      {/* ツールパネル */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* コンパクトヘッダー */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold text-white">レイアウト編集</h2>
              <p className="text-xs text-blue-100">{currentLayout.name} v{currentLayout.version}</p>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'tools'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>🛠️</span>
              ツール
            </div>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'properties'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>⚙️</span>
              プロパティ
            </div>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tools' && (
            <div className="space-y-4 p-4">
              {/* クイックツール */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-all ${
                    showGrid 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="グリッド表示切替"
                >
                  <Grid className="w-3 h-3" />
                </button>
              </div>

              {/* 置き場追加パレット */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📦</span> 置き場を追加
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowStorageMasterSelector(true)}
                    className="w-full p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                  >
                    <Package className="w-4 h-4" />
                    置き場マスタ選択
                  </button>
                </div>
              </div>

              {/* 設備追加パレット */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🏗️</span> 設備を追加
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowFacilityMasterSelector(true)}
                    className="w-full p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                  >
                    <Package className="w-4 h-4" />
                    設備マスタから選択
                  </button>
                </div>
              </div>

              {/* エリア管理 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🏢</span> エリア管理
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={addNewArea}
                    className="w-full p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    矩形エリア
                  </button>
                  <button
                    onClick={startCreatingPolygonArea}
                    disabled={isCreatingPolygonArea || isEditingAreaPoints}
                    className="w-full p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                  >
                    <span>🔧</span>
                    凹凸エリア
                  </button>
                  {/* 凹凸エリア作成中のコントロール */}
                  {isCreatingPolygonArea && (
                    <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs font-medium text-yellow-800 mb-2">
                        🔧 凹凸エリア作成中
                      </div>
                      <div className="text-xs text-yellow-700 mb-2">
                        クリックして頂点を追加（{polygonPoints.length}個）
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={finishCreatingPolygonArea}
                          disabled={polygonPoints.length < 3}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                        >
                          ✓ 完了
                        </button>
                        <button
                          onClick={cancelCreatingPolygonArea}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                        >
                          ✗ キャンセル
                        </button>
                      </div>
                    </div>
                  )}

                  {/* エリア編集中のコントロール */}
                  {isEditingAreaPoints && (
                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-medium text-blue-800 mb-2">
                        ✏️ ポイント編集中
                      </div>
                      <div className="text-xs text-blue-700 mb-2">
                        ポイントをドラッグして移動、ダブルクリックで削除
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={finishEditingAreaPoints}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                        >
                          ✓ 保存
                        </button>
                        <button
                          onClick={cancelEditingAreaPoints}
                          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                        >
                          ✗ キャンセル
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedItem && getSelectedItem()?.type === 'area' && !isCreatingPolygonArea && !isEditingAreaPoints && (
                    <>
                      <button
                        onClick={() => {
                          const item = getSelectedItem();
                          if (item) {
                            showDeleteConfirm(item, 'area');
                          }
                        }}
                        className="w-full p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        選択エリアを削除
                      </button>
                      
                      {/* 凹凸エリアの場合はポイント編集ボタンを表示 */}
                      {(() => {
                        const item = getSelectedItem();
                        return item && 'shape' in item && item.shape?.type === 'polygon' ? (
                          <button
                            onClick={() => startEditingAreaPoints(selectedItem)}
                            className="w-full p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                          >
                            <span>✏️</span>
                            ポイント編集
                          </button>
                        ) : null;
                      })()}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const item = getSelectedItem();
                            if (item && item.type === 'area') {
                              transformArea(selectedItem, { type: 'rotate', value: 90 });
                            }
                          }}
                          className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                          title="90度回転"
                        >
                          <RotateCw className="w-3 h-3" />
                          90°
                        </button>
                        <button
                          onClick={() => {
                            const item = getSelectedItem();
                            if (item && item.type === 'area') {
                              transformArea(selectedItem, { type: 'flip', axis: 'x' });
                            }
                          }}
                          className="p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
                          title="水平反転"
                        >
                          <FlipHorizontal className="w-3 h-3" />
                          反転
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* クイックアクション */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>⚡</span> その他のアクション
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-xs font-medium transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    プレビュー
                  </button>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="p-4">
              {selectedItem ? (() => {
                const item = getSelectedItem();
                if (!item) return null;
                
                const typeIcon = item.type === 'area' ? '🏢' : item.type === 'shelf' ? '📦' : '🔧';
                const typeName = item.type === 'area' ? 'エリア' : item.type === 'shelf' ? '棚' : '設備';
                
                return (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>{typeIcon}</span> {typeName}の設定
                      {item.type === 'area' && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          ID: {item.id.split('_').pop()}
                        </span>
                      )}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          名前
                        </label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => updateItemName(selectedItem, e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="アイテム名を入力"
                        />
                      </div>
                      
                      {item.description !== undefined && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            説明
                          </label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => updateItemDescription(selectedItem, e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="説明を入力"
                            rows={2}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            X座標
                          </label>
                          <input
                            type="number"
                            value={Math.round(item.x)}
                            onChange={(e) => updateItemPosition(selectedItem, parseFloat(e.target.value) || 0, item.y)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Y座標
                          </label>
                          <input
                            type="number"
                            value={Math.round(item.y)}
                            onChange={(e) => updateItemPosition(selectedItem, item.x, parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            幅
                          </label>
                          <input
                            type="number"
                            value={Math.round(item.width)}
                            onChange={(e) => updateItemSize(selectedItem, parseFloat(e.target.value) || 20, item.height)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            min="20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            高さ
                          </label>
                          <input
                            type="number"
                            value={Math.round(item.height)}
                            onChange={(e) => updateItemSize(selectedItem, item.width, parseFloat(e.target.value) || 20)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            min="20"
                          />
                        </div>
                      </div>



                      {/* エリアの色設定 */}
                      {item.type === 'area' && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                            🎨 色設定
                          </h4>
                          
                          {/* 塗りつぶし色 */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                塗りつぶし色
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={item.color || '#EBF8FF'}
                                  onChange={(e) => updateAreaColor(selectedItem, e.target.value)}
                                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                                  title="塗りつぶし色を選択"
                                />
                                <input
                                  type="text"
                                  value={item.color || '#EBF8FF'}
                                  onChange={(e) => updateAreaColor(selectedItem, e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs font-mono"
                                  placeholder="#FFFFFF"
                                />
                              </div>
                            </div>

                            {/* 境界線色 */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                境界線色
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={item.borderColor || '#3182CE'}
                                  onChange={(e) => updateAreaColor(selectedItem, item.color, e.target.value)}
                                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                                  title="境界線色を選択"
                                />
                                <input
                                  type="text"
                                  value={item.borderColor || '#3182CE'}
                                  onChange={(e) => updateAreaColor(selectedItem, item.color, e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs font-mono"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>

                            {/* プリセット色 */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                プリセット色
                              </label>
                              <div className="grid grid-cols-6 gap-1">
                                {[
                                  { fill: '#EBF8FF', border: '#3182CE', name: 'ブルー' },
                                  { fill: '#F0FDF4', border: '#16A34A', name: 'グリーン' },
                                  { fill: '#FEF3C7', border: '#D97706', name: 'イエロー' },
                                  { fill: '#FECACA', border: '#DC2626', name: 'レッド' },
                                  { fill: '#E0E7FF', border: '#7C3AED', name: 'パープル' },
                                  { fill: '#F3E8FF', border: '#A855F7', name: 'ピンク' },
                                  { fill: '#ECFDF5', border: '#059669', name: 'エメラルド' },
                                  { fill: '#FFF7ED', border: '#EA580C', name: 'オレンジ' },
                                  { fill: '#F1F5F9', border: '#475569', name: 'グレー' },
                                  { fill: '#FFFBEB', border: '#92400E', name: 'アンバー' },
                                  { fill: '#FDF2F8', border: '#BE185D', name: 'ローズ' },
                                  { fill: '#F0F9FF', border: '#0369A1', name: 'スカイ' }
                                ].map((preset, index) => (
                                  <button
                                    key={index}
                                    onClick={() => updateAreaColor(selectedItem, preset.fill, preset.border)}
                                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                                    style={{ 
                                      backgroundColor: preset.fill, 
                                      borderColor: preset.border 
                                    }}
                                    title={preset.name}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* 色のリセット */}
                            <button
                              onClick={() => updateAreaColor(selectedItem, '#EBF8FF', '#3182CE')}
                              className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs transition-colors"
                            >
                              デフォルト色にリセット
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 置き場固有の情報 */}
                      {item.type === 'storage' && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">置き場情報</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">段数:</span>
                              <span className="ml-1 font-medium">{item.rows}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">列数:</span>
                              <span className="ml-1 font-medium">{item.columns}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">階層:</span>
                              <span className="ml-1 font-medium">{item.levels}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">タイプ:</span>
                              <span className="font-medium">{storageMasterManager.getStorageTypeName(item.storageType)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* エリアの操作ツール */}
                      {item.type === 'area' && item.shape?.points && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            エリア操作ツール
                          </h4>
                          
                          {/* クイック操作ボタン */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'rotate', value: 45 })}
                              className="flex items-center justify-center gap-1 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs"
                              title="45度回転"
                            >
                              <RotateCw className="w-3 h-3" />
                              45°回転
                            </button>
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'rotate', value: -45 })}
                              className="flex items-center justify-center gap-1 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs"
                              title="45度逆回転"
                            >
                              <RotateCcw className="w-3 h-3" />
                              -45°回転
                            </button>
                          </div>

                          {/* 反転操作 */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'flip', axis: 'x' })}
                              className="flex items-center justify-center gap-1 p-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs"
                              title="水平反転"
                            >
                              <FlipHorizontal className="w-3 h-3" />
                              水平反転
                            </button>
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'flip', axis: 'y' })}
                              className="flex items-center justify-center gap-1 p-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs"
                              title="垂直反転"
                            >
                              <FlipVertical className="w-3 h-3" />
                              垂直反転
                            </button>
                          </div>

                          {/* 縮尺操作 */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'scale', scaleX: 1.2, scaleY: 1.2 })}
                              className="flex items-center justify-center gap-1 p-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors text-xs"
                              title="120%拡大"
                            >
                              <Maximize className="w-3 h-3" />
                              拡大
                            </button>
                            <button
                              onClick={() => transformArea(selectedItem, { type: 'scale', scaleX: 0.8, scaleY: 0.8 })}
                              className="flex items-center justify-center gap-1 p-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-xs"
                              title="80%縮小"
                            >
                              <Maximize className="w-3 h-3 transform rotate-180" />
                              縮小
                            </button>
                          </div>

                          {/* カスタム回転 */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              カスタム回転 (度)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="角度"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = parseFloat((e.target as HTMLInputElement).value);
                                    if (!isNaN(value)) {
                                      transformArea(selectedItem, { type: 'rotate', value });
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                  const value = parseFloat(input.value);
                                  if (!isNaN(value)) {
                                    transformArea(selectedItem, { type: 'rotate', value });
                                    input.value = '';
                                  }
                                }}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                              >
                                適用
                              </button>
                            </div>
                          </div>

                          {/* カスタム縮尺 */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              カスタム縮尺 (%)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="100"
                                min="10"
                                max="500"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = parseFloat((e.target as HTMLInputElement).value);
                                    if (!isNaN(value) && value > 0) {
                                      const scale = value / 100;
                                      transformArea(selectedItem, { type: 'scale', scaleX: scale, scaleY: scale });
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                  const value = parseFloat(input.value);
                                  if (!isNaN(value) && value > 0) {
                                    const scale = value / 100;
                                    transformArea(selectedItem, { type: 'scale', scaleX: scale, scaleY: scale });
                                    input.value = '';
                                  }
                                }}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                              >
                                適用
                              </button>
                            </div>
                          </div>




                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👆</div>
                  <p className="text-sm">アイテムを選択してください</p>
                  <p className="text-xs mt-1">棚、エリア、設備をクリック</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="p-4 border-t border-gray-200 bg-white mt-auto">
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('WarehouseLayoutEditor: 保存ボタンクリック', {
                  currentLayoutId: currentLayout.id,
                  currentLayoutName: currentLayout.name,
                  originalLayoutId: layout.id,
                  originalLayoutName: layout.name,
                  layoutsAreEqual: currentLayout.id === layout.id
                });
                onSave(currentLayout);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 text-sm font-bold transition-all duration-200 hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-all duration-200"
            >
              キャンセル
            </button>
          </div>
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-500">
              💡 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> で保存
            </div>
          </div>
        </div>
      </div>

      {/* キャンバス */}
      <div className="flex-1 flex flex-col">
        {/* キャンバスツールバー */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">ズーム:</span>
              <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm">
                <button
                  onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                  className="px-3 py-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                  title="縮小"
                >
                  <span className="text-lg font-bold text-gray-600">−</span>
                </button>
                <div className="px-4 py-2 text-sm font-bold text-gray-900 min-w-[4rem] text-center border-x border-gray-200">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="px-3 py-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                  title="拡大"
                >
                  <span className="text-lg font-bold text-gray-600">＋</span>
                </button>
              </div>
              <button
                onClick={() => setZoom(1)}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                title="100%に戻す"
              >
                リセット
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">編集モード</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="元に戻す (Ctrl+Z)"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="やり直し (Ctrl+Y)"
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* キャンバス本体 */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div
            ref={canvasRef}
            className="relative bg-white m-4 border border-gray-300 shadow-sm"
            style={{
              width: `${currentLayout.width * zoom}px`,
              height: `${currentLayout.height * zoom}px`,
              minWidth: '800px',
              minHeight: '600px'
            }}
            onMouseMove={draggedPointIndex !== null ? handlePointMouseMove : handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleCanvasClick}
          >
            {/* グリッド */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${10 * zoom}px ${10 * zoom}px`
                }}
              />
            )}

            {/* エリア */}
            {currentLayout.areas.map(area => (
              <div
                key={area.id}
                onContextMenu={(e) => handleRightClick(e, area, 'area')}
              >
                <ShapeRenderer
                  area={area}
                  zoom={zoom}
                  isSelected={selectedItem === area.id}
                  showControlPoints={false}
                  onMouseDown={(e) => handleMouseDown(e, area, 'area')}
                />
              </div>
            ))}

            {/* 置き場 */}
            {(currentLayout.storages || []).map(storage => (
              <div
                key={storage.id}
                className={`absolute border-2 bg-white cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
                  selectedItem === storage.id 
                    ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-2xl transform scale-105' 
                    : 'hover:shadow-lg hover:transform hover:scale-102'
                }`}
                style={{
                  left: `${storage.x * zoom}px`,
                  top: `${storage.y * zoom}px`,
                  width: `${storage.width * zoom}px`,
                  height: `${storage.height * zoom}px`,
                  borderColor: storageMasterManager.getStorageTypeColor(storage.storageType),
                  borderRadius: '8px'
                }}
                onMouseDown={(e) => handleMouseDown(e, storage, 'storage')}
                onContextMenu={(e) => handleRightClick(e, storage, 'storage')}
              >
                <div className="flex items-center justify-center h-full text-xs">
                  <div className="text-center">
                    <div className="text-2xl mb-1 transform transition-transform duration-200 hover:scale-110">
                      {storageMasterManager.getStorageTypeIcon(storage.storageType)}
                    </div>
                    <div className="font-bold text-gray-800 truncate max-w-full px-1">{storage.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {storage.rows}×{storage.columns}
                    </div>
                  </div>
                </div>
                {selectedItem === storage.id && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}

            {/* 設備 */}
            {currentLayout.facilities.map(facility => (
              <div
                key={facility.id}
                className={`absolute bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
                  selectedItem === facility.id 
                    ? 'ring-4 ring-green-400 ring-opacity-50 shadow-2xl transform scale-105' 
                    : 'hover:shadow-lg hover:transform hover:scale-102'
                }`}
                style={{
                  left: `${facility.x * zoom}px`,
                  top: `${facility.y * zoom}px`,
                  width: `${facility.width * zoom}px`,
                  height: `${facility.height * zoom}px`,
                  borderRadius: '8px'
                }}
                onMouseDown={(e) => handleMouseDown(e, facility, 'facility')}
                onContextMenu={(e) => handleRightClick(e, facility, 'facility')}
              >
                <div className="flex items-center justify-center h-full text-xs font-bold text-gray-800">
                  <div className="text-center">
                    <div className="text-lg mb-1">
                      {(() => {
                        const facilityIcons: Record<string, string> = {
                          entrance: '🚪',
                          exit: '🚪',
                          office: '🏢',
                          storage: '📦',
                          workstation: '🔧',
                          loading: '🚛',
                          shipping: '📦',
                          meeting: '🏛️',
                          restroom: '☕',
                          safety: '🚨'
                        };
                        return facilityIcons[facility.type] || '🔧';
                      })()}
                    </div>
                    <div className="truncate max-w-full px-1">{facility.name}</div>
                  </div>
                </div>
                {selectedItem === facility.id && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}

            {/* 凹凸エリア作成中のポイント表示 */}
            {(isCreatingPolygonArea || isEditingAreaPoints) && polygonPoints.map((point, index) => (
              <div
                key={index}
                className={`absolute w-3 h-3 border-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isEditingAreaPoints 
                    ? 'bg-blue-500 border-blue-700 hover:bg-blue-600 hover:scale-125' 
                    : 'bg-yellow-400 border-yellow-600'
                } ${draggedPointIndex === index ? 'scale-150 z-20' : 'z-10'}`}
                style={{
                  left: `${point.x * zoom - 6}px`,
                  top: `${point.y * zoom - 6}px`,
                }}
                onMouseDown={(e) => handlePointMouseDown(e, index)}
                onDoubleClick={() => isEditingAreaPoints && handlePointDelete(index)}
                title={isEditingAreaPoints ? `ポイント ${index + 1} (ダブルクリックで削除)` : `ポイント ${index + 1}`}
              />
            ))}

            {/* 凹凸エリア作成中のガイドライン */}
            {(isCreatingPolygonArea || isEditingAreaPoints) && polygonPoints.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              >
                {/* 作成中のポリゴンラインを描画 */}
                {polygonPoints.length > 1 && (
                  <polyline
                    points={polygonPoints.map(p => `${p.x * zoom},${p.y * zoom}`).join(' ')}
                    fill="none"
                    stroke={isEditingAreaPoints ? "#3B82F6" : "#EAB308"}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.7"
                  />
                )}
                
                {/* 最初のポイントと最後のポイントを接続（3つ以上の場合） */}
                {polygonPoints.length >= 3 && (
                  <line
                    x1={polygonPoints[polygonPoints.length - 1].x * zoom}
                    y1={polygonPoints[polygonPoints.length - 1].y * zoom}
                    x2={polygonPoints[0].x * zoom}
                    y2={polygonPoints[0].y * zoom}
                    stroke={isEditingAreaPoints ? "#3B82F6" : "#EAB308"}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                )}
              </svg>
            )}

            {/* 作成モードのヘルプテキスト */}
            {isCreatingPolygonArea && (
              <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800 shadow-lg z-20">
                <div className="font-medium mb-1">🔧 凹凸エリア作成中</div>
                <div className="text-xs space-y-1">
                  <div>• クリックして頂点を追加</div>
                  <div>• 最低3つの頂点が必要</div>
                  <div>• 右側の「完了」ボタンで確定</div>
                </div>
              </div>
            )}

            {/* 編集モードのヘルプテキスト */}
            {isEditingAreaPoints && (
              <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm text-blue-800 shadow-lg z-20">
                <div className="font-medium mb-1">✏️ ポイント編集中</div>
                <div className="text-xs space-y-1">
                  <div>• ポイントをドラッグして移動</div>
                  <div>• ダブルクリックで削除</div>
                  <div>• 右側の「保存」ボタンで確定</div>
                </div>
              </div>
            )}

            {/* リサイズハンドル */}
            {selectedItem && !isResizing && !isDragging && !isCreatingPolygonArea && !isEditingAreaPoints && (() => {
              const item = getSelectedItem();
              if (!item) return null;
              
              // 複雑な形状のエリアはリサイズ不可
              if (item.type === 'area' && item.shape?.type !== 'rectangle') {
                return null;
              }
              
              return (
                <ResizeHandles
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  zoom={zoom}
                  onResize={(newWidth, newHeight, newX, newY) => {
                    updateItemSize(selectedItem, newWidth, newHeight, newX, newY);
                  }}
                  onResizeStart={() => setIsResizing(true)}
                  onResizeEnd={() => setIsResizing(false)}
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
          onDelete={handleContextMenuDelete}
          itemType={contextMenu.type}
          itemName={contextMenu.item.name || 'アイテム'}
        />
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null, type: 'area' })}
        onConfirm={() => {
          if (deleteDialog.item) {
            handleDeleteItem(deleteDialog.item.id, deleteDialog.type);
          }
        }}
        itemName={deleteDialog.item?.name || 'アイテム'}
        itemType={deleteDialog.type}
      />

      {/* 置き場マスタ選択ダイアログ */}
      {showStorageMasterSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">置き場マスタ選択</h2>
              <button
                onClick={() => {
                  setShowStorageMasterSelector(false);
                  setStorageMasterSearchTerm('');
                  setStorageMasterSelectedType('all');
                  setShowActiveStorageOnly(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 検索・フィルタ */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4">
                {/* 検索 */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="置き場名・コードで検索..."
                    value={storageMasterSearchTerm}
                    onChange={(e) => setStorageMasterSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* タイプフィルタ */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={storageMasterSelectedType}
                    onChange={(e) => setStorageMasterSelectedType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">すべてのタイプ</option>
                    {storageMasterManager.getAllStorageTypeMasters().map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                                  {/* アクティブフィルタ */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showActiveStorageOnly}
                      onChange={(e) => setShowActiveStorageOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">アクティブのみ</span>
                  </label>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* 統計情報 */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 font-medium">
                    表示中: {getFilteredStorageMasters().length}件
                  </span>
                  <span className="text-blue-600">
                    総数: {storageMasterManager.getAllStorageMasters().length}件
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredStorageMasters().map(storage => (
                  <div 
                    key={storage.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addStorageFromMaster(storage)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{storageMasterManager.getStorageTypeIcon(storage.storageType)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{storage.name}</h4>
                        <p className="text-sm text-gray-600">{storage.code}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        storage.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {storage.isActive ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>タイプ:</span>
                        <span className="font-medium">{storageMasterManager.getStorageTypeName(storage.storageType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>サイズ:</span>
                        <span>{storage.rows}段 × {storage.columns}列</span>
                      </div>
                      {storage.materialTypes.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">対応材料:</div>
                          <div className="flex flex-wrap gap-1">
                            {storage.materialTypes.slice(0, 3).map(type => (
                              <span key={type} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {type}
                              </span>
                            ))}
                            {storage.materialTypes.length > 3 && (
                              <span className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                +{storage.materialTypes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {getFilteredStorageMasters().length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {storageMasterSearchTerm || storageMasterSelectedType !== 'all' 
                      ? '検索条件に一致する置き場マスタがありません' 
                      : '置き場マスタがありません'
                    }
                  </h3>
                  <p className="text-gray-600">
                    {storageMasterSearchTerm || storageMasterSelectedType !== 'all'
                      ? '検索条件を変更してください'
                      : '先に置き場マスタ管理で置き場を登録してください'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 設備マスタ選択ダイアログ */}
      <FacilityMasterSelectDialog
        isOpen={showFacilityMasterSelector}
        onClose={() => setShowFacilityMasterSelector(false)}
        onSelect={addFacilityFromMaster}
      />
    </div>
  );
};

export default WarehouseLayoutEditor; 