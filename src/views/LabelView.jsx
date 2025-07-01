import React, { useState } from 'react';
import { QrCode, Package, Layers, User } from 'lucide-react';

const LabelView = ({ materials, setNotification }) => {
  const [labelType, setLabelType] = useState('material');
  const [materialName, setMaterialName] = useState('');
  const [materialSize, setMaterialSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');

  const handlePrintLabel = () => {
    setNotification({ type: 'success', message: `${labelType === 'material' ? '残材' : labelType === 'shelf' ? '棚' : '作業者'}ラベルを発行しました` });
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">ラベル発行</h1>
        <p className="text-gray-600">RFID内蔵ラベルの発行</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">ラベル種類</label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                labelType === 'material'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="material"
                  checked={labelType === 'material'}
                  onChange={(e) => setLabelType(e.target.value)}
                  className="sr-only"
                />
                <Package className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">残材</span>
              </label>
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                labelType === 'shelf'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="shelf"
                  checked={labelType === 'shelf'}
                  onChange={(e) => setLabelType(e.target.value)}
                  className="sr-only"
                />
                <Layers className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">棚</span>
              </label>
              <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                labelType === 'worker'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="radio"
                  value="worker"
                  checked={labelType === 'worker'}
                  onChange={(e) => setLabelType(e.target.value)}
                  className="sr-only"
                />
                <User className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">作業者</span>
              </label>
            </div>
          </div>

          {labelType === 'material' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">残材選択</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => {
                    setSelectedMaterial(e.target.value);
                    const material = materials.find(m => m.id.toString() === e.target.value);
                    if (material) {
                      setMaterialName(material.name);
                      setMaterialSize(material.size);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">残材名称</label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: SUS304板材"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">サイズ</label>
                <input
                  type="text"
                  value={materialSize}
                  onChange={(e) => setMaterialSize(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 1000×500×10mm"
                />
              </div>
            </>
          )}

          {labelType === 'shelf' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">棚位置</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: A-1-1"
              />
            </div>
          )}

          {labelType === 'worker' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">作業者名</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 田中太郎"
              />
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-md mb-4">
              <QrCode className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">ラベルプレビュー</p>
            <p className="text-sm text-gray-500">RFID内蔵ラベル • 50×30mm</p>
          </div>

          <button
            onClick={handlePrintLabel}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition duration-200 shadow-md font-semibold text-lg flex items-center justify-center gap-2"
          >
            <QrCode className="w-6 h-6" />
            ラベル発行
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelView; 