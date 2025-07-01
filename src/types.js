// 型定義
export const Material = {
  id: '',
  rfidTag: '',
  name: '',
  type: '',
  size: '',
  quantity: 0,
  location: '',
  status: 'available', // 'available' | 'in-use' | 'reserved'
  lastUpdated: new Date()
};

export const WorkHistory = {
  id: '',
  action: 'in', // 'in' | 'out'
  materialId: '',
  materialName: '',
  location: '',
  quantity: 0,
  worker: '',
  timestamp: new Date(),
  purpose: undefined
};

export const User = {
  id: '',
  name: '',
  role: 'worker', // 'worker' | 'admin'
  rfidTag: undefined
}; 