'use client';

import React, { useMemo, useState } from 'react';
import { Tag, Layers, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Material } from '@/app/types';

interface InventoryViewProps {
  materials: Material[];
  categories: string[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ materials, categories }) => {
  // 検索とフィルタリング用の状態
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Material>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 材料リストのフィルタリングとソート
  const filteredAndSortedMaterials = useMemo(() => {
    // 検索とカテゴリフィルタを適用
    let filtered = materials.filter(material => {
      const matchesSearch = 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        material.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      // 文字列の場合
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // 数値の場合
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB 
          : fieldB - fieldA;
      }
      
      return 0;
    });

    return sorted;
  }, [materials, searchTerm, selectedCategory, sortField, sortDirection]);

  // 在庫状況の統計
  const stats = useMemo(() => {
    const total = materials.length;
    const inStock = materials.filter(m => m.quantity > 0).length;
    const outOfStock = materials.filter(m => m.quantity === 0).length;
    
    return { total, inStock, outOfStock };
  }, [materials]);

  // ソートを切り替える関数
  const toggleSort = (field: keyof Material) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Material) => {
    if (field !== sortField) return <ArrowUpDown size={14} className="opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown size={14} className="text-blue-600" />
      : <ArrowUpDown size={14} className="text-blue-600 rotate-180" />;
  };

  return (
    <div className="px-4 py-2 lg:py-4 pt-20 lg:pt-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">在庫トラッキング</h1>
        <p className="text-gray-600">リアルタイムの在庫状況を確認</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総アイテム数</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">在庫あり</p>
              <p className="text-2xl font-bold">{stats.inStock}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">在庫切れ</p>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とフィルタ */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 mb-4">検索・フィルタ</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="text-sm text-gray-600 mb-1 block">キーワード検索</label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="名前、コード、場所で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="text-sm text-gray-600 mb-1 block">カテゴリ</label>
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">すべてのカテゴリ</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 在庫テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('code')}
                  >
                    コード {getSortIcon('code')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('name')}
                  >
                    名称 {getSortIcon('name')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('category')}
                  >
                    カテゴリ {getSortIcon('category')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <span className="text-sm font-semibold text-gray-700">サイズ</span>
                </th>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('quantity')}
                  >
                    数量 {getSortIcon('quantity')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('location')}
                  >
                    場所 {getSortIcon('location')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button 
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                    onClick={() => toggleSort('updated_at')}
                  >
                    最終更新 {getSortIcon('updated_at')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMaterials.length > 0 ? (
                filteredAndSortedMaterials.map(material => (
                  <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {material.code}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{material.name}</td>
                    <td className="p-4 text-gray-600">{material.category}</td>
                    <td className="p-4 text-sm text-gray-600">{material.size}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md text-sm font-medium ${
                        material.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {material.quantity} {material.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Layers className="w-4 h-4 text-gray-400" />
                        {material.location}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {material.updated_at}
                      <div className="text-xs text-gray-400">{material.last_action}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    {searchTerm || selectedCategory !== 'all'
                      ? '該当するアイテムがありません'
                      : '在庫データがありません'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryView; 