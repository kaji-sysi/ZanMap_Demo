import React from 'react';
import { Clock, ArrowUp, ArrowDown, User, Layers } from 'lucide-react';

const HistoryView = ({ history }) => {
  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">作業履歴</h1>
        <p className="text-gray-600">すべての入出庫作業の記録</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">日時</th>
                <th className="text-left p-4 font-semibold text-gray-700">作業</th>
                <th className="text-left p-4 font-semibold text-gray-700">残材</th>
                <th className="text-left p-4 font-semibold text-gray-700">場所</th>
                <th className="text-left p-4 font-semibold text-gray-700">数量</th>
                <th className="text-left p-4 font-semibold text-gray-700">作業者</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{item.timestamp}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      item.type.includes('入庫') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.type.includes('入庫') ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{item.material_name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {item.location}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center w-12 h-8 bg-gray-100 text-gray-700 rounded-lg font-medium">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {item.operator}
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

export default HistoryView; 