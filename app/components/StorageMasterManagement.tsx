import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Package,
  Eye,
  Copy,
  Download,
  Upload,
  Layers,
  Weight,
  Box
} from 'lucide-react';
import type { StorageMaster, StorageType } from '../types/warehouse';
import { storageMasterManager } from '../lib/storageMasterData';
import StorageMasterModal from './StorageMasterModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface StorageMasterManagementProps {
  onSelectStorage?: (storage: StorageMaster) => void;
}

const StorageMasterManagement: React.FC<StorageMasterManagementProps> = ({
  onSelectStorage
}) => {
  const [storageMasters, setStorageMasters] = useState<StorageMaster[]>([]);
  const [filteredStorages, setFilteredStorages] = useState<StorageMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStorageType, setSelectedStorageType] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<StorageMaster | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorageMaster | null>(null);

  // データの読み込み
  useEffect(() => {
    loadStorageMasters();
  }, []);

  // 検索・フィルタリング
  useEffect(() => {
    let filtered = storageMasters;

    // 検索フィルタ
    if (searchTerm) {
      filtered = storageMasterManager.searchStorageMasters(searchTerm);
    }

    // 置き場タイプフィルタ
    if (selectedStorageType !== 'all') {
      filtered = filtered.filter(storage => storage.storageType === selectedStorageType);
    }

    setFilteredStorages(filtered);
  }, [storageMasters, searchTerm, selectedStorageType]);

  const loadStorageMasters = () => {
    const masters = storageMasterManager.getAllStorageMasters();
    setStorageMasters(masters);
  };

  const handleCreateNew = () => {
    setEditingStorage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (storage: StorageMaster) => {
    setEditingStorage(storage);
    setIsModalOpen(true);
  };

  const handleSave = (storage: StorageMaster) => {
    let success = false;
    
    if (editingStorage) {
      // 編集
      success = storageMasterManager.updateStorageMaster(storage);
    } else {
      // 新規作成
      success = storageMasterManager.addStorageMaster(storage);
    }

    if (success) {
      loadStorageMasters();
      setIsModalOpen(false);
      setEditingStorage(null);
    } else {
      alert(editingStorage ? '更新に失敗しました。置き場コードが重複している可能性があります。' : '作成に失敗しました。置き場コードが重複している可能性があります。');
    }
  };

  const handleDelete = (storage: StorageMaster) => {
    setDeleteTarget(storage);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const success = storageMasterManager.deleteStorageMaster(deleteTarget.id);
      
      if (success) {
        loadStorageMasters();
      } else {
        alert('削除に失敗しました。');
      }
      setDeleteTarget(null);
    }
  };

  const handleCopy = (storage: StorageMaster) => {
    const copiedStorage: StorageMaster = {
      ...storage,
      id: `storage_${Date.now()}`,
      name: `${storage.name} (コピー)`,
      code: `${storage.code}_COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingStorage(copiedStorage);
    setIsModalOpen(true);
  };

  const getUniqueStorageTypes = () => {
    const types = storageMasters.map(storage => storage.storageType);
    return [...new Set(types)];
  };



  const getStorageTypeName = (type: StorageType): string => {
    return storageMasterManager.getStorageTypeName(type);
  };



  const getStorageTypeIcon = (type: StorageType): React.ReactNode => {
    const typeMaster = storageMasterManager.getStorageTypeMaster(type);
    if (typeMaster) {
      return <span className="text-lg">{typeMaster.icon}</span>;
    }
    
    const icons: { [key in StorageType]: React.ReactNode } = {
      'shelf': <Package className="w-4 h-4" />,
      'rack': <Layers className="w-4 h-4" />,
      'pallet': <Box className="w-4 h-4" />,
      'floor_area': <div className="w-4 h-4 border border-current" />,
      'box': <Package className="w-4 h-4" />,
      'tank': <div className="w-4 h-4 rounded-full border border-current" />
    };
    return icons[type];
  };

  const getCapacityInfo = (storage: StorageMaster): string => {
    return `${storage.rows || 0}×${storage.columns || 0}×${storage.levels || 1}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              置き場マスタ管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              様々な置き場（棚・ラック・パレット等）の基本情報を管理します。レイアウトで使用する置き場を事前に登録してください。
            </p>
          </div>
          <button
            onClick={handleCreateNew}
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
            <div className="text-2xl font-bold text-blue-600">{storageMasters.length}</div>
            <div className="text-sm text-gray-600">総置き場数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {storageMasters.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-gray-600">アクティブ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {getUniqueStorageTypes().length}
            </div>
            <div className="text-sm text-gray-600">置き場タイプ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredStorages.length}
            </div>
            <div className="text-sm text-gray-600">検索結果</div>
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
              placeholder="置き場名、コード、説明で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 置き場タイプフィルタ */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedStorageType}
              onChange={(e) => setSelectedStorageType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              aria-label="置き場タイプでフィルタ"
            >
              <option value="all">すべてのタイプ</option>
              {getUniqueStorageTypes().map((type) => (
                <option key={type} value={type}>
                  {getStorageTypeName(type)}
                </option>
              ))}
            </select>
          </div>


        </div>
      </div>

      {/* 置き場一覧 */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredStorages.map(storage => (
            <div key={storage.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {getStorageTypeIcon(storage.storageType)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{storage.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">コード: {storage.code}</span>
                        <span className="text-sm text-gray-500">
                          タイプ: {getStorageTypeName(storage.storageType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          構成: {getCapacityInfo(storage)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">対応材料:</div>
                    <div className="flex flex-wrap gap-1">
                      {storage.materialTypes.slice(0, 5).map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {type}
                        </span>
                      ))}
                      {storage.materialTypes.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{storage.materialTypes.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  {storage.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{storage.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right mr-4">
                    <div className="text-sm text-gray-500">サイズ</div>
                    <div className="text-sm font-medium">{storage.width}×{storage.height}px</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {storage.isActive ? (
                        <span className="text-green-600">アクティブ</span>
                      ) : (
                        <span className="text-gray-500">非アクティブ</span>
                      )}
                    </div>
                  </div>
                  
                  {onSelectStorage && (
                    <button
                      onClick={() => onSelectStorage(storage)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="選択"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(storage)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(storage)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                    title="コピー"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(storage)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStorages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">
              {searchTerm || selectedStorageType !== 'all' 
                ? '検索条件に一致する置き場が見つかりません'
                : '置き場が登録されていません'
              }
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm || selectedStorageType !== 'all' 
                ? '検索条件を変更してお試しください'
                : '「新規登録」ボタンから最初の置き場を登録してください'
              }
            </p>
          </div>
        )}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <StorageMasterModal
          storage={editingStorage}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingStorage(null);
          }}
        />
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title="置き場の削除"
        message={deleteTarget ? `置き場「${deleteTarget.name}」を削除しますか？この操作は取り消せません。` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default StorageMasterManagement; 