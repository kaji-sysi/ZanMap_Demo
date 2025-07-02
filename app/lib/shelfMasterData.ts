import type { ShelfMaster } from '../types/warehouse';
import { shelfTypes } from './warehouseMasterData';

// 棚マスタのサンプルデータ
export const initialShelfMasterData: ShelfMaster[] = [
  {
    id: 'shelf_001',
    name: '標準棚A-01',
    code: 'A-01',
    areaId: '',
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    rows: 5,
    columns: 3,
    levels: 1,
    shelfType: shelfTypes[0], // 標準棚
    materialTypes: ['鋼材', '金属部品'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'shelf_002',
    name: '重量棚B-01',
    code: 'B-01',
    areaId: '',
    x: 0,
    y: 0,
    width: 120,
    height: 80,
    rows: 3,
    columns: 2,
    levels: 1,
    shelfType: shelfTypes[1], // 重量棚
    materialTypes: ['鋼材', '木材'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'shelf_003',
    name: '高層棚C-01',
    code: 'C-01',
    areaId: '',
    x: 0,
    y: 0,
    width: 80,
    height: 40,
    rows: 10,
    columns: 2,
    levels: 3,
    shelfType: shelfTypes[2], // 高層棚
    materialTypes: ['電子部品', '樹脂'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'shelf_004',
    name: '小物棚D-01',
    code: 'D-01',
    areaId: '',
    x: 0,
    y: 0,
    width: 60,
    height: 40,
    rows: 8,
    columns: 6,
    levels: 1,
    shelfType: shelfTypes[3], // 小物棚
    materialTypes: ['電子部品', 'その他'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// 棚マスタデータ管理クラス
export class ShelfMasterManager {
  private static instance: ShelfMasterManager;
  private shelfMasters: ShelfMaster[] = [...initialShelfMasterData];

  private constructor() {}

  public static getInstance(): ShelfMasterManager {
    if (!ShelfMasterManager.instance) {
      ShelfMasterManager.instance = new ShelfMasterManager();
    }
    return ShelfMasterManager.instance;
  }

  // 全ての棚マスタを取得
  public getAllShelfMasters(): ShelfMaster[] {
    return [...this.shelfMasters];
  }

  // アクティブな棚マスタのみを取得
  public getActiveShelfMasters(): ShelfMaster[] {
    return this.shelfMasters.filter(shelf => shelf.isActive);
  }

  // IDで棚マスタを取得
  public getShelfMasterById(id: string): ShelfMaster | undefined {
    return this.shelfMasters.find(shelf => shelf.id === id);
  }

  // コードで棚マスタを取得
  public getShelfMasterByCode(code: string): ShelfMaster | undefined {
    return this.shelfMasters.find(shelf => shelf.code === code);
  }

  // 棚マスタを追加
  public addShelfMaster(shelf: ShelfMaster): boolean {
    // コードの重複チェック
    if (this.getShelfMasterByCode(shelf.code)) {
      return false; // 重複エラー
    }

    this.shelfMasters.push(shelf);
    return true;
  }

  // 棚マスタを更新
  public updateShelfMaster(shelf: ShelfMaster): boolean {
    const index = this.shelfMasters.findIndex(s => s.id === shelf.id);
    if (index === -1) {
      return false; // 存在しない
    }

    // コードの重複チェック（自分以外）
    const existingShelf = this.getShelfMasterByCode(shelf.code);
    if (existingShelf && existingShelf.id !== shelf.id) {
      return false; // 重複エラー
    }

    this.shelfMasters[index] = shelf;
    return true;
  }

  // 棚マスタを削除
  public deleteShelfMaster(id: string): boolean {
    console.log('削除処理開始:', { id, 現在の棚数: this.shelfMasters.length });
    const index = this.shelfMasters.findIndex(shelf => shelf.id === id);
    console.log('削除対象のインデックス:', index);
    
    if (index === -1) {
      console.log('削除対象が見つかりません');
      return false; // 存在しない
    }

    const deletedShelf = this.shelfMasters[index];
    console.log('削除対象の棚:', deletedShelf.name);
    
    this.shelfMasters.splice(index, 1);
    console.log('削除後の棚数:', this.shelfMasters.length);
    return true;
  }

  // 棚マスタを検索
  public searchShelfMasters(searchTerm: string): ShelfMaster[] {
    if (!searchTerm.trim()) {
      return this.getAllShelfMasters();
    }

    const term = searchTerm.toLowerCase();
    return this.shelfMasters.filter(shelf =>
      shelf.name.toLowerCase().includes(term) ||
      shelf.code.toLowerCase().includes(term) ||
      shelf.shelfType.name.toLowerCase().includes(term)
    );
  }

  // 棚タイプ別に棚マスタを取得
  public getShelfMastersByType(shelfTypeId: string): ShelfMaster[] {
    return this.shelfMasters.filter(shelf => shelf.shelfType.id === shelfTypeId);
  }

  // 材料タイプに対応する棚マスタを取得
  public getShelfMastersForMaterialType(materialType: string): ShelfMaster[] {
    return this.shelfMasters.filter(shelf => 
      shelf.materialTypes.includes(materialType) && shelf.isActive
    );
  }
}

// シングルトンインスタンスをエクスポート
export const shelfMasterManager = ShelfMasterManager.getInstance(); 