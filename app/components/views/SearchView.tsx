'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, List, Map as MapIcon, Info, FileText, Download, Box, X } from 'lucide-react';
import WarehouseMap from '../WarehouseMap';
import type { Material } from '../../types/materials';

interface SearchViewProps {
  materials: Material[];
  categories: string[];
}

const SearchView: React.FC<SearchViewProps> = ({ materials, categories }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sizeSearch, setSizeSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // 検索フィルター
  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = searchTerm === '' || 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || material.category === selectedCategory;
      
      const matchesSize = sizeSearch === '' || 
        (material.size && material.size.toLowerCase().includes(sizeSearch.toLowerCase()));
      
      return matchesSearch && matchesCategory && matchesSize;
    });
  }, [materials, searchTerm, selectedCategory, sizeSearch]);

  // 検索結果をCSVとしてエクスポート
  const exportToCSV = () => {
    const headers = ['コード', '名称', 'カテゴリ', 'サイズ', '数量', '単位', '保管場所', '説明'];
    
    const csvContent = [
      headers.join(','),
      ...filteredMaterials.map(material => [
        material.code,
        material.name,
        material.category,
        material.size || '',
        material.quantity,
        material.unit,
        material.location,
        material.description.replace(/,/g, ' ') // カンマをスペースに置換
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '残材検索結果.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 検索条件のクリア
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSizeSearch('');
  };

  // 残材詳細モーダル
  const MaterialDetailModal = selectedMaterial ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">残材詳細</h3>
            <button 
              className="text-gray-500 hover:text-gray-700" 
              onClick={() => setSelectedMaterial(null)}
            >
              ×
            </button>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">コード</p>
              <p className="mt-1">{selectedMaterial.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">名称</p>
              <p className="mt-1">{selectedMaterial.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">カテゴリ</p>
              <p className="mt-1">{selectedMaterial.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">サイズ</p>
              <p className="mt-1">{selectedMaterial.size || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">数量</p>
              <p className="mt-1">{selectedMaterial.quantity} {selectedMaterial.unit}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">保管場所</p>
              <p className="mt-1">{selectedMaterial.location}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">説明</p>
            <p className="mt-1">{selectedMaterial.description}</p>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 text-right">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={() => setSelectedMaterial(null)}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="px-4 py-2 lg:py-4 pt-20 lg:pt-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">残材検索</h1>
        <p className="text-gray-600">必要な残材を検索・確認できます</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="キーワード検索（名称、コード、場所など）"
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Box className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="サイズで検索（例: 1820×910）"
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sizeSearch}
              onChange={(e) => setSizeSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full justify-center"
              onClick={clearSearch}
            >
              <X className="w-5 h-5 mr-2" />
              クリア
            </button>
            
            <button
              className={`flex items-center px-4 py-2 rounded-md transition ${
                filteredMaterials.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={exportToCSV}
              disabled={filteredMaterials.length === 0}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 検索結果 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            検索結果: {filteredMaterials.length}件
          </h2>
          
          <div className="flex space-x-2">
            <button
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('list')}
              title="一覧表示"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('map')}
              title="マップ表示"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <>
            {filteredMaterials.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コード</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">サイズ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保管場所</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMaterials.map(material => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.quantity} {material.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => setSelectedMaterial(material)}
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>検索条件に一致する残材はありません</p>
              </div>
            )}
          </>
        ) : (
          <WarehouseMap 
            materials={filteredMaterials} 
            onSelectMaterial={setSelectedMaterial} 
          />
        )}
      </div>

      {MaterialDetailModal}
    </div>
  );
};

export default SearchView; 