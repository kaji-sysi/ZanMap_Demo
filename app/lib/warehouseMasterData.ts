import type { WarehouseLayout, ShelfType } from '../types/warehouse';

// 棚タイプマスタ
export const shelfTypes: ShelfType[] = [
  {
    id: 'standard',
    name: '標準棚',
    icon: '📦',
    color: '#3B82F6',
    description: '一般的な材料保管用',
    defaultRows: 5,
    defaultColumns: 4,
    defaultLevels: 1
  },
  {
    id: 'heavy',
    name: '重量棚',
    icon: '🏗️',
    color: '#EF4444',
    description: '重い材料専用',
    defaultRows: 3,
    defaultColumns: 2,
    defaultLevels: 1
  },
  {
    id: 'tall',
    name: '高層棚',
    icon: '🏢',
    color: '#10B981',
    description: '縦長材料用',
    defaultRows: 8,
    defaultColumns: 3,
    defaultLevels: 2
  },
  {
    id: 'small',
    name: '小物棚',
    icon: '📋',
    color: '#F59E0B',
    description: '小さな部品用',
    defaultRows: 6,
    defaultColumns: 6,
    defaultLevels: 1
  }
];

// サンプル倉庫レイアウト
export const sampleLayouts: WarehouseLayout[] = [
  {
    id: 'layout_main',
    name: 'メイン倉庫レイアウト',
    version: '2.1',
    width: 1200,
    height: 800,
    areas: [
      {
        id: 'area_a',
        name: '原材料エリア',
        code: 'A',
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        color: '#EBF8FF',
        borderColor: '#3182CE',
        description: '木材・合板などの原材料保管',
        isActive: true,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 300 },
            { x: 0, y: 300 }
          ]
        }
      },
      {
        id: 'area_b',
        name: '加工済材料エリア',
        code: 'B',
        x: 0,
        y: 300,
        width: 300,
        height: 300,
        color: '#F0FDF4',
        borderColor: '#16A34A',
        description: '加工済み材料の保管',
        isActive: true,
        shape: {
          type: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 250, y: 0 },
            { x: 300, y: 50 },
            { x: 300, y: 300 },
            { x: 0, y: 300 }
          ]
        }
      },
      {
        id: 'area_c',
        name: '特殊材料エリア',
        code: 'C',
        x: 300,
        y: 0,
        width: 300,
        height: 300,
        color: '#FFF7ED',
        borderColor: '#EA580C',
        description: '特殊・高価材料の保管',
        isActive: true,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 300 },
            { x: 0, y: 300 }
          ],
          borderRadius: 15
        }
      },
      {
        id: 'area_d',
        name: '廃材保管エリア',
        code: 'D',
        x: 300,
        y: 300,
        width: 300,
        height: 300,
        color: '#FAF5FF',
        borderColor: '#9333EA',
        description: '廃材・リサイクル材料',
        isActive: true,
        shape: {
          type: 'polygon',
          points: [
            { x: 50, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 250 },
            { x: 250, y: 300 },
            { x: 0, y: 300 },
            { x: 0, y: 50 }
          ]
        }
      },
      {
        id: 'area_e',
        name: '工具保管エリア',
        code: 'E',
        x: 600,
        y: 0,
        width: 300,
        height: 300,
        color: '#FEF2F2',
        borderColor: '#DC2626',
        description: '工具・機器の保管',
        isActive: true,
        shape: {
          type: 'circle',
          points: [
            { x: 150, y: 150 }
          ],
          radius: 140
        }
      },
      {
        id: 'area_f',
        name: '出荷待機エリア',
        code: 'F',
        x: 600,
        y: 300,
        width: 300,
        height: 300,
        color: '#FFFBEB',
        borderColor: '#D97706',
        description: '出荷待ち材料の一時保管',
        isActive: true,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 300 },
            { x: 0, y: 300 }
          ]
        }
      }
    ],
    shelves: [
      {
        id: 'shelf_a1_1',
        code: 'A-1-1',
        name: '原材料棚A-1-1',
        areaId: 'area_a',
        x: 40,
        y: 80,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[0], // 標準棚
        materialTypes: ['合板', '木材'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_a1_2',
        code: 'A-1-2',
        name: '原材料棚A-1-2',
        areaId: 'area_a',
        x: 40,
        y: 180,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[0], // 標準棚
        materialTypes: ['合板', '木材', '板材'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_b2_1',
        code: 'B-2-1',
        name: '加工材棚B-2-1',
        areaId: 'area_b',
        x: 40,
        y: 380,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[0], // 標準棚
        materialTypes: ['木材', '板材'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_c1_2',
        code: 'C-1-2',
        name: '特殊材棚C-1-2',
        areaId: 'area_c',
        x: 340,
        y: 180,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[2], // 高層棚
        materialTypes: ['板材', '特殊材'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_d3_1',
        code: 'D-3-1',
        name: '廃材棚D-3-1',
        areaId: 'area_d',
        x: 340,
        y: 380,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[0], // 標準棚
        materialTypes: ['化粧板', 'その他'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_e1_1',
        code: 'E-1-1',
        name: '工具棚E-1-1',
        areaId: 'area_e',
        x: 640,
        y: 80,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[3], // 小物棚
        materialTypes: ['金属', '工具'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      },
      {
        id: 'shelf_f3_1',
        code: 'F-3-1',
        name: '出荷棚F-3-1',
        areaId: 'area_f',
        x: 640,
        y: 380,
        width: 200,
        height: 40,
        rows: 5,
        columns: 4,
        levels: 1,
        shelfType: shelfTypes[0], // 標準棚
        materialTypes: ['all'],
        isActive: true,
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2023-05-20T14:30:00Z'
      }
    ],
    storages: [],
    facilities: [
      {
        id: 'facility_entrance',
        type: 'entrance',
        name: 'メイン入口',
        x: 450,
        y: 600,
        width: 120,
        height: 60,
        isActive: true
      },
      {
        id: 'facility_office',
        type: 'office',
        name: '事務所',
        x: 700,
        y: 650,
        width: 150,
        height: 100,
        isActive: true
      },
      {
        id: 'facility_loading',
        type: 'loading',
        name: '搬入口',
        x: 20,
        y: 600,
        width: 180,
        height: 100,
        isActive: true
      }
    ],
    isActive: true,
    createdAt: '2023-01-15T09:00:00Z',
    updatedAt: '2023-05-20T14:30:00Z',
    createdBy: 'admin'
  },
  {
    id: 'layout_backup',
    name: 'バックアップレイアウト',
    version: '1.0',
    width: 800,
    height: 600,
    areas: [
      {
        id: 'backup_area_a',
        name: 'バックアップエリアA',
        code: 'A',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        color: '#F3F4F6',
        borderColor: '#6B7280',
        description: 'バックアップ用簡易エリア',
        isActive: false,
        shape: {
          type: 'rectangle',
          points: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 200 },
            { x: 0, y: 200 }
          ]
        }
      }
    ],
    shelves: [],
    storages: [],
    facilities: [],
    isActive: false,
    createdAt: '2023-03-01T10:00:00Z',
    updatedAt: '2023-03-01T10:00:00Z',
    createdBy: 'admin'
  }
]; 