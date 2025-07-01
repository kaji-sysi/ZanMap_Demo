'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { ScanLine, Plus, X, QrCode } from 'lucide-react';
import { Material, User, NotificationType, StockInData } from '@/app/types';
import QRCodeScanner from '../QRCodeScanner';

interface StockInViewProps {
  materials: Material[];
  onStockIn: (data: StockInData) => boolean;
  currentUser: User | null;
  setNotification: (notification: NotificationType | null) => void;
  categories: string[];
}

const StockInView: React.FC<StockInViewProps> = ({
  materials,
  onStockIn,
  currentUser,
  setNotification,
  categories
}) => {
  // 既存材料を選択するか、新規登録するかのモード
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  
  // 既存材料選択フォーム用のstate
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [existingQuantity, setExistingQuantity] = useState<number>(1);
  
  // 新規材料登録フォーム用のstate
  const [newMaterialData, setNewMaterialData] = useState<Omit<StockInData, 'existingId'>>({
    code: '',
    name: '',
    category: categories[0],
    quantity: 1,
    location: '',
    unit: '枚',
    size: '',
    description: ''
  });

  // 検索用のフィルタ
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // QRコードスキャナー関連
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [scannerType, setScannerType] = useState<'material' | 'location'>('material');
  
  // 既存材料のフィルタリング
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 選択した既存材料の情報を取得
  const selectedMaterial = selectedMaterialId !== '' 
    ? materials.find(m => m.id === selectedMaterialId) 
    : null;

  // 既存材料の棚入れ処理
  const handleExistingStockIn = () => {
    if (selectedMaterialId === '') {
      setNotification({ type: 'error', message: '材料を選択してください' });
      return;
    }

    if (existingQuantity <= 0) {
      setNotification({ type: 'error', message: '数量は1以上を指定してください' });
      return;
    }

    setIsLoading(true);

    try {
      const success = onStockIn({
        existingId: selectedMaterialId as number,
        code: '',
        name: '',
        category: '',
        quantity: existingQuantity,
        location: '',
        unit: '',
        size: '',
        description: '',
        operator: currentUser?.name
      });

      if (success) {
        setNotification({ type: 'success', message: '棚入れを登録しました' });
        setSelectedMaterialId('');
        setExistingQuantity(1);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'エラーが発生しました' });
      console.error('Stock in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 新規材料の棚入れ処理
  const handleNewStockIn = () => {
    if (!newMaterialData.code || !newMaterialData.name || !newMaterialData.location) {
      setNotification({ type: 'error', message: '必須項目を入力してください' });
      return;
    }

    if (newMaterialData.quantity <= 0) {
      setNotification({ type: 'error', message: '数量は1以上を指定してください' });
      return;
    }

    setIsLoading(true);

    try {
      const success = onStockIn({
        ...newMaterialData,
        operator: currentUser?.name
      });

      if (success) {
        setNotification({ type: 'success', message: '新規材料を登録しました' });
        setNewMaterialData({
          code: '',
          name: '',
          category: categories[0],
          quantity: 1,
          location: '',
          unit: '枚',
          size: '',
          description: ''
        });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'エラーが発生しました' });
      console.error('New material registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 新規材料フォームの入力更新
  const handleNewMaterialChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    // 数量の場合は数値変換
    if (name === 'quantity') {
      processedValue = parseInt(value) || 0;
    }
    
    setNewMaterialData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // 棚位置をランダム生成（シミュレーション用）
  const generateRandomLocation = () => {
    const areas = ['A', 'B', 'C', 'D'];
    const rows = [1, 2, 3, 4];
    const columns = [1, 2, 3, 4, 5];
    
    const area = areas[Math.floor(Math.random() * areas.length)];
    const row = rows[Math.floor(Math.random() * rows.length)];
    const col = columns[Math.floor(Math.random() * columns.length)];
    
    const location = `${area}-${row}-${col}`;
    
    if (mode === 'new') {
      setNewMaterialData(prev => ({
        ...prev,
        location: location
      }));
    }
    
    setNotification({ type: 'success', message: `位置: ${location}` });
  };

  // QRコードスキャンハンドラー
  const handleQRScan = (data: string) => {
    try {
      console.log('QR Code scanned:', data);
      
      if (scannerType === 'material') {
        // 材料QRコードの場合
        // QRコードの内容を解析（例：{"id": 123, "code": "MAT001", "name": "SUS304板材"}）
        const materialData = JSON.parse(data);
        
        if (materialData.id && mode === 'existing') {
          const material = materials.find(m => m.id === materialData.id);
          if (material) {
            setSelectedMaterialId(material.id);
            setNotification({ type: 'success', message: `材料「${material.name}」を選択しました` });
          } else {
            setNotification({ type: 'warning', message: '材料が見つかりません' });
          }
        } else if (materialData.code && mode === 'new') {
          setNewMaterialData(prev => ({
            ...prev,
            code: materialData.code,
            name: materialData.name || ''
          }));
          setNotification({ type: 'success', message: `材料コード「${materialData.code}」を入力しました` });
        }
      } else if (scannerType === 'location') {
        // 棚位置QRコードの場合
        // QRコードの内容を解析（例：{"location": "A-1-1", "area": "A", "row": 1, "shelf": 1}）
        const locationData = JSON.parse(data);
        
        if (locationData.location) {
          if (mode === 'new') {
            setNewMaterialData(prev => ({
              ...prev,
              location: locationData.location
            }));
          }
          setNotification({ type: 'success', message: `棚位置「${locationData.location}」を入力しました` });
        }
      }
    } catch (error) {
      // JSON解析に失敗した場合は、プレーンテキストとして処理
      console.log('Plain text QR code:', data);
      
      if (scannerType === 'location') {
        // 棚位置の形式をチェック（例：A-1-1）
        const locationPattern = /^[A-Z]-\d+-\d+$/;
        if (locationPattern.test(data)) {
          if (mode === 'new') {
            setNewMaterialData(prev => ({
              ...prev,
              location: data
            }));
          }
          setNotification({ type: 'success', message: `棚位置「${data}」を入力しました` });
        } else {
          setNotification({ type: 'error', message: '有効な棚位置QRコードではありません' });
        }
      } else {
        // 材料コードとして処理
        if (mode === 'new') {
          setNewMaterialData(prev => ({
            ...prev,
            code: data
          }));
          setNotification({ type: 'success', message: `材料コード「${data}」を入力しました` });
        }
      }
    }
  };

  // QRコードスキャナーを開く
  const openQRScanner = (type: 'material' | 'location') => {
    console.log('Opening QR Scanner with type:', type);
    setScannerType(type);
    setIsQRScannerOpen(true);
    console.log('QR Scanner state set to open:', true);
  };

  return (
    <div className="px-4 py-2 lg:py-4 pt-20 lg:pt-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">棚入れ登録</h1>
        <p className="text-gray-600">新規または既存の残材を棚に入れる作業を記録</p>
      </div>
      
      {/* モード選択タブ */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setMode('existing')}
          className={`py-3 px-6 font-medium ${
            mode === 'existing' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          既存材料の棚入れ
        </button>
        <button
          onClick={() => setMode('new')}
          className={`py-3 px-6 font-medium ${
            mode === 'new' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          新規材料の登録
        </button>
      </div>
      
      {/* 既存材料選択モード */}
      {mode === 'existing' && (
        <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* 検索バー */}
            <div>
              <label className="block text-sm font-medium mb-2">残材を検索</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="名前、コード、カテゴリで検索"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* 材料選択リスト */}
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コード</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現在数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.length > 0 ? (
                      filteredMaterials.map((material) => (
                        <tr
                          key={material.id}
                          onClick={() => setSelectedMaterialId(material.id)}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            selectedMaterialId === material.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-2 text-sm">{material.code}</td>
                          <td className="px-4 py-2 text-sm">{material.name}</td>
                          <td className="px-4 py-2 text-sm">{material.category}</td>
                          <td className="px-4 py-2 text-sm">{material.quantity} {material.unit}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          {searchTerm ? '検索結果がありません' : '材料データがありません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 選択中の材料 */}
            {selectedMaterial && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">選択中: {selectedMaterial.name}</h3>
                <p className="text-sm text-gray-600">
                  コード: {selectedMaterial.code} / カテゴリ: {selectedMaterial.category} / 
                  現在数: {selectedMaterial.quantity} {selectedMaterial.unit} / 
                  位置: {selectedMaterial.location}
                </p>
              </div>
            )}

            {/* 数量入力 */}
            <div>
              <label className="block text-sm font-medium mb-2">追加数量</label>
              <input
                type="number"
                value={existingQuantity}
                onChange={(e) => setExistingQuantity(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* 実行ボタン */}
            <button
              onClick={handleExistingStockIn}
              disabled={isLoading || selectedMaterialId === ''}
              className={`w-full py-3 rounded-md font-medium transition ${
                isLoading || selectedMaterialId === '' 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? '処理中...' : '棚入れ登録'}
            </button>
          </div>
        </div>
      )}

      {/* 新規材料登録モード */}
      {mode === 'new' && (
        <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">材料コード <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={newMaterialData.code}
                    onChange={handleNewMaterialChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: B006"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => openQRScanner('material')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center gap-2"
                    disabled={isLoading}
                    type="button"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden md:inline">QRスキャン</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">材料名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newMaterialData.name}
                  onChange={handleNewMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: ラワン合板"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">カテゴリ <span className="text-red-500">*</span></label>
                <select
                  name="category"
                  value={newMaterialData.category}
                  onChange={handleNewMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">単位 <span className="text-red-500">*</span></label>
                <select
                  name="unit"
                  value={newMaterialData.unit}
                  onChange={handleNewMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="枚">枚</option>
                  <option value="本">本</option>
                  <option value="個">個</option>
                  <option value="セット">セット</option>
                  <option value="ケース">ケース</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">数量 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  value={newMaterialData.quantity}
                  onChange={handleNewMaterialChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">棚位置 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="location"
                    value={newMaterialData.location}
                    onChange={handleNewMaterialChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: A-1-2"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => openQRScanner('location')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                    disabled={isLoading}
                    type="button"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden md:inline">QRスキャン</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">サイズ</label>
                <input
                  type="text"
                  name="size"
                  value={newMaterialData.size}
                  onChange={handleNewMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 1820×910×12mm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">説明</label>
              <textarea
                name="description"
                value={newMaterialData.description}
                onChange={handleNewMaterialChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="材料の説明や特徴を入力してください"
                disabled={isLoading}
              ></textarea>
            </div>

            {/* 実行ボタン */}
            <button
              onClick={handleNewStockIn}
              disabled={isLoading}
              className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 transition ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus size={18} />
              {isLoading ? '処理中...' : '新規材料を登録'}
            </button>
          </div>
        </div>
      )}

      {/* QRコードスキャナー */}
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => {
          console.log('QR Scanner closing...');
          setIsQRScannerOpen(false);
        }}
        onScan={handleQRScan}
        title={scannerType === 'material' ? '材料QRコードスキャン' : '棚位置QRコードスキャン'}
        placeholder={
          scannerType === 'material' 
            ? '材料のQRコードをカメラに向けてください' 
            : '棚位置のQRコードをカメラに向けてください'
        }
      />
    </div>
  );
};

export default StockInView; 