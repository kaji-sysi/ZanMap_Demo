// 倉庫マスタ管理用の型定義

// 形状タイプ
export type ShapeType = 'rectangle' | 'polygon' | 'circle' | 'ellipse' | 'custom';

// 座標点
export interface Point {
  x: number;
  y: number;
}

// ベジェ曲線の制御点
export interface BezierPoint extends Point {
  controlPoint1?: Point;
  controlPoint2?: Point;
}

// 形状定義
export interface Shape {
  type: ShapeType;
  points: Point[]; // 多角形の場合の頂点
  bezierPoints?: BezierPoint[]; // ベジェ曲線の場合
  radius?: number; // 円形の場合
  radiusX?: number; // 楕円の場合
  radiusY?: number; // 楕円の場合
  borderRadius?: number; // 角の丸み
}

export interface WarehouseArea {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  description?: string;
  isActive: boolean;
  // 形状情報を追加
  shape: Shape;
  // 編集用の制御点表示フラグ
  showControlPoints?: boolean;
}

export interface ShelfMaster {
  id: string;
  code: string;
  name: string;
  areaId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number; // 段数
  columns: number; // 列数
  levels: number; // 階層数
  shelfType: ShelfType;
  materialTypes: string[]; // 対応材料タイプ
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultRows: number;
  defaultColumns: number;
  defaultLevels: number;
}

// 置き場タイプ（新規追加）
export type StorageType = 'shelf' | 'rack' | 'pallet' | 'floor_area' | 'box' | 'tank';

// 置き場マスタ（新規追加）
export interface StorageMaster {
  id: string;
  code: string;
  name: string;
  storageType: StorageType;
  areaId: string;
  // 寸法設定
  width: number;
  height: number;
  // 段数・列数
  rows: number;
  columns: number;
  levels: number; // 階層数
  materialTypes: string[]; // 対応材料タイプ
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// レイアウトで使用される置き場（位置情報付き）
export interface LayoutStorage extends StorageMaster {
  x: number;
  y: number;
}

// 置き場タイプマスタ（新規追加）
export interface StorageTypeMaster {
  id: StorageType;
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultRows: number;
  defaultColumns: number;
  defaultLevels: number;
}

export interface WarehouseLayout {
  id: string;
  name: string;
  version: string;
  width: number;
  height: number;
  areas: WarehouseArea[];
  shelves: ShelfMaster[]; // 後方互換性のため残す
  storages: LayoutStorage[]; // 新しい置き場マスタ（位置情報付き）
  facilities: LayoutFacility[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FacilityMaster {
  id: string;
  type: FacilityType;
  name: string;
  isActive: boolean;
}

// レイアウトで使用される設備（位置・サイズ情報付き）
export interface LayoutFacility {
  id: string;
  type: FacilityType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

export type FacilityType = 
  | 'entrance' 
  | 'exit' 
  | 'office' 
  | 'restroom' 
  | 'loading' 
  | 'shipping' 
  | 'meeting' 
  | 'storage' 
  | 'workstation'
  | 'safety';

// 編集モード
export type EditMode = 'select' | 'area' | 'shelf' | 'facility' | 'delete' | 'vertex' | 'curve';

// 編集操作
export interface EditAction {
  type: 'add' | 'update' | 'delete' | 'move' | 'resize' | 'reshape';
  targetType: 'area' | 'shelf' | 'facility';
  targetId: string;
  data: any;
  timestamp: string;
}

// 形状テンプレート
export interface ShapeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  shape: Shape;
  category: 'basic' | 'industrial' | 'complex';
} 