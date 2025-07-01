import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import type { ShelfMaster, ShelfType } from '../types/warehouse';
import { shelfTypes } from '../lib/warehouseMasterData';

interface ShelfMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shelf: ShelfMaster) => void;
  editingShelf?: ShelfMaster | null;
}

const ShelfMasterModal: React.FC<ShelfMasterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShelf
}) => {
  const [formData, setFormData] = useState<Partial<ShelfMaster>>({
    name: '',
    code: '',
    rows: 1,
    columns: 1,
    levels: 1,
    materialTypes: [],
    description: '',
    shelfType: shelfTypes[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingShelf) {
      setFormData(editingShelf);
    } else {
      setFormData({
        name: '',
        code: '',
        rows: 1,
        columns: 1,
        levels: 1,
        materialTypes: [],
        description: '',
        shelfType: shelfTypes[0]
      });
    }
    setErrors({});
  }, [editingShelf, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '棚名は必須です';
    }

    if (!formData.code?.trim()) {
      newErrors.code = '棚コードは必須です';
    }

    if (!formData.rows || formData.rows < 1) {
      newErrors.rows = '段数は1以上で入力してください';
    }

    if (!formData.columns || formData.columns < 1) {
      newErrors.columns = '列数は1以上で入力してください';
    }

    if (!formData.levels || formData.levels < 1) {
      newErrors.levels = '階層数は1以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const shelfData: ShelfMaster = {
      id: editingShelf?.id || `shelf_${Date.now()}`,
      name: formData.name!,
      code: formData.code!,
      areaId: editingShelf?.areaId || '',
      x: editingShelf?.x || 0,
      y: editingShelf?.y || 0,
      width: editingShelf?.width || 100,
      height: editingShelf?.height || 60,
      rows: formData.rows!,
      columns: formData.columns!,
      levels: formData.levels!,
      shelfType: formData.shelfType!,
      materialTypes: formData.materialTypes || [],
      description: formData.description || '',
      isActive: editingShelf?.isActive ?? true,
      createdAt: editingShelf?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(shelfData);
    onClose();
  };

  const handleMaterialTypeChange = (materialType: string, checked: boolean) => {
    const currentTypes = formData.materialTypes || [];
    if (checked) {
      handleInputChange('materialTypes', [...currentTypes, materialType]);
    } else {
      handleInputChange('materialTypes', currentTypes.filter(t => t !== materialType));
    }
  };

  const materialTypeOptions = [
    '鋼材', '木材', 'アルミ', '樹脂', '金属部品', '電子部品', '化学品', 'その他'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {editingShelf ? '棚マスタ編集' : '棚マスタ新規登録'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                棚名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="棚名を入力"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                棚コード <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="棚コードを入力"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>
          </div>

          {/* 棚タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              棚タイプ
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shelfTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleInputChange('shelfType', type)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.shelfType?.id === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 寸法設定 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">寸法設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  段数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.rows || ''}
                  onChange={(e) => handleInputChange('rows', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rows ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.rows && (
                  <p className="text-red-500 text-sm mt-1">{errors.rows}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  列数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.columns || ''}
                  onChange={(e) => handleInputChange('columns', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.columns ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.columns && (
                  <p className="text-red-500 text-sm mt-1">{errors.columns}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  階層数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.levels || ''}
                  onChange={(e) => handleInputChange('levels', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.levels ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.levels && (
                  <p className="text-red-500 text-sm mt-1">{errors.levels}</p>
                )}
              </div>
            </div>
          </div>



          {/* 対応材料タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対応材料タイプ
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {materialTypeOptions.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(formData.materialTypes || []).includes(type)}
                    onChange={(e) => handleMaterialTypeChange(type, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="棚の説明を入力"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelfMasterModal; 