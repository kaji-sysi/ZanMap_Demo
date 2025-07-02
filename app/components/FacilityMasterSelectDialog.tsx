import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Building2, Plus } from 'lucide-react';
import type { FacilityMaster } from '../types/warehouse';
import { facilityMasterData, facilityTypes } from '../lib/facilityMasterData';

interface FacilityMasterSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (facility: FacilityMaster) => void;
  onCreateNew?: () => void;
}

const FacilityMasterSelectDialog: React.FC<FacilityMasterSelectDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  onCreateNew
}) => {
  const [facilities, setFacilities] = useState<FacilityMaster[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // データ読み込み
  useEffect(() => {
    if (isOpen) {
      const data = facilityMasterData.getAllFacilities();
      setFacilities(data);
    }
  }, [isOpen]);

  // フィルタリング
  useEffect(() => {
    let filtered = facilities;

    // 検索フィルタ
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(lowerSearch) ||
        facility.type.toLowerCase().includes(lowerSearch)
      );
    }

    // タイプフィルタ
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }

    // アクティブフィルタ
    if (showActiveOnly) {
      filtered = filtered.filter(facility => facility.isActive);
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchTerm, selectedType, showActiveOnly]);

  // 設備選択
  const handleSelect = (facility: FacilityMaster) => {
    onSelect(facility);
    onClose();
  };

  // 新規作成
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
      onClose();
    }
  };

  // 設備タイプ情報取得
  const getFacilityTypeInfo = (typeId: string) => {
    return facilityTypes.find(type => type.id === typeId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">設備マスタ選択</h2>
          </div>
          <div className="flex items-center gap-2">
            {onCreateNew && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規作成
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 検索・フィルタ */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="設備名・タイプで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* タイプフィルタ */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="設備タイプでフィルタ"
              >
                <option value="all">すべてのタイプ</option>
                {facilityTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* アクティブフィルタ */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">アクティブのみ</span>
            </label>
          </div>
        </div>

        {/* 設備一覧 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">設備マスタがありません</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== 'all'
                  ? '検索条件に一致する設備マスタが見つかりません'
                  : '設備マスタが登録されていません'
                }
              </p>
              {onCreateNew && !searchTerm && selectedType === 'all' && (
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                >
                  最初の設備マスタを作成
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map(facility => {
                const typeInfo = getFacilityTypeInfo(facility.type);
                return (
                  <button
                    key={facility.id}
                    onClick={() => handleSelect(facility)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
                  >
                    {/* ヘッダー */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{typeInfo?.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{facility.name}</h4>
                        <p className="text-sm text-gray-600">{typeInfo?.name}</p>
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>タイプ:</span>
                        <span>{typeInfo?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>カテゴリ:</span>
                        <span>{typeInfo?.category || '一般'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>状態:</span>
                        <span>{facility.isActive ? 'アクティブ' : '非アクティブ'}</span>
                      </div>
                    </div>

                    {/* プレビュー */}
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="flex items-center justify-center" style={{ height: '50px' }}>
                        <div
                          className="border-2 border-dashed flex items-center justify-center text-xs font-medium rounded"
                          style={{
                            width: '60px',
                            height: '40px',
                            borderColor: typeInfo?.color || '#6B7280',
                            backgroundColor: (typeInfo?.color || '#6B7280') + '20',
                            color: typeInfo?.color || '#6B7280'
                          }}
                        >
                          {typeInfo?.icon}
                        </div>
                      </div>
                    </div>

                    {/* 状態表示 */}
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        facility.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {facility.isActive ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {filteredFacilities.length}件の設備マスタが見つかりました
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityMasterSelectDialog; 