import React, { useState, useEffect } from 'react';
import { X, Package, Save, AlertCircle } from 'lucide-react';
import type { StorageMaster, StorageType, StorageTypeMaster } from '../types/warehouse';
import { storageMasterManager } from '../lib/storageMasterData';

interface StorageMasterModalProps {
  storage: StorageMaster | null;
  onSave: (storage: StorageMaster) => void;
  onCancel: () => void;
}

const StorageMasterModal: React.FC<StorageMasterModalProps> = ({
  storage,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<StorageMaster>({
    id: '',
    code: '',
    name: '',
    storageType: 'shelf',
    areaId: '',
    width: 100,
    height: 60,
    rows: 5,
    columns: 4,
    levels: 1,
    materialTypes: [],
    isActive: true,
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableMaterialTypes] = useState([
    '鋼材', '木材', '樹脂', '電子部品', '金属部品', '液体', '油類', 
    '長材', '重量物', '大型部品', '小物部品', 'その他'
  ]);

  const storageTypeMasters = storageMasterManager.getAllStorageTypeMasters();

  useEffect(() => {
    if (storage) {
      setFormData(storage);
    } else {
      // 新規作成時のID生成
      setFormData(prev => ({
        ...prev,
        id: `storage_${Date.now()}`,
        isActive: true
      }));
    }
  }, [storage]);

  // 置き場タイプ変更時の処理
  const handleStorageTypeChange = (storageType: StorageType) => {
    const typeMaster = storageMasterManager.getStorageTypeMaster(storageType);
    if (typeMaster) {
      setFormData(prev => ({
        ...prev,
        storageType,
        rows: typeMaster.defaultRows,
        columns: typeMaster.defaultColumns,
        levels: typeMaster.defaultLevels
      }));
    }
  };

  // フォームデータの更新
  const updateFormData = (key: keyof StorageMaster, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString()
    }));
    
    // エラーをクリア
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // 材料タイプの追加/削除
  const toggleMaterialType = (materialType: string) => {
    setFormData(prev => ({
      ...prev,
      materialTypes: prev.materialTypes.includes(materialType)
        ? prev.materialTypes.filter(t => t !== materialType)
        : [...prev.materialTypes, materialType]
    }));
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = '置き場コードは必須です';
    }
    if (!formData.name.trim()) {
      newErrors.name = '置き場名は必須です';
    }
    if (formData.materialTypes.length === 0) {
      newErrors.materialTypes = '対応材料タイプを少なくとも1つ選択してください';
    }

    // 段数・列数のバリデーション
    if (!formData.rows || formData.rows <= 0) {
      newErrors.rows = '段数は1以上で入力してください';
    }
    if (!formData.columns || formData.columns <= 0) {
      newErrors.columns = '列数は1以上で入力してください';
    }
    if (!formData.levels || formData.levels <= 0) {
      newErrors.levels = '階層数は1以上で入力してください';
    }
    if (!formData.width || formData.width <= 0) {
      newErrors.width = '幅は0より大きい値で入力してください';
    }
    if (!formData.height || formData.height <= 0) {
      newErrors.height = '高さは0より大きい値で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // 現在の置き場タイプマスタを取得
  const currentTypeMaster = storageMasterManager.getStorageTypeMaster(formData.storageType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {storage ? '置き場マスタ編集' : '置き場マスタ新規登録'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
              
              {/* 置き場コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  置き場コード *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => updateFormData('code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: A-01, R-001, P-1"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.code}
                  </p>
                )}
              </div>

              {/* 置き場名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  置き場名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 標準棚A-01"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* 置き場タイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  置き場タイプ *
                </label>
                <select
                  value={formData.storageType}
                  onChange={(e) => handleStorageTypeChange(e.target.value as StorageType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {storageTypeMasters.map((typeMaster) => (
                    <option key={typeMaster.id} value={typeMaster.id}>
                      {typeMaster.icon} {typeMaster.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* 寸法設定 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">寸法設定</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    幅 (px) *
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => updateFormData('width', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.width ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.width && (
                    <p className="text-red-500 text-sm mt-1">{errors.width}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    高さ (px) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 段数・列数設定 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">段数・列数</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  段数 *
                </label>
                <input
                  type="number"
                  value={formData.rows || ''}
                  onChange={(e) => updateFormData('rows', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rows ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {errors.rows && (
                  <p className="text-red-500 text-sm mt-1">{errors.rows}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  列数 *
                </label>
                <input
                  type="number"
                  value={formData.columns || ''}
                  onChange={(e) => updateFormData('columns', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.columns ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {errors.columns && (
                  <p className="text-red-500 text-sm mt-1">{errors.columns}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  階層数 *
                </label>
                <input
                  type="number"
                  value={formData.levels || 1}
                  onChange={(e) => updateFormData('levels', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.levels ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {errors.levels && (
                  <p className="text-red-500 text-sm mt-1">{errors.levels}</p>
                )}
              </div>
            </div>

          </div>

          {/* 対応材料タイプ */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">対応材料タイプ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableMaterialTypes.map((materialType) => (
                <label key={materialType} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.materialTypes.includes(materialType)}
                    onChange={() => toggleMaterialType(materialType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{materialType}</span>
                </label>
              ))}
            </div>
            {errors.materialTypes && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.materialTypes}
              </p>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="置き場の詳細説明..."
            />
          </div>


          {/* アクティブ状態 */}
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => updateFormData('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">アクティブ</span>
            </label>
            <p className="text-xs text-gray-500">
              非アクティブにすると、レイアウト選択時に表示されなくなります
            </p>
          </div>

        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {storage ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageMasterModal; 