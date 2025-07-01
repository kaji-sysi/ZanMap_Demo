import React from 'react';
import { Package, Check, Calendar } from 'lucide-react';

const DashboardView = ({ materials, history }) => {
  const totalMaterials = materials.length;
  const availableMaterials = materials.filter(m => m.quantity > 0).length;
  
  // 今日の日付を取得
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').join('-');
  
  // 今日の作業数を取得（簡易的な比較）
  const todayActivities = history.filter(h => {
    const historyDate = h.timestamp.split(' ')[0];
    return historyDate === today;
  }).length;

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6">ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">総残材数</p>
              <p className="text-3xl font-bold text-gray-800">{totalMaterials}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">利用可能</p>
              <p className="text-3xl font-bold text-gray-800">{availableMaterials}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Check className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">本日の作業</p>
              <p className="text-3xl font-bold text-gray-800">{todayActivities}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">最近の作業履歴</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">時刻</th>
                <th className="text-left p-2">作業</th>
                <th className="text-left p-2">残材</th>
                <th className="text-left p-2">作業者</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{item.timestamp}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type.includes('入庫') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-2">{item.material_name}</td>
                  <td className="p-2">{item.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView; 