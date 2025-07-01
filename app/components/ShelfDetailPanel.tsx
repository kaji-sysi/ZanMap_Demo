import React from 'react';
import { X, Package, AlertCircle, Eye } from 'lucide-react';
import type { Material, ShelfInfo, ShelfSlot } from '../types/materials';

interface ShelfDetailPanelProps {
  isOpen: boolean;
  shelfInfo: ShelfInfo | null;
  shelfSlots: ShelfSlot[];
  onClose: () => void;
  onSelectMaterial: (material: Material) => void;
}

const ShelfDetailPanel: React.FC<ShelfDetailPanelProps> = ({
  isOpen,
  shelfInfo,
  shelfSlots,
  onClose,
  onSelectMaterial
}) => {
  if (!isOpen || !shelfInfo) return null;

  // 段数の最大値を取得
  const maxLevels = Math.max(...shelfSlots.map(slot => slot.level), 5); // 最低5段は表示

  // グリッドデータを整理（level x shelf の二次元配列）
  const gridData: (ShelfSlot | null)[][] = [];
  for (let level = maxLevels; level >= 1; level--) { // 上段から表示
    const row: (ShelfSlot | null)[] = [];
    for (let shelf = 1; shelf <= shelfInfo.totalShelves; shelf++) {
      const slot = shelfSlots.find(s => s.level === level && s.shelf === shelf);
      row.push(slot || null);
    }
    gridData.push(row);
  }

  // カテゴリ別の色を取得
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      '合板': 'bg-blue-100 border-blue-300 text-blue-800',
      '木材': 'bg-green-100 border-green-300 text-green-800',
      '板材': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      '化粧板': 'bg-purple-100 border-purple-300 text-purple-800',
      '金属': 'bg-gray-100 border-gray-300 text-gray-800',
      'その他': 'bg-orange-100 border-orange-300 text-orange-800'
    };
    return colors[category] || 'bg-gray-50 border-gray-200 text-gray-600';
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* サイドパネル */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              棚詳細: {shelfInfo.area}-{shelfInfo.row}-{shelfInfo.shelf}
            </h2>
            <p className="text-sm text-gray-600">
              {maxLevels}段 × {shelfInfo.totalShelves}列 の棚
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* グリッド表示 */}
        <div className="p-4 overflow-y-auto h-full pb-16">
          <div className="space-y-2">
            {gridData.map((row, levelIndex) => (
              <div key={maxLevels - levelIndex} className="flex items-center gap-2">
                {/* 段番号 */}
                <div className="w-8 h-12 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                  {maxLevels - levelIndex}段
                </div>
                
                {/* 棚のマス目 */}
                <div className="flex gap-1 flex-1">
                  {row.map((slot, shelfIndex) => (
                    <div
                      key={shelfIndex}
                      className={`
                        flex-1 h-12 border-2 rounded cursor-pointer transition-all duration-200
                        ${slot?.material
                          ? `${getCategoryColor(slot.material.category)} hover:shadow-md`
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 border-dashed'
                        }
                      `}
                      onClick={() => slot?.material && onSelectMaterial(slot.material)}
                      title={
                        slot?.material
                          ? `${slot.material.name} (${slot.material.quantity}${slot.material.unit})`
                          : '空き'
                      }
                    >
                      <div className="p-1 h-full flex flex-col justify-center">
                        {slot?.material ? (
                          <>
                            <div className="text-xs font-medium truncate">
                              {slot.material.code}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {slot.material.quantity}{slot.material.unit}
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">空き</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 統計情報 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">統計情報</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">総容量</div>
                <div className="font-medium">
                  {maxLevels * shelfInfo.totalShelves} マス
                </div>
              </div>
              <div>
                <div className="text-gray-600">使用中</div>
                <div className="font-medium text-blue-600">
                  {shelfSlots.filter(slot => slot.material).length} マス
                </div>
              </div>
              <div>
                <div className="text-gray-600">空き</div>
                <div className="font-medium text-green-600">
                  {(maxLevels * shelfInfo.totalShelves) - shelfSlots.filter(slot => slot.material).length} マス
                </div>
              </div>
              <div>
                <div className="text-gray-600">使用率</div>
                <div className="font-medium">
                  {Math.round((shelfSlots.filter(slot => slot.material).length / (maxLevels * shelfInfo.totalShelves)) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* 材料一覧 */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">保管材料一覧</h3>
            <div className="space-y-2">
              {shelfSlots
                .filter(slot => slot.material)
                .map((slot, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getCategoryColor(slot.material!.category)}`}
                    onClick={() => onSelectMaterial(slot.material!)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{slot.material!.name}</div>
                        <div className="text-xs text-gray-600">
                          {slot.material!.code} | {slot.level}段目
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {slot.material!.quantity}{slot.material!.unit}
                        </div>
                        <div className="text-xs text-gray-600">
                          {slot.material!.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {shelfSlots.filter(slot => slot.material).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">この棚には材料が保管されていません</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShelfDetailPanel; 