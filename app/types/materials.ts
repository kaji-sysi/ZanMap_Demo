export interface Material {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  unit: string;
  size: string;
  description: string;
  created_at: string;
  updated_at: string;
  last_action?: string;
} 

// 棚の段情報表示用の型定義
export interface ShelfInfo {
  area: string;
  row: number;
  shelf: number;
  totalRows: number;
  totalShelves: number;
}

export interface ShelfSlot {
  row: number;
  shelf: number;
  level: number; // 段番号（1から開始）
  material?: Material;
  isEmpty: boolean;
}

// 置き場情報表示用の型定義（新規追加）
export interface StorageInfo {
  id: string;
  code: string;
  name: string;
  storageType: 'shelf' | 'rack' | 'pallet' | 'floor_area' | 'box' | 'tank';
  capacityType: 'grid_slot' | 'area_based' | 'volume_based' | 'weight_based';
  
  // グリッドスロット型の場合
  rows?: number;
  columns?: number;
  levels?: number;
  
  // エリアベース型の場合
  maxItems?: number;
  currentItems?: number;
  
  // 容積ベース型の場合
  maxVolume?: number;
  currentVolume?: number;
  
  // 重量ベース型の場合
  maxWeight?: number;
  currentWeight?: number;
}

// 置き場スロット情報（新規追加）
export interface StorageSlot {
  storageId: string;
  position: string; // 位置表現（置き場タイプに応じて可変）
  material?: Material;
  isEmpty: boolean;
  // グリッドスロット型の場合
  row?: number;
  column?: number;
  level?: number;
  // その他の型の場合
  area?: string;
  volume?: number;
  weight?: number;
} 