import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Building2,
  Filter
} from 'lucide-react';
import type { FacilityMaster } from '../types/warehouse';
import { facilityMasterData, facilityTypes } from '../lib/facilityMasterData';
import FacilityMasterModal from './FacilityMasterModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const FacilityMasterManagement: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityMaster[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityMaster | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    facility: FacilityMaster | null;
  }>({
    isOpen: false,
    facility: null
  });

  // データ読み込み
  useEffect(() => {
    loadFacilities();
  }, []);

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

  // 設備マスタデータ読み込み
  const loadFacilities = () => {
    const data = facilityMasterData.getAllFacilities();
    setFacilities(data);
  };

  // 新規作成
  const handleCreate = () => {
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  // 編集
  const handleEdit = (facility: FacilityMaster) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  // 保存
  const handleSave = (facilityData: Omit<FacilityMaster, 'id'> | FacilityMaster) => {
    if ('id' in facilityData) {
      // 編集
      facilityMasterData.updateFacility(facilityData.id, facilityData);
    } else {
      // 新規作成
      facilityMasterData.addFacility(facilityData);
    }
    loadFacilities();
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  // 削除確認
  const handleDeleteConfirm = (facility: FacilityMaster) => {
    setDeleteConfirm({
      isOpen: true,
      facility
    });
  };

  // 削除実行
  const handleDelete = () => {
    if (deleteConfirm.facility) {
      console.log('設備マスタ削除開始:', deleteConfirm.facility.id, deleteConfirm.facility.name);
      const success = facilityMasterData.deleteFacility(deleteConfirm.facility.id);
      if (success) {
        loadFacilities();
        console.log('設備マスタ削除完了');
      }
    }
    setDeleteConfirm({ isOpen: false, facility: null });
  };

  // コピー
  const handleCopy = (facility: FacilityMaster) => {
    const copied = facilityMasterData.copyFacility(facility.id);
    if (copied) {
      loadFacilities();
    }
  };

  // 統計情報取得
  const getStatistics = () => {
    return facilityMasterData.getStatistics();
  };

  const stats = getStatistics();

  // 設備タイプ情報取得
  const getFacilityTypeInfo = (typeId: string) => {
    return facilityTypes.find(type => type.id === typeId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              設備マスタ管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              設備マスタの登録、編集、削除を行います
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規登録
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
            <div className="text-sm text-gray-600">総設備数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {facilities.filter(f => f.isActive).length}
            </div>
            <div className="text-sm text-gray-600">アクティブ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredFacilities.length}
            </div>
            <div className="text-sm text-gray-600">検索結果</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byType ? Object.keys(stats.byType).length : 0}
            </div>
            <div className="text-sm text-gray-600">使用中タイプ</div>
          </div>
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

      {/* 設備マスタ一覧 */}
      <div className="p-6">
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">設備マスタがありません</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all'
                ? '検索条件に一致する設備マスタが見つかりません'
                : '新しい設備マスタを登録してください'
              }
            </p>
            {!searchTerm && selectedType === 'all' && (
              <button
                onClick={handleCreate}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                最初の設備マスタを作成
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFacilities.map(facility => {
              const typeInfo = getFacilityTypeInfo(facility.type);
              return (
                <div key={facility.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeInfo?.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{facility.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {typeInfo?.name}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              facility.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {facility.isActive ? 'アクティブ' : '非アクティブ'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>タイプ: {facility.type}</span>
                          <span>カテゴリ: {typeInfo?.category || '一般'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(facility)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(facility)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        title="コピー"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(facility)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 設備マスタ登録・編集モーダル */}
      <FacilityMasterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFacility(null);
        }}
        onSave={handleSave}
        facility={editingFacility}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, facility: null })}
        onConfirm={handleDelete}
        itemName={deleteConfirm.facility?.name || ''}
        message={deleteConfirm.facility?.name 
          ? `設備マスタ「${deleteConfirm.facility.name}」を削除しますか？この操作は取り消せません。`
          : '設備マスタを削除しますか？この操作は取り消せません。'
        }
      />
    </div>
  );
};

export default FacilityMasterManagement; 