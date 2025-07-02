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
  Upload
} from 'lucide-react';
import type { ShelfMaster } from '../types/warehouse';
import { shelfMasterManager } from '../lib/shelfMasterData';
import ShelfMasterModal from './ShelfMasterModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ShelfMasterManagementProps {
  onSelectShelf?: (shelf: ShelfMaster) => void;
}

const ShelfMasterManagement: React.FC<ShelfMasterManagementProps> = ({
  onSelectShelf
}) => {
  const [shelfMasters, setShelfMasters] = useState<ShelfMaster[]>([]);
  const [filteredShelves, setFilteredShelves] = useState<ShelfMaster[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShelfType, setSelectedShelfType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<ShelfMaster | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShelfMaster | null>(null);

  // データの読み込み
  useEffect(() => {
    loadShelfMasters();
  }, []);

  // 検索・フィルタリング
  useEffect(() => {
    let filtered = shelfMasters;

    // 検索フィルタ
    if (searchTerm) {
      filtered = shelfMasterManager.searchShelfMasters(searchTerm);
    }

    // 棚タイプフィルタ
    if (selectedShelfType !== 'all') {
      filtered = filtered.filter(shelf => shelf.shelfType.id === selectedShelfType);
    }

    setFilteredShelves(filtered);
  }, [shelfMasters, searchTerm, selectedShelfType]);

  const loadShelfMasters = () => {
    const masters = shelfMasterManager.getAllShelfMasters();
    setShelfMasters(masters);
  };

  const handleCreateNew = () => {
    setEditingShelf(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shelf: ShelfMaster) => {
    setEditingShelf(shelf);
    setIsModalOpen(true);
  };

  const handleSave = (shelf: ShelfMaster) => {
    let success = false;
    
    if (editingShelf) {
      // 編集
      success = shelfMasterManager.updateShelfMaster(shelf);
    } else {
      // 新規作成
      success = shelfMasterManager.addShelfMaster(shelf);
    }

    if (success) {
      loadShelfMasters();
      setIsModalOpen(false);
      setEditingShelf(null);
    } else {
      alert(editingShelf ? '更新に失敗しました。棚コードが重複している可能性があります。' : '作成に失敗しました。棚コードが重複している可能性があります。');
    }
  };

  const handleDelete = (shelf: ShelfMaster) => {
    console.log('削除ボタンクリック:', shelf.id, shelf.name);
    setDeleteTarget(shelf);
  };

  const confirmDelete = () => {
    console.log('削除確認処理開始:', deleteTarget);
    if (deleteTarget) {
      console.log('削除対象:', deleteTarget.id, deleteTarget.name);
      const success = shelfMasterManager.deleteShelfMaster(deleteTarget.id);
      console.log('削除結果:', success);
      
      if (success) {
        console.log('削除成功、データを再読み込み');
        loadShelfMasters();
      } else {
        console.log('削除失敗');
        alert('削除に失敗しました。');
      }
      setDeleteTarget(null);
    } else {
      console.log('削除対象がnullです');
    }
  };

  const handleCopy = (shelf: ShelfMaster) => {
    const copiedShelf: ShelfMaster = {
      ...shelf,
      id: `shelf_${Date.now()}`,
      name: `${shelf.name} (コピー)`,
      code: `${shelf.code}_COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingShelf(copiedShelf);
    setIsModalOpen(true);
  };

  const getUniqueShelfTypes = () => {
    const types = shelfMasters.map(shelf => shelf.shelfType);
    const uniqueTypes = types.filter((type, index, self) => 
      index === self.findIndex(t => t.id === type.id)
    );
    return uniqueTypes;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">棚マスタ管理</h2>
            <p className="text-sm text-gray-600 mt-1">
              棚の基本情報を管理します。レイアウトで使用する棚を事前に登録してください。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規登録
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md" aria-label="ダウンロード">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md" aria-label="アップロード">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{shelfMasters.length}</div>
            <div className="text-sm text-gray-600">総棚数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {shelfMasters.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-gray-600">アクティブ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {getUniqueShelfTypes().length}
            </div>
            <div className="text-sm text-gray-600">棚タイプ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredShelves.length}
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
              placeholder="棚名・タイプで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* タイプフィルタ */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedShelfType}
              onChange={(e) => setSelectedShelfType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="棚タイプでフィルタ"
            >
              <option value="all">すべてのタイプ</option>
              {getUniqueShelfTypes().map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 棚マスタ一覧 */}
      <div className="p-6">
        {filteredShelves.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedShelfType !== 'all' ? '該当する棚がありません' : '棚マスタがありません'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedShelfType !== 'all' ? '検索条件を変更してください。' : '新しい棚マスタを登録してください。'}
            </p>
            {!searchTerm && selectedShelfType === 'all' && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                最初の棚を登録
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShelves.map(shelf => (
              <div 
                key={shelf.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                onClick={() => onSelectShelf?.(shelf)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{shelf.shelfType.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{shelf.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {shelf.shelfType.name}
                          </span>
                          {shelf.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              アクティブ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>サイズ: {shelf.rows}段 × {shelf.columns}列</span>
                        {shelf.levels > 1 && <span>階層: {shelf.levels}層</span>}
                        <span>対応材料: {shelf.materialTypes.length}種</span>
                      </div>
                      <div className="mt-1">
                        作成: {new Date(shelf.createdAt).toLocaleDateString()} | 
                        更新: {new Date(shelf.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(shelf);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="編集"
                      aria-label="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(shelf);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                      title="コピー"
                      aria-label="コピー"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(shelf);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="削除"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* モーダル */}
      <ShelfMasterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShelf(null);
        }}
        onSave={handleSave}
        editingShelf={editingShelf}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        message={deleteTarget?.name ? `棚「${deleteTarget.name}」を削除しますか？この操作は取り消せません。` : '棚を削除しますか？この操作は取り消せません。'}
      />
    </div>
  );
};

export default ShelfMasterManagement; 