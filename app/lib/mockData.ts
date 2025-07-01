import { User, Material, HistoryEntry } from '../types';

// テスト用のサンプルユーザーデータ
export const testUsers: User[] = [
  { id: 1, username: 'admin', password: 'admin123', name: '管理者', role: 'admin' },
  { id: 2, username: 'worker', password: 'worker123', name: '作業者', role: 'worker' }
];

// テスト用のサンプル材料データ（段情報付き）
export const testMaterials: Material[] = [
  { 
    id: 1, 
    code: 'B001', 
    name: '構造用合板', 
    category: '合板', 
    quantity: 5, 
    location: 'A-1-2-3', // エリアA、1行、2棚、3段 (棚定義と一致)
    unit: '枚',
    size: '1820×910×12mm',
    description: '構造用合板 JAS F☆☆☆☆',
    created_at: '2023-05-10',
    updated_at: '2023-05-15',
    last_action: '入庫'
  },
  { 
    id: 2, 
    code: 'B002', 
    name: 'SPF 2×4', 
    category: '木材', 
    quantity: 12, 
    location: 'B-2-1-2', // エリアB、2行、1棚、2段 (棚定義と一致)
    unit: '本',
    size: '1820×38×89mm',
    description: 'SPF 2×4材 乾燥処理済',
    created_at: '2023-05-12',
    updated_at: '2023-05-12',
    last_action: '入庫'
  },
  { 
    id: 3, 
    code: 'B003', 
    name: 'OSB合板', 
    category: '合板', 
    quantity: 8, 
    location: 'A-1-1-1', // エリアA、1行、1棚、1段に修正
    unit: '枚',
    size: '1820×910×9mm',
    description: 'OSB合板 構造用',
    created_at: '2023-05-18',
    updated_at: '2023-05-20',
    last_action: 'ピッキング'
  },
  { 
    id: 4, 
    code: 'B004', 
    name: '杉板', 
    category: '板材', 
    quantity: 20, 
    location: 'C-1-2-4', // エリアC、1行、2棚、4段 (棚定義と一致)
    unit: '枚',
    size: '1800×180×15mm',
    description: '杉板 無垢材 本実加工',
    created_at: '2023-05-20',
    updated_at: '2023-05-20',
    last_action: '入庫'
  },
  { 
    id: 5, 
    code: 'B005', 
    name: 'メラミン化粧板', 
    category: '化粧板', 
    quantity: 3, 
    location: 'D-3-1-2', // エリアD、3行、1棚、2段 (棚定義と一致)
    unit: '枚',
    size: '1800×900×20mm',
    description: 'メラミン化粧板 ホワイト',
    created_at: '2023-05-22',
    updated_at: '2023-05-25',
    last_action: 'ピッキング'
  },
  // 追加のテストデータ（同じ棚A-1-2に複数材料）
  { 
    id: 6, 
    code: 'B006', 
    name: '檜板', 
    category: '板材', 
    quantity: 15, 
    location: 'A-1-2-1', // エリアA、1行、2棚、1段
    unit: '枚',
    size: '1800×150×12mm',
    description: '檜板 無垢材',
    created_at: '2023-05-25',
    updated_at: '2023-05-25',
    last_action: '入庫'
  },
  { 
    id: 7, 
    code: 'B007', 
    name: 'パイン集成材', 
    category: '木材', 
    quantity: 8, 
    location: 'A-1-2-5', // エリアA、1行、2棚、5段
    unit: '枚',
    size: '1800×300×18mm',
    description: 'パイン集成材 フィンガージョイント',
    created_at: '2023-05-26',
    updated_at: '2023-05-26',
    last_action: '入庫'
  },
  { 
    id: 8, 
    code: 'B008', 
    name: 'ベニヤ板', 
    category: '合板', 
    quantity: 25, 
    location: 'A-1-2-2', // エリアA、1行、2棚、2段
    unit: '枚',
    size: '1820×910×5.5mm',
    description: 'ラワンベニヤ 構造用',
    created_at: '2023-05-27',
    updated_at: '2023-05-27',
    last_action: '入庫'
  },
  // 他の棚にも材料を配置してテスト
  { 
    id: 9, 
    code: 'B009', 
    name: 'アルミ板', 
    category: '金属', 
    quantity: 6, 
    location: 'E-1-1-3', // エリアE、1行、1棚、3段
    unit: '枚',
    size: '1000×500×2mm',
    description: 'アルミ板 A5052',
    created_at: '2023-05-28',
    updated_at: '2023-05-28',
    last_action: '入庫'
  },
  { 
    id: 10, 
    code: 'B010', 
    name: 'ステンレス鋼材', 
    category: '金属', 
    quantity: 4, 
    location: 'F-3-1-1', // エリアF、3行、1棚、1段
    unit: '本',
    size: '2000×50×50mm',
    description: 'ステンレス鋼材 SUS304',
    created_at: '2023-05-29',
    updated_at: '2023-05-29',
    last_action: '入庫'
  }
];

// テスト用の作業履歴データ
export const testHistory: HistoryEntry[] = [
  { 
    id: 1, 
    type: '入庫', 
    material_id: 1, 
    material_name: '構造用合板', 
    quantity: 10, 
    location: 'A-1-2-3', 
    operator: '山田太郎', 
    timestamp: '2023-05-10 09:30:45' 
  },
  { 
    id: 2, 
    type: '入庫', 
    material_id: 2, 
    material_name: 'SPF 2×4', 
    quantity: 15, 
    location: 'B-2-1-2', 
    operator: '佐藤次郎', 
    timestamp: '2023-05-12 13:15:22' 
  },
  { 
    id: 3, 
    type: 'ピッキング', 
    material_id: 1, 
    material_name: '構造用合板', 
    quantity: 5, 
    location: 'A-1-2-3', 
    operator: '鈴木花子', 
    timestamp: '2023-05-15 10:45:33' 
  },
  { 
    id: 4, 
    type: '入庫', 
    material_id: 3, 
    material_name: 'OSB合板', 
    quantity: 8, 
    location: 'A-1-1-1', 
    operator: '山田太郎', 
    timestamp: '2023-05-18 14:20:10' 
  },
  { 
    id: 5, 
    type: 'ピッキング', 
    material_id: 3, 
    material_name: 'OSB合板', 
    quantity: 2, 
    location: 'A-1-1-1', 
    operator: '佐藤次郎', 
    timestamp: '2023-05-20 11:05:51' 
  }
];

// カテゴリリスト
export const categories: string[] = ['合板', '木材', '板材', '化粧板', '金属', 'その他']; 