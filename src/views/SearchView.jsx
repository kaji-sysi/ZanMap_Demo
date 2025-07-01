import React, { useState } from 'react';
import { Search, List, Map as MapIcon, Info, FileText, Download, Box } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';

const SearchView = ({ materials, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' または 'map'
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // 検索フィルター
  const filteredMaterials = materials.filter(material => {
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

  // 検索結果をCSVとしてエクスポート
  const exportToCSV = () => {
    if (filteredMaterials.length === 0) return;
    
    const headers = ['コード', '名称', 'カテゴリ', 'サイズ', '数量', '場所', '説明'];
    const csvData = filteredMaterials.map(item => {
      return [
        item.code,
        item.name,
        item.category,
        item.size || '',
        item.quantity,
        item.location,
        item.description
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `残材検索結果_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">残材検索</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="キーワード検索（名称、コード、場所など）"
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sizeSearch}
              onChange={(e) => setSizeSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full justify-center"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSizeSearch('');
              }}
            >
              <Search className="w-5 h-5 mr-2" />
              クリア
            </button>
            
            <button
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              onClick={exportToCSV}
              disabled={filteredMaterials.length === 0}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 検索結果 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            検索結果: {filteredMaterials.length}件
          </h2>
          
          <div className="flex space-x-2">
            <button
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('list')}
              title="一覧表示"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">場所</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMaterials.map(material => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.quantity}</td>
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

      {/* 残材詳細モーダル */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{selectedMaterial.name}</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">コード:</span>
                <span className="font-medium">{selectedMaterial.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">カテゴリ:</span>
                <span className="font-medium">{selectedMaterial.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">サイズ:</span>
                <span className="font-medium">{selectedMaterial.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">数量:</span>
                <span className="font-medium">{selectedMaterial.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">場所:</span>
                <span className="font-medium">{selectedMaterial.location}</span>
              </div>
              <div>
                <span className="text-gray-600">説明:</span>
                <p className="mt-1">{selectedMaterial.description}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setSelectedMaterial(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView; 