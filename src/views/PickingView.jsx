import React, { useState } from 'react';
import { ScanLine, Minus, Plus, Check, X, ArrowUp, Sparkles } from 'lucide-react';

const PickingView = ({ simulateRFIDScan, setWorkHistory, workHistory, currentUser, setNotification }) => {
  const [scannedMaterial, setScannedMaterial] = useState('');
  const [purpose, setPurpose] = useState('reuse');
  const [quantity, setQuantity] = useState(1);

  const handlePicking = () => {
    if (!scannedMaterial) {
      setNotification({ type: 'error', message: 'RFIDをスキャンしてください' });
      return;
    }

    const newHistory = {
      id: Date.now().toString(),
      action: 'out',
      materialId: '1',
      materialName: 'SUS304板材',
      location: 'A-1-1',
      quantity: quantity,
      worker: currentUser?.name || '',
      timestamp: new Date(),
      purpose: purpose === 'reuse' ? '再利用' : '廃棄'
    };

    setWorkHistory([newHistory, ...workHistory]);
    setNotification({ type: 'success', message: 'ピッキングを登録しました' });
    
    setScannedMaterial('');
    setQuantity(1);
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">ピッキング登録</h1>
        <p className="text-gray-600">残材を棚から取り出す作業を記録</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">残材RFID</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={scannedMaterial}
                  readOnly
                  className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="RFIDをスキャンしてください"
                />
              </div>
              <button
                onClick={() => {
                  const tag = simulateRFIDScan();
                  setScannedMaterial(tag);
                }}
                className="bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition duration-200 shadow-md flex items-center gap-2 font-medium"
              >
                <ScanLine className="w-5 h-5" />
                スキャン
              </button>
            </div>
          </div>

          {scannedMaterial && (
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                残材情報
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">名称</p>
                  <p className="font-medium text-gray-800">SUS304板材</p>
                </div>
                <div>
                  <p className="text-gray-600">サイズ</p>
                  <p className="font-medium text-gray-800">1000×500×10mm</p>
                </div>
                <div>
                  <p className="text-gray-600">現在位置</p>
                  <p className="font-medium text-gray-800">A-1-1</p>
                </div>
                <div>
                  <p className="text-gray-600">在庫数</p>
                  <p className="font-medium text-gray-800">5個</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">数量</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className="w-24 text-center py-3 bg-gray-50 border border-gray-200 rounded-xl text-xl font-semibold"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">用途</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                purpose === 'reuse'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="reuse"
                  checked={purpose === 'reuse'}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="sr-only"
                />
                <ArrowUp className="w-5 h-5 mr-2" />
                再利用
              </label>
              <label className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                purpose === 'dispose'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="dispose"
                  checked={purpose === 'dispose'}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="sr-only"
                />
                <X className="w-5 h-5 mr-2" />
                廃棄
              </label>
            </div>
          </div>

          <button
            onClick={handlePicking}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition duration-200 shadow-md font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" />
            ピッキング登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickingView; 