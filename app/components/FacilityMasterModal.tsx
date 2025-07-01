import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import type { FacilityMaster, FacilityType } from '../types/warehouse';
import { facilityTypes, type FacilityTypeMaster } from '../lib/facilityMasterData';

interface FacilityMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facility: Omit<FacilityMaster, 'id'> | FacilityMaster) => void;
  facility?: FacilityMaster | null; // 編集時に渡される
  title?: string;
}

const FacilityMasterModal: React.FC<FacilityMasterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  facility,
  title
}) => {
  const [formData, setFormData] = useState<Omit<FacilityMaster, 'id'>>({
    type: 'office',
    name: '',
    isActive: true
  });

  const [selectedType, setSelectedType] = useState<FacilityTypeMaster | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // フォームの初期化
  useEffect(() => {
    if (facility) {
      // 編集モード
      setFormData({
        type: facility.type,
        name: facility.name,
        isActive: facility.isActive
      });
      const type = facilityTypes.find(t => t.id === facility.type);
      setSelectedType(type || null);
    } else {
      // 新規作成モード
      const defaultType = facilityTypes[0];
      setFormData({
        type: defaultType.id as FacilityType,
        name: '',
        isActive: true
      });
      setSelectedType(defaultType);
    }
    setErrors({});
  }, [facility, isOpen]);

  // 設備タイプ変更時の処理
  const handleTypeChange = (typeId: string) => {
    const type = facilityTypes.find(t => t.id === typeId);
    if (type) {
      setSelectedType(type);
      setFormData(prev => ({
        ...prev,
        type: type.id as FacilityType,
        name: prev.name || `${type.name}_${Date.now().toString().slice(-4)}`
      }));
    }
  };

  // フォーム値変更
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '設備名は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const facilityData = facility ? 
      { ...formData, id: facility.id } as FacilityMaster :
      formData;

    onSave(facilityData);
    onClose();
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  // カテゴリ別にグループ化
  const groupedTypes = facilityTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, FacilityTypeMaster[]>);

  const categoryNames = {
    entrance: '入退場',
    work: '作業場',
    storage: '保管',
    office: '事務',
    safety: '安全'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {title || (facility ? '設備マスタ編集' : '設備マスタ新規登録')}
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
          {/* 設備タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              設備タイプ
            </label>
            <div className="space-y-4">
              {Object.entries(groupedTypes).map(([category, types]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {types.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeChange(type.id)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedType?.id === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                            <div className="text-xs text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 基本情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              設備名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="設備名を入力"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* アクティブ状態 */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">アクティブ</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              非アクティブにすると、レイアウト選択時に表示されなくなります
            </p>
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

export default FacilityMasterModal; 