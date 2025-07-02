import type { FacilityMaster, FacilityType } from '../types/warehouse';

// 設備タイプマスタ
export interface FacilityTypeMaster {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: 'entrance' | 'work' | 'storage' | 'office' | 'safety';
  defaultWidth: number;
  defaultHeight: number;
}

// 設備タイプマスタデータ
export const facilityTypes: FacilityTypeMaster[] = [
  {
    id: 'entrance',
    name: '入口',
    icon: '🚪',
    color: '#10B981',
    description: '倉庫の入口',
    category: 'entrance',
    defaultWidth: 100,
    defaultHeight: 20
  },
  {
    id: 'exit',
    name: '出口',
    icon: '🚪',
    color: '#EF4444',
    description: '倉庫の出口',
    category: 'entrance',
    defaultWidth: 100,
    defaultHeight: 20
  },
  {
    id: 'office',
    name: '事務所',
    icon: '🏢',
    color: '#3B82F6',
    description: '管理事務所',
    category: 'office',
    defaultWidth: 150,
    defaultHeight: 100
  },
  {
    id: 'restroom',
    name: '休憩室',
    icon: '☕',
    color: '#8B5CF6',
    description: '休憩・トイレ',
    category: 'office',
    defaultWidth: 100,
    defaultHeight: 80
  },
  {
    id: 'loading',
    name: '荷受け場',
    icon: '🚛',
    color: '#F59E0B',
    description: '材料の荷受け',
    category: 'work',
    defaultWidth: 200,
    defaultHeight: 100
  },
  {
    id: 'shipping',
    name: '出荷場',
    icon: '📦',
    color: '#06B6D4',
    description: '製品の出荷',
    category: 'work',
    defaultWidth: 200,
    defaultHeight: 100
  },
  {
    id: 'meeting',
    name: '会議室',
    icon: '👥',
    color: '#84CC16',
    description: '会議・打合せ',
    category: 'office',
    defaultWidth: 120,
    defaultHeight: 80
  },
  {
    id: 'storage',
    name: '倉庫',
    icon: '🏪',
    color: '#6B7280',
    description: '一般倉庫',
    category: 'storage',
    defaultWidth: 150,
    defaultHeight: 120
  },
  {
    id: 'workstation',
    name: '作業台',
    icon: '🔧',
    color: '#DC2626',
    description: '作業・加工台',
    category: 'work',
    defaultWidth: 120,
    defaultHeight: 60
  },
  {
    id: 'safety',
    name: '安全設備',
    icon: '🚨',
    color: '#F97316',
    description: '消火器・非常口等',
    category: 'safety',
    defaultWidth: 50,
    defaultHeight: 50
  }
];

// 設備マスタデータ管理クラス
class FacilityMasterDataManager {
  private static instance: FacilityMasterDataManager;
  private facilityMasters: FacilityMaster[] = [];

  private constructor() {
    this.loadInitialData();
  }

  public static getInstance(): FacilityMasterDataManager {
    if (!FacilityMasterDataManager.instance) {
      FacilityMasterDataManager.instance = new FacilityMasterDataManager();
    }
    return FacilityMasterDataManager.instance;
  }

  private loadInitialData() {
    // 初期サンプルデータ
    this.facilityMasters = [
      {
        id: 'facility_entrance_01',
        type: 'entrance',
        name: 'メイン入口',
        isActive: true
      },
      {
        id: 'facility_office_01',
        type: 'office',
        name: '管理事務所',
        isActive: true
      },
      {
        id: 'facility_loading_01',
        type: 'loading',
        name: '荷受け場A',
        isActive: true
      }
    ];
  }

  // 全設備マスタ取得
  public getAllFacilities(): FacilityMaster[] {
    return [...this.facilityMasters];
  }

  // ID指定で設備マスタ取得
  public getFacilityById(id: string): FacilityMaster | undefined {
    return this.facilityMasters.find(facility => facility.id === id);
  }

  // 設備タイプ指定で設備マスタ取得
  public getFacilitiesByType(type: FacilityType): FacilityMaster[] {
    return this.facilityMasters.filter(facility => facility.type === type);
  }

  // 設備マスタ追加
  public addFacility(facility: Omit<FacilityMaster, 'id'>): FacilityMaster {
    const newFacility: FacilityMaster = {
      ...facility,
      id: `facility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: facility.isActive ?? true
    };
    
    this.facilityMasters.push(newFacility);
    console.log('設備マスタ追加:', newFacility);
    return newFacility;
  }

  // 設備マスタ更新
  public updateFacility(id: string, updates: Partial<FacilityMaster>): FacilityMaster | null {
    const index = this.facilityMasters.findIndex(facility => facility.id === id);
    if (index === -1) {
      console.error('設備マスタが見つかりません:', id);
      return null;
    }

    this.facilityMasters[index] = {
      ...this.facilityMasters[index],
      ...updates,
      id // IDは変更させない
    };

    console.log('設備マスタ更新:', this.facilityMasters[index]);
    return this.facilityMasters[index];
  }

  // 設備マスタ削除
  public deleteFacility(id: string): boolean {
    const index = this.facilityMasters.findIndex(facility => facility.id === id);
    if (index === -1) {
      console.error('設備マスタが見つかりません:', id);
      return false;
    }

    const deleted = this.facilityMasters.splice(index, 1)[0];
    console.log('設備マスタ削除:', deleted);
    return true;
  }

  // 設備マスタ検索
  public searchFacilities(query: string): FacilityMaster[] {
    const lowerQuery = query.toLowerCase();
    return this.facilityMasters.filter(facility =>
      facility.name.toLowerCase().includes(lowerQuery) ||
      facility.type.toLowerCase().includes(lowerQuery)
    );
  }

  // 設備タイプマスタ取得
  public getFacilityTypes(): FacilityTypeMaster[] {
    return [...facilityTypes];
  }

  // 設備タイプマスタをIDで取得
  public getFacilityTypeById(id: string): FacilityTypeMaster | undefined {
    return facilityTypes.find(type => type.id === id);
  }

  // カテゴリ別設備タイプ取得
  public getFacilityTypesByCategory(category: string): FacilityTypeMaster[] {
    return facilityTypes.filter(type => type.category === category);
  }

  // 設備マスタ複製
  public copyFacility(id: string, newName?: string): FacilityMaster | null {
    const original = this.getFacilityById(id);
    if (!original) {
      console.error('コピー元の設備マスタが見つかりません:', id);
      return null;
    }

    const copied = this.addFacility({
      type: original.type,
      name: newName || `${original.name} (コピー)`,
      isActive: original.isActive
    });

    return copied;
  }

  // 統計情報取得
  public getStatistics() {
    const totalCount = this.facilityMasters.length;
    const byType: Record<string, number> = {};
    
    // タイプ別の使用数を集計
    this.facilityMasters.forEach(facility => {
      byType[facility.type] = (byType[facility.type] || 0) + 1;
    });

    const typeStats = facilityTypes.map(type => ({
      type: type.name,
      count: this.facilityMasters.filter(f => f.type === type.id).length
    }));

    return {
      totalCount,
      byType,
      typeStats
    };
  }
}

// シングルトンインスタンスをエクスポート
export const facilityMasterData = FacilityMasterDataManager.getInstance(); 