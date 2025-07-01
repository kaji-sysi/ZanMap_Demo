'use client';

import React, { useMemo, useState } from 'react';
import { Clock, ArrowUp, ArrowDown, User, Layers, Search, Filter } from 'lucide-react';
import { Material, HistoryEntry } from '@/app/types';

interface HistoryViewProps {
  history: HistoryEntry[];
  materials: Material[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, materials }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // 履歴のフィルタリングとソート
  const filteredAndSortedHistory = useMemo(() => {
    // フィルタリング
    const filtered = history.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'in' && item.type.includes('入庫')) || 
        (typeFilter === 'out' && item.type.includes('ピッキング'));
      
      return matchesSearch && matchesType;
    });
    
    // ソート（デフォルトは新しい順）
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp.replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2'));
      const dateB = new Date(b.timestamp.replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2'));
      
      return sortOrder === 'desc' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });
  }, [history, searchTerm, typeFilter, sortOrder]);

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">作業履歴</h1>
        <p className="text-gray-600">すべての入出庫作業の記録</p>
      </div>
      
      {/* 検索とフィルタ */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="材料名、作業者、場所で検索"
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:w-48 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">すべての作業</option>
              <option value="in">入庫のみ</option>
              <option value="out">出庫のみ</option>
            </select>
          </div>
          
          <div className="md:w-48">
            <select
              className="px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 履歴テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              {filteredAndSortedHistory.length > 0 ? (
                filteredAndSortedHistory.map(item => (
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
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-3 h-8 bg-gray-100 text-gray-700 rounded-md font-medium">
                        {item.quantity}
                        {(() => {
                          // 材料IDから単位を取得
                          const material = materials.find(m => m.id === item.material_id);
                          return material ? ` ${material.unit}` : '';
                        })()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        {item.operator}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    履歴データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* ページネーション（必要に応じて） */}
        {filteredAndSortedHistory.length > 0 && filteredAndSortedHistory.length > 10 && (
          <div className="flex justify-center items-center p-4 border-t border-gray-200">
            <button className="px-3 py-1 border rounded-md mr-2 text-sm hover:bg-gray-50">前へ</button>
            <span className="text-sm mx-2">1/3 ページ</span>
            <button className="px-3 py-1 border rounded-md ml-2 text-sm hover:bg-gray-50">次へ</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView; 