import type { StorageMaster, StorageTypeMaster, StorageType } from '../types/warehouse';

// 置き場タイプマスタ
export const storageTypeMasters: StorageTypeMaster[] = [
  {
    id: 'shelf',
    name: '棚',
    icon: '🗄️',
    color: '#3B82F6',
    description: '段×列のグリッド構造で材料を保管',
    defaultRows: 5,
    defaultColumns: 4,
    defaultLevels: 1
  },
  {
    id: 'rack',
    name: 'ラック',
    icon: '🏗️',
    color: '#EF4444',
    description: '縦型の吊り下げ・立て掛け型保管',
    defaultRows: 10,
    defaultColumns: 2,
    defaultLevels: 1
  },
  {
    id: 'pallet',
    name: 'パレット',
    icon: '📦',
    color: '#10B981',
    description: '平面的な材料配置用パレット',
    defaultRows: 2,
    defaultColumns: 5,
    defaultLevels: 1
  },
  {
    id: 'floor_area',
    name: 'フロアエリア',
    icon: '🏞️',
    color: '#F59E0B',
    description: '床面の区画による材料保管',
    defaultRows: 1,
    defaultColumns: 1,
    defaultLevels: 1
  },
  {
    id: 'box',
    name: 'ボックス',
    icon: '📋',
    color: '#8B5CF6',
    description: '容器型の小物部品保管',
    defaultRows: 4,
    defaultColumns: 6,
    defaultLevels: 2
  },
  {
    id: 'tank',
    name: 'タンク',
    icon: '🪣',
    color: '#06B6D4',
    description: '液体・粉体材料用のタンク',
    defaultRows: 1,
    defaultColumns: 1,
    defaultLevels: 1
  }
];

// 置き場マスタのサンプルデータ
export const initialStorageMasterData: StorageMaster[] = [
  // 棚タイプ
  {
    id: 'storage_001',
    code: 'A-01',
    name: '標準棚A-01',
    storageType: 'shelf',
    areaId: '',
    width: 100,
    height: 60,
    rows: 5,
    columns: 3,
    levels: 1,
    materialTypes: ['鋼材', '金属部品'],
    isActive: true,
    description: '標準的な材料保管用の棚',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // ラックタイプ
  {
    id: 'storage_002',
    code: 'R-01',
    name: '材料ラックR-01',
    storageType: 'rack',
    areaId: '',
    width: 80,
    height: 200,
    rows: 10,
    columns: 2,
    levels: 1,
    materialTypes: ['木材', '長材'],
    isActive: true,
    description: '長尺材料用の縦型ラック',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // パレットタイプ
  {
    id: 'storage_003',
    code: 'P-01',
    name: 'パレットP-01',
    storageType: 'pallet',
    areaId: '',
    width: 120,
    height: 80,
    rows: 2,
    columns: 5,
    levels: 1,
    materialTypes: ['鋼材', '重量物'],
    isActive: true,
    description: '重量物専用パレット',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // フロアエリアタイプ
  {
    id: 'storage_004',
    code: 'F-A01',
    name: 'フロアエリアA区画',
    storageType: 'floor_area',
    areaId: '',
    width: 300,
    height: 200,
    rows: 1,
    columns: 1,
    levels: 1,
    materialTypes: ['木材', '大型部品'],
    isActive: true,
    description: '大型材料用のフロアエリア',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // ボックスタイプ
  {
    id: 'storage_005',
    code: 'B-01',
    name: '部品ボックスB-01',
    storageType: 'box',
    areaId: '',
    width: 40,
    height: 30,
    rows: 4,
    columns: 6,
    levels: 2,
    materialTypes: ['電子部品', '小物部品'],
    isActive: true,
    description: '小物部品専用ボックス',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  // タンクタイプ
  {
    id: 'storage_006',
    code: 'T-01',
    name: 'オイルタンクT-01',
    storageType: 'tank',
    areaId: '',
    width: 100,
    height: 100,
    rows: 1,
    columns: 1,
    levels: 1,
    materialTypes: ['液体', '油類'],
    isActive: true,
    description: '液体材料用タンク',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// 置き場マスタデータ管理クラス
export class StorageMasterManager {
  private static instance: StorageMasterManager;
  private storageMasters: StorageMaster[] = [...initialStorageMasterData];

  private constructor() {}

  public static getInstance(): StorageMasterManager {
    if (!StorageMasterManager.instance) {
      StorageMasterManager.instance = new StorageMasterManager();
    }
    return StorageMasterManager.instance;
  }

  // 全ての置き場マスタを取得
  public getAllStorageMasters(): StorageMaster[] {
    return [...this.storageMasters];
  }

  // アクティブな置き場マスタのみを取得
  public getActiveStorageMasters(): StorageMaster[] {
    return this.storageMasters.filter(storage => storage.isActive);
  }

  // IDで置き場マスタを取得
  public getStorageMasterById(id: string): StorageMaster | undefined {
    return this.storageMasters.find(storage => storage.id === id);
  }

  // コードで置き場マスタを取得
  public getStorageMasterByCode(code: string): StorageMaster | undefined {
    return this.storageMasters.find(storage => storage.code === code);
  }

  // 置き場マスタを追加
  public addStorageMaster(storage: StorageMaster): boolean {
    // コードの重複チェック
    if (this.getStorageMasterByCode(storage.code)) {
      return false; // 重複エラー
    }

    // isActiveのデフォルト値を設定
    const storageWithDefaults: StorageMaster = {
      ...storage,
      isActive: storage.isActive ?? true
    };

    this.storageMasters.push(storageWithDefaults);
    return true;
  }

  // 置き場マスタを更新
  public updateStorageMaster(storage: StorageMaster): boolean {
    const index = this.storageMasters.findIndex(s => s.id === storage.id);
    if (index === -1) {
      return false; // 存在しない
    }

    // コードの重複チェック（自分以外）
    const existingStorage = this.getStorageMasterByCode(storage.code);
    if (existingStorage && existingStorage.id !== storage.id) {
      return false; // 重複エラー
    }

    this.storageMasters[index] = storage;
    return true;
  }

  // 置き場マスタを削除
  public deleteStorageMaster(id: string): boolean {
    const index = this.storageMasters.findIndex(storage => storage.id === id);
    if (index === -1) {
      return false; // 存在しない
    }

    this.storageMasters.splice(index, 1);
    return true;
  }

  // 置き場マスタを検索
  public searchStorageMasters(searchTerm: string): StorageMaster[] {
    if (!searchTerm.trim()) {
      return this.getAllStorageMasters();
    }

    const term = searchTerm.toLowerCase();
    return this.storageMasters.filter(storage =>
      storage.name.toLowerCase().includes(term) ||
      storage.code.toLowerCase().includes(term) ||
      this.getStorageTypeName(storage.storageType).toLowerCase().includes(term) ||
      (storage.description && storage.description.toLowerCase().includes(term))
    );
  }

  // 置き場タイプ別に置き場マスタを取得
  public getStorageMastersByType(storageType: StorageType): StorageMaster[] {
    return this.storageMasters.filter(storage => storage.storageType === storageType);
  }

  // 材料タイプに対応する置き場マスタを取得
  public getStorageMastersForMaterialType(materialType: string): StorageMaster[] {
    return this.storageMasters.filter(storage => 
      storage.materialTypes.includes(materialType)
    );
  }

  // 置き場タイプ名を取得
  public getStorageTypeName(storageType: StorageType): string {
    const typeMaster = storageTypeMasters.find(t => t.id === storageType);
    return typeMaster ? typeMaster.name : storageType;
  }

  // 置き場タイプのアイコンを取得
  public getStorageTypeIcon(storageType: StorageType): string {
    const typeMaster = storageTypeMasters.find(t => t.id === storageType);
    return typeMaster ? typeMaster.icon : '📦';
  }

  // 置き場タイプの色を取得
  public getStorageTypeColor(storageType: StorageType): string {
    const typeMaster = storageTypeMasters.find(t => t.id === storageType);
    return typeMaster ? typeMaster.color : '#3B82F6';
  }

  // 置き場タイプマスタを取得
  public getStorageTypeMaster(storageType: StorageType): StorageTypeMaster | undefined {
    return storageTypeMasters.find(t => t.id === storageType);
  }

  // 全ての置き場タイプマスタを取得
  public getAllStorageTypeMasters(): StorageTypeMaster[] {
    return [...storageTypeMasters];
  }
}

// シングルトンインスタンスをエクスポート
export const storageMasterManager = StorageMasterManager.getInstance(); 