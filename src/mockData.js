// モックデータ
export const mockMaterials = [
  {
    id: '1',
    rfidTag: 'RFID001',
    name: 'SUS304板材',
    type: '板材',
    size: '1000×500×10mm',
    quantity: 5,
    location: 'A-1-1',
    status: 'available',
    lastUpdated: new Date()
  },
  {
    id: '2',
    rfidTag: 'RFID002',
    name: 'アルミ角材',
    type: '角材',
    size: '50×50×2000mm',
    quantity: 10,
    location: 'B-2-3',
    status: 'available',
    lastUpdated: new Date()
  },
  {
    id: '3',
    rfidTag: 'RFID003',
    name: '鉄鋼板',
    type: '板材',
    size: '2000×1000×6mm',
    quantity: 3,
    location: 'A-3-2',
    status: 'in-use',
    lastUpdated: new Date()
  }
];

export const mockHistory = [
  {
    id: '1',
    action: 'out',
    materialId: '1',
    materialName: 'SUS304板材',
    location: 'A-1-1',
    quantity: 2,
    worker: '田中太郎',
    timestamp: new Date(Date.now() - 3600000),
    purpose: '再利用'
  },
  {
    id: '2',
    action: 'in',
    materialId: '2',
    materialName: 'アルミ角材',
    location: 'B-2-3',
    quantity: 5,
    worker: '佐藤花子',
    timestamp: new Date(Date.now() - 7200000)
  }
]; 