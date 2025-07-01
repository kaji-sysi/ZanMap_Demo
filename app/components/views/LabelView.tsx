'use client';

import React, { useState } from 'react';
import { QrCode, Package, Layers, User, Printer } from 'lucide-react';
import QRCodeGenerator from '../QRCodeGenerator';
import { Material, NotificationType } from '@/app/types';

interface LabelViewProps {
  materials: Material[];
  setNotification: (notification: NotificationType | null) => void;
}

type LabelType = 'material' | 'shelf' | 'worker';

const LabelView: React.FC<LabelViewProps> = ({ materials, setNotification }) => {
  const [labelType, setLabelType] = useState<LabelType>('material');
  const [materialName, setMaterialName] = useState<string>('');
  const [materialSize, setMaterialSize] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [shelfLocation, setShelfLocation] = useState<string>('');
  const [workerName, setWorkerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 材料選択処理
  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMaterialId(value ? parseInt(value) : '');
    
    if (value) {
      const material = materials.find(m => m.id === parseInt(value));
      if (material) {
        setMaterialName(material.name);
        setMaterialSize(material.size || '');
      }
    } else {
      setMaterialName('');
      setMaterialSize('');
    }
  };

  // ラベル発行処理
  const handlePrintLabel = () => {
    if (labelType === 'material' && !validateMaterialLabel()) {
      return;
    }
    
    if (labelType === 'shelf' && !shelfLocation.trim()) {
      setNotification({ type: 'error', message: '棚位置を入力してください' });
      return;
    }
    
    if (labelType === 'worker' && !workerName.trim()) {
      setNotification({ type: 'error', message: '作業者名を入力してください' });
      return;
    }
    
    setIsLoading(true);
    
    // ラベル発行のAPI呼び出しをシミュレート
    setTimeout(() => {
      setNotification({ 
        type: 'success', 
        message: `${getLabelTypeText()}ラベルを発行しました` 
      });
      setIsLoading(false);
    }, 1500);
  };

  // 材料ラベルのバリデーション
  const validateMaterialLabel = (): boolean => {
    if (!materialName.trim()) {
      setNotification({ type: 'error', message: '残材名称を入力してください' });
      return false;
    }
    return true;
  };

  // ラベル種類のテキスト取得
  const getLabelTypeText = (): string => {
    switch(labelType) {
      case 'material': return '残材';
      case 'shelf': return '棚';
      case 'worker': return '作業者';
      default: return '';
    }
  };

  // QRコードデータ生成
  const generateQRData = (): string => {
    const timestamp = new Date().toISOString();
    
    switch(labelType) {
      case 'material':
        if (selectedMaterialId) {
          const material = materials.find(m => m.id === Number(selectedMaterialId));
          return JSON.stringify({
            type: 'material',
            id: selectedMaterialId,
            code: material?.code || '',
            name: material?.name || materialName,
            size: material?.size || materialSize,
            category: material?.category || '',
            timestamp
          });
        } else {
          return JSON.stringify({
            type: 'material',
            name: materialName,
            size: materialSize,
            timestamp
          });
        }
      
      case 'shelf':
        return JSON.stringify({
          type: 'location',
          location: shelfLocation,
          area: shelfLocation.split('-')[0] || '',
          row: shelfLocation.split('-')[1] || '',
          shelf: shelfLocation.split('-')[2] || '',
          timestamp
        });
      
      case 'worker':
        return JSON.stringify({
          type: 'worker',
          name: workerName,
          timestamp
        });
      
      default:
        return '';
    }
  };

  return (
    <div className="px-4 py-2 lg:py-4 pt-20 lg:pt-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">ラベル発行</h1>
        <p className="text-gray-600">残材管理用のQRコードラベルを発行</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ラベル種類</label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-md cursor-pointer transition-all duration-200 ${
                labelType === 'material'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="material"
                  checked={labelType === 'material'}
                  onChange={() => setLabelType('material')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <Package className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">残材</span>
              </label>
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-md cursor-pointer transition-all duration-200 ${
                labelType === 'shelf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="shelf"
                  checked={labelType === 'shelf'}
                  onChange={() => setLabelType('shelf')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <Layers className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">棚</span>
              </label>
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-md cursor-pointer transition-all duration-200 ${
                labelType === 'worker'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="worker"
                  checked={labelType === 'worker'}
                  onChange={() => setLabelType('worker')}
                  className="sr-only"
                  disabled={isLoading}
                />
                <User className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">作業者</span>
              </label>
            </div>
          </div>

          {/* 残材ラベル用フォーム */}
          {labelType === 'material' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">登録済み残材から選択</label>
                <select
                  value={selectedMaterialId}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="">-- 残材を選択 --</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.code} - {material.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">残材名称</label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: SUS304板材"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">サイズ</label>
                <input
                  type="text"
                  value={materialSize}
                  onChange={(e) => setMaterialSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 1000×500×10mm"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {/* 棚ラベル用フォーム */}
          {labelType === 'shelf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">棚位置</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: A-1-1"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                棚の位置を入力してください。例: A-1-1（エリアA、棚番号1、段数1）
              </p>
            </div>
          )}

          {/* 作業者ラベル用フォーム */}
          {labelType === 'worker' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">作業者名</label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 田中太郎"
                disabled={isLoading}
              />
            </div>
          )}

          {/* ラベルプレビュー */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">ラベルプレビュー</h3>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border max-w-sm mx-auto">
              <div className="flex items-start gap-4">
                {/* QRコード */}
                <div className="flex-shrink-0">
                  <QRCodeGenerator
                    data={generateQRData()}
                    size={120}
                    errorCorrectionLevel="M"
                    className="rounded"
                  />
                </div>
                
                {/* ラベル情報 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">
                    {labelType === 'material' ? (materialName || '残材ラベル') : 
                     labelType === 'shelf' ? (shelfLocation || '棚位置') : 
                     (workerName || '作業者')}
                  </h4>
                  
                  {labelType === 'material' && (
                    <>
                      {materialSize && (
                        <p className="text-xs text-gray-600 mb-1">サイズ: {materialSize}</p>
                      )}
                      {selectedMaterialId && (
                        <p className="text-xs text-gray-600 mb-1">ID: {selectedMaterialId}</p>
                      )}
                    </>
                  )}
                  
                  {labelType === 'shelf' && shelfLocation && (
                    <p className="text-xs text-gray-600 mb-1">位置: {shelfLocation}</p>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    QRコード • {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              ラベルサイズ: 50×30mm • 耐水性 • 強粘着
            </p>
          </div>

          {/* ラベル発行ボタン */}
          <button
            onClick={handlePrintLabel}
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 transition ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Printer className="w-5 h-5" />
            {isLoading ? '処理中...' : 'ラベル発行'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelView; 