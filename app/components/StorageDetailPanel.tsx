import React from 'react';
import { X, Package, Weight, Ruler, BarChart3 } from 'lucide-react';
import type { StorageInfo, StorageSlot, Material } from '../types/materials';
import { storageMasterManager } from '../lib/storageMasterData';

interface StorageDetailPanelProps {
  storageInfo: StorageInfo | null;
  onClose: () => void;
  materials: Material[];
}

const StorageDetailPanel: React.FC<StorageDetailPanelProps> = ({
  storageInfo,
  onClose,
  materials
}) => {
  if (!storageInfo) return null;

  // 置き場に配置されている材料を取得
  const getStorageMaterials = () => {
    return materials.filter(material => 
      material.location.startsWith(storageInfo.code)
    );
  };

  const storageMaterials = getStorageMaterials();
  const storageMaster = storageMasterManager.getStorageMasterById(storageInfo.id);
  const storageTypeMaster = storageMaster ? 
    storageMasterManager.getStorageTypeMaster(storageMaster.storageType) : null;

  // 置き場タイプ別の表示コンポーネント
  const renderStorageContent = () => {
    switch (storageInfo.storageType) {
      case 'shelf':
        return renderShelfContent();
      case 'rack':
        return renderRackContent();
      case 'pallet':
        return renderPalletContent();
      case 'floor_area':
        return renderFloorAreaContent();
      case 'box':
        return renderBoxContent();
      case 'tank':
        return renderTankContent();
      default:
        return renderDefaultContent();
    }
  };

  // 棚（グリッドスロット型）の表示
  const renderShelfContent = () => {
    if (!storageInfo.rows || !storageInfo.columns) return renderDefaultContent();

    const slots: StorageSlot[] = [];
    for (let row = 1; row <= storageInfo.rows; row++) {
      for (let col = 1; col <= storageInfo.columns; col++) {
        for (let level = 1; level <= (storageInfo.levels || 1); level++) {
          const position = `${row}-${col}-${level}`;
          const locationPattern = `${storageInfo.code}-${position}`;
          const material = materials.find(m => m.location === locationPattern);
          
          slots.push({
            storageId: storageInfo.id,
            position,
            row,
            column: col,
            level,
            material,
            isEmpty: !material
          });
        }
      }
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          段×列×階層: {storageInfo.rows} × {storageInfo.columns} × {storageInfo.levels || 1}
        </div>
        <div className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${storageInfo.columns}, 1fr)`
        }}>
          {slots.map((slot) => (
            <div
              key={`${slot.row}-${slot.column}-${slot.level}`}
              className={`
                w-12 h-12 border-2 rounded flex items-center justify-center text-xs
                ${slot.isEmpty ? 
                  'border-gray-300 bg-gray-50' : 
                  `border-blue-400 ${getCategoryColor(slot.material?.category || '')}`
                }
              `}
              title={slot.material ? 
                `${slot.material.name} (${slot.material.category})` : 
                `空き (${slot.position})`
              }
            >
              {slot.material ? slot.material.category.slice(0, 2) : '空'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ラック（エリアベース型）の表示
  const renderRackContent = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">収容数:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentItems || 0} / {storageInfo.maxItems || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">重量:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentWeight || 0} / {storageInfo.maxWeight || 0} kg
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm">縦型配置図</div>
          <div className="border-2 border-gray-300 rounded p-4 h-48 relative bg-gray-50">
            {storageMaterials.map((material, index) => (
              <div
                key={material.id}
                className={`absolute w-full h-6 rounded text-xs px-2 flex items-center ${getCategoryColor(material.category)}`}
                style={{ top: `${index * 28}px` }}
                title={`${material.name} (${material.category})`}
              >
                {material.name.length > 20 ? material.name.slice(0, 20) + '...' : material.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // パレット（重量ベース型）の表示
  const renderPalletContent = () => {
    const weightUsage = storageInfo.maxWeight ? 
      ((storageInfo.currentWeight || 0) / storageInfo.maxWeight) * 100 : 0;
    const volumeUsage = storageInfo.maxVolume ? 
      ((storageInfo.currentVolume || 0) / storageInfo.maxVolume) * 100 : 0;

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>重量使用率</span>
              <span>{weightUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(weightUsage, 100)}%` }}
              />
            </div>
          </div>
          {storageInfo.maxVolume && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>容積使用率</span>
                <span>{volumeUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(volumeUsage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">配置材料</div>
          <div className="grid grid-cols-2 gap-2">
            {storageMaterials.map((material) => (
              <div
                key={material.id}
                className={`p-2 rounded text-xs ${getCategoryColor(material.category)}`}
                title={material.description}
              >
                {material.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // フロアエリア（エリアベース型）の表示
  const renderFloorAreaContent = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">収容数:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentItems || 0} / {storageInfo.maxItems || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">容積:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentVolume || 0} / {storageInfo.maxVolume || 0} m³
            </span>
          </div>
        </div>
        <div className="border-2 border-gray-300 rounded p-4 bg-gray-50 h-32">
          <div className="text-sm font-medium mb-2">フロア配置図</div>
          <div className="grid grid-cols-4 gap-1 h-20">
            {Array.from({ length: 12 }, (_, i) => {
              const material = storageMaterials[i];
              return (
                <div
                  key={i}
                  className={`border rounded text-xs flex items-center justify-center ${
                    material ? getCategoryColor(material.category) : 'border-gray-300 bg-white'
                  }`}
                  title={material ? material.name : '空きエリア'}
                >
                  {material ? material.category.slice(0, 2) : '空'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ボックス（容積ベース型）の表示
  const renderBoxContent = () => {
    const volumeUsage = storageInfo.maxVolume ? 
      ((storageInfo.currentVolume || 0) / storageInfo.maxVolume) * 100 : 0;

    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>容積使用率</span>
            <span>{volumeUsage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${Math.min(volumeUsage, 100)}%` }}
            />
          </div>
        </div>
        <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">収納品目</div>
          <div className="space-y-1">
            {storageMaterials.map((material) => (
              <div
                key={material.id}
                className="flex justify-between items-center text-xs p-1 bg-white rounded"
              >
                <span>{material.name}</span>
                <span className="text-gray-500">{material.quantity} {material.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // タンク（容積ベース型）の表示
  const renderTankContent = () => {
    const volumeUsage = storageInfo.maxVolume ? 
      ((storageInfo.currentVolume || 0) / storageInfo.maxVolume) * 100 : 0;

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-gray-300 rounded p-4 bg-gray-50 h-32">
          <div className="text-sm font-medium mb-2">タンク液面</div>
          <div className="relative w-full h-20 border border-gray-400 rounded">
            <div 
              className="absolute bottom-0 w-full bg-blue-400 rounded-b"
              style={{ height: `${Math.min(volumeUsage, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {volumeUsage.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">容積:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentVolume || 0} / {storageInfo.maxVolume || 0} L
            </span>
          </div>
          <div>
            <span className="text-gray-600">重量:</span>
            <span className="ml-2 font-medium">
              {storageInfo.currentWeight || 0} / {storageInfo.maxWeight || 0} kg
            </span>
          </div>
        </div>
      </div>
    );
  };

  // デフォルト表示
  const renderDefaultContent = () => {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          置き場タイプ: {storageTypeMaster?.name || storageInfo.storageType}
        </div>
        <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">配置材料一覧</div>
          <div className="space-y-2">
            {storageMaterials.map((material) => (
              <div
                key={material.id}
                className="flex justify-between items-center text-sm p-2 bg-white rounded"
              >
                <span>{material.name}</span>
                <span className="text-gray-500">{material.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // カテゴリ別の色分け
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      '鋼材': 'bg-blue-100 border-blue-300',
      '木材': 'bg-green-100 border-green-300',
      '樹脂': 'bg-yellow-100 border-yellow-300',
      '電子部品': 'bg-purple-100 border-purple-300',
      '金属部品': 'bg-gray-100 border-gray-300',
      '液体': 'bg-cyan-100 border-cyan-300',
      'その他': 'bg-orange-100 border-orange-300'
    };
    return colors[category] || 'bg-gray-100 border-gray-300';
  };

  // 統計情報の計算
  const calculateStats = () => {
    const totalItems = storageMaterials.length;
    const totalWeight = storageMaterials.reduce((sum, m) => sum + (parseFloat(m.size) || 0), 0);
    
    let capacityInfo = '';
    if (storageInfo.capacityType === 'grid_slot' && storageInfo.rows && storageInfo.columns) {
      const totalSlots = storageInfo.rows * storageInfo.columns * (storageInfo.levels || 1);
      const usageRate = totalSlots > 0 ? (totalItems / totalSlots) * 100 : 0;
      capacityInfo = `${totalItems}/${totalSlots} (${usageRate.toFixed(1)}%)`;
    } else if (storageInfo.maxItems) {
      const usageRate = (totalItems / storageInfo.maxItems) * 100;
      capacityInfo = `${totalItems}/${storageInfo.maxItems} (${usageRate.toFixed(1)}%)`;
    }

    return { totalItems, totalWeight, capacityInfo };
  };

  const stats = calculateStats();

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-200">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {storageTypeMaster?.icon} {storageInfo.name}
          </h3>
          <p className="text-sm text-gray-600">
            {storageInfo.code} ({storageTypeMaster?.name})
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 統計情報 */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium">{stats.totalItems}</div>
              <div className="text-xs text-gray-600">配置数</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <div>
              <div className="font-medium">{stats.capacityInfo || 'N/A'}</div>
              <div className="text-xs text-gray-600">使用率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 置き場タイプ別表示 */}
      <div className="p-4 flex-1 overflow-y-auto">
        {renderStorageContent()}
      </div>

      {/* 材料一覧 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">配置材料一覧</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {storageMaterials.length > 0 ? (
            storageMaterials.map((material) => (
              <div
                key={material.id}
                className="flex justify-between items-center p-2 bg-white rounded border text-sm"
              >
                <div>
                  <div className="font-medium">{material.name}</div>
                  <div className="text-xs text-gray-500">
                    {material.category} | {material.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{material.quantity}</div>
                  <div className="text-xs text-gray-500">{material.unit}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              配置されている材料がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageDetailPanel; 