import React from 'react';
import { Tag, Layers } from 'lucide-react';

const InventoryView = ({ materials }) => {
  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">在庫トラッキング</h1>
        <p className="text-gray-600">リアルタイムの在庫状況を確認</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">現在の在庫状況</h2>
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              利用可能: {materials.filter(m => m.status === 'available').length}
            </span>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              使用中: {materials.filter(m => m.status === 'in-use').length}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">RFID</th>
                <th className="text-left p-4 font-semibold text-gray-700">名称</th>
                <th className="text-left p-4 font-semibold text-gray-700">種類</th>
                <th className="text-left p-4 font-semibold text-gray-700">サイズ</th>
                <th className="text-left p-4 font-semibold text-gray-700">数量</th>
                <th className="text-left p-4 font-semibold text-gray-700">場所</th>
                <th className="text-left p-4 font-semibold text-gray-700">状態</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(material => (
                <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {material.rfidTag}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{material.name}</td>
                  <td className="p-4 text-gray-600">{material.type}</td>
                  <td className="p-4 text-sm text-gray-600">{material.size}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center w-12 h-8 bg-gray-100 text-gray-700 rounded-lg font-medium">
                      {material.quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {material.location}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      material.status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : material.status === 'in-use'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        material.status === 'available' 
                          ? 'bg-green-500' 
                          : material.status === 'in-use'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}></div>
                      {material.status === 'available' ? '利用可能' : 
                       material.status === 'in-use' ? '使用中' : '予約済'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryView; 