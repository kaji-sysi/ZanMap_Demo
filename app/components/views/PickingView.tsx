'use client';

import React, { useState, useEffect } from 'react';
import { ScanLine, Minus, Plus, Check, X, ArrowUp, Sparkles } from 'lucide-react';
import { Material, User, NotificationType } from '@/app/types';

interface PickingViewProps {
  materials: Material[];
  onPicking: (materialId: number, quantity: number, operator: string) => boolean;
  currentUser: User | null;
  setNotification: (notification: NotificationType | null) => void;
}

const PickingView: React.FC<PickingViewProps> = ({ 
  materials, 
  onPicking, 
  currentUser, 
  setNotification 
}) => {
  // 選択された材料ID
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  // 数量
  const [quantity, setQuantity] = useState<number>(1);
  // 用途
  const [purpose, setPurpose] = useState<'reuse' | 'dispose'>('reuse');
  // 検索用語
  const [searchTerm, setSearchTerm] = useState<string>('');
  // ローディング状態
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 選択された材料の取得
  const selectedMaterial = selectedMaterialId !== null 
    ? materials.find(m => m.id === selectedMaterialId) 
    : null;

  // 材料リストのフィルタリング
  const filteredMaterials = materials.filter(material => 
    material.quantity > 0 && (
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ピッキング処理
  const handlePicking = () => {
    if (selectedMaterialId === null) {
      setNotification({ type: 'error', message: '残材を選択してください' });
      return;
    }

    if (quantity <= 0) {
      setNotification({ type: 'error', message: '数量は1以上を指定してください' });
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) {
      setNotification({ type: 'error', message: '選択された残材が見つかりません' });
      return;
    }

    if (quantity > material.quantity) {
      setNotification({ type: 'error', message: `在庫数量(${material.quantity}${material.unit})を超えています` });
      return;
    }

    setIsLoading(true);

    try {
      const success = onPicking(
        selectedMaterialId, 
        quantity, 
        currentUser?.name || '未ログインユーザー'
      );

      if (success) {
        setNotification({ 
          type: 'success', 
          message: `${material.name}のピッキングを${quantity}${material.unit}登録しました (用途: ${purpose === 'reuse' ? '再利用' : '廃棄'})` 
        });
        
        // フォームをリセット
        setSelectedMaterialId(null);
        setQuantity(1);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'エラーが発生しました' });
      console.error('Picking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 棚位置をランダム生成（シミュレーション用）
  const generateRandomLocation = () => {
    const materialIndex = Math.floor(Math.random() * materials.length);
    if (materials[materialIndex]) {
      setSelectedMaterialId(materials[materialIndex].id);
    }
  };

  return (
    <div className="px-4 py-2 lg:py-4 pt-20 lg:pt-4 w-full">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">ピッキング登録</h1>
        <p className="text-gray-600">残材を棚から取り出す作業を記録</p>
      </div>
      
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
                disabled={isLoading}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
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
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コード</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">在庫数</th>
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
                        {searchTerm ? '検索結果がありません' : '在庫がありません'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 選択中の材料情報 */}
          {selectedMaterial && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-blue-700">
                <Sparkles className="w-4 h-4" />
                選択中の残材情報
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">名称</p>
                  <p className="font-medium text-gray-800">{selectedMaterial.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">サイズ</p>
                  <p className="font-medium text-gray-800">{selectedMaterial.size}</p>
                </div>
                <div>
                  <p className="text-gray-600">現在位置</p>
                  <p className="font-medium text-gray-800">{selectedMaterial.location}</p>
                </div>
                <div>
                  <p className="text-gray-600">在庫数</p>
                  <p className="font-medium text-gray-800">
                    {selectedMaterial.quantity} {selectedMaterial.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 数量選択 */}
          <div>
            <label className="block text-sm font-medium mb-2">数量</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isLoading || quantity <= 1}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                max={selectedMaterial ? selectedMaterial.quantity : 1}
                className="w-20 text-center py-2 bg-white border border-gray-300 rounded-md text-lg font-medium"
                disabled={isLoading}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isLoading || !!(selectedMaterial && quantity >= selectedMaterial.quantity)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-gray-500">
                {selectedMaterial ? selectedMaterial.unit : ''}
              </span>
            </div>
          </div>

          {/* 用途選択 */}
          <div>
            <label className="block text-sm font-medium mb-2">用途</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer transition-all duration-200 ${
                purpose === 'reuse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="reuse"
                  checked={purpose === 'reuse'}
                  onChange={() => setPurpose('reuse')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <ArrowUp className="w-4 h-4 mr-2" />
                再利用
              </label>
              <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer transition-all duration-200 ${
                purpose === 'dispose'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="dispose"
                  checked={purpose === 'dispose'}
                  onChange={() => setPurpose('dispose')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <X className="w-4 h-4 mr-2" />
                廃棄
              </label>
            </div>
          </div>

          {/* RFIDスキャンボタン */}
          <div className="flex justify-center">
            <button
              onClick={generateRandomLocation}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              <ScanLine className="w-5 h-5" />
              RFIDスキャンをシミュレート
            </button>
          </div>

          {/* 実行ボタン */}
          <button
            onClick={handlePicking}
            disabled={isLoading || selectedMaterialId === null}
            className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 transition ${
              isLoading || selectedMaterialId === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {isLoading ? '処理中...' : 'ピッキング登録'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickingView; 