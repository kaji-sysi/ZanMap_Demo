import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Map
} from 'lucide-react';
import type { WarehouseLayout } from '../types/warehouse';
import WarehouseLayoutEditor from './WarehouseLayoutEditor';

interface WarehouseMasterViewProps {
  layouts: WarehouseLayout[];
  onSaveLayout: (layout: WarehouseLayout) => void;
  onDeleteLayout: (layoutId: string) => void;
}

const WarehouseMasterView: React.FC<WarehouseMasterViewProps> = ({
  layouts,
  onSaveLayout,
  onDeleteLayout
}) => {
  const [editingLayout, setEditingLayout] = useState<WarehouseLayout | null>(null);

  // 新しいレイアウトを作成
  const createNewLayout = () => {
    const newLayout: WarehouseLayout = {
      id: `layout_${Date.now()}`,
      name: '新しい倉庫レイアウト',
      version: '1.0',
      width: 1200,
      height: 800,
      areas: [
        {
          id: 'area_default',
          name: 'メインエリア',
          code: 'A',
          x: 50,
          y: 50,
          width: 300,
          height: 200,
          color: '#EBF8FF',
          borderColor: '#3182CE',
          description: 'デフォルトエリア',
          isActive: true,
          shape: {
            type: 'rectangle',
            points: [
              { x: 0, y: 0 },
              { x: 300, y: 0 },
              { x: 300, y: 200 },
              { x: 0, y: 200 }
            ]
          }
        }
      ],
      shelves: [],
      storages: [],
      facilities: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user'
    };
    console.log('新規レイアウト作成:', newLayout.id, newLayout.name);
    setEditingLayout(newLayout);
  };

  // 既存レイアウトの編集
  const editExistingLayout = (layout: WarehouseLayout) => {
    console.log('既存レイアウトの編集開始:', layout.id, layout.name);
    // 既存レイアウトをそのまま編集モードに設定（IDを変更しない）
    setEditingLayout({ ...layout });
  };

  // レイアウトのコピー
  const copyLayout = (layout: WarehouseLayout) => {
    const copiedLayout: WarehouseLayout = {
      ...layout,
      id: `layout_${Date.now()}`,
      name: `${layout.name} (コピー)`,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('レイアウトのコピー作成:', copiedLayout.id, copiedLayout.name);
    setEditingLayout(copiedLayout);
  };

  // 編集完了時の処理
  const handleSaveLayout = (layout: WarehouseLayout) => {
    const existingLayout = layouts.find(l => l.id === layout.id);
    console.log('WarehouseMasterView: 保存処理開始', {
      layoutId: layout.id,
      layoutName: layout.name,
      isNew: !existingLayout,
      existingLayout: existingLayout ? { id: existingLayout.id, name: existingLayout.name } : null,
      editingLayoutId: editingLayout?.id,
      allLayoutIds: layouts.map(l => l.id)
    });
    
    // 既存レイアウトの編集の場合、元のIDを保持し、作成日時も保持
    const finalLayout = {
      ...layout,
      updatedAt: new Date().toISOString(),
      // 既存レイアウトの場合は作成日時を保持
      createdAt: existingLayout ? existingLayout.createdAt : layout.createdAt
    };
    
    console.log('WarehouseMasterView: 最終レイアウト', finalLayout);
    onSaveLayout(finalLayout);
    setEditingLayout(null);
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingLayout(null);
  };

  // 棚やエリアの個別編集・削除機能は削除（レイアウトエディタで統合管理）

  // 編集モードの場合、エディタを表示
  if (editingLayout) {
    return (
      <WarehouseLayoutEditor
        layout={editingLayout}
        onSave={handleSaveLayout}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-blue-600" />
              倉庫レイアウト管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              倉庫レイアウトの作成、編集、管理を行います
            </p>
          </div>
          <button
            onClick={createNewLayout}
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
            <div className="text-2xl font-bold text-blue-600">{layouts.length}</div>
            <div className="text-sm text-gray-600">総レイアウト数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {layouts.filter(l => l.isActive).length}
            </div>
            <div className="text-sm text-gray-600">アクティブ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {layouts.reduce((sum, l) => sum + l.areas.length, 0)}
            </div>
            <div className="text-sm text-gray-600">総エリア数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {layouts.reduce((sum, l) => sum + (l.storages?.length || 0) + l.facilities.length, 0)}
            </div>
            <div className="text-sm text-gray-600">総設備・置き場数</div>
          </div>
        </div>
      </div>

      {/* レイアウト一覧 */}
      <div className="p-6">
        <div className="space-y-4">
          {layouts.map(layout => (
            <div key={layout.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">{layout.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      v{layout.version}
                    </span>
                    {layout.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        アクティブ
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>サイズ: {layout.width} × {layout.height}px</span>
                      <span>エリア: {layout.areas.length}個</span>
                      <span>置き場: {layout.storages?.length || 0}個</span>
                      <span>設備: {layout.facilities.length}個</span>
                    </div>
                    <div className="mt-1">
                      作成: {new Date(layout.createdAt).toLocaleDateString()} | 
                      更新: {new Date(layout.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editExistingLayout(layout)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyLayout(layout)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="コピー"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLayout(layout.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {layouts.length === 0 && (
            <div className="text-center py-12">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">レイアウトがありません</h3>
              <p className="text-gray-600 mb-4">新しい倉庫レイアウトを作成してください。</p>
              <button
                onClick={createNewLayout}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                最初のレイアウトを作成
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default WarehouseMasterView; 