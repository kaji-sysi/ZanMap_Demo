'use client';

import React, { useState } from 'react';
import { TaskFilter as TaskFilterType, Project } from '@/app/types';
import { Search, X, Calendar } from 'lucide-react';

interface TaskFilterProps {
  filters: TaskFilterType;
  onFiltersChange: (filters: TaskFilterType) => void;
  projects: Project[];
}

const TaskFilterComponent: React.FC<TaskFilterProps> = ({
  filters,
  onFiltersChange,
  projects
}) => {
  const [localFilters, setLocalFilters] = useState<TaskFilterType>(filters);

  const handleFilterChange = (key: keyof TaskFilterType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatus = localFilters.status || [];
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status);
    
    handleFilterChange('status', newStatus.length > 0 ? newStatus : undefined);
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriority = localFilters.priority || [];
    const newPriority = checked
      ? [...currentPriority, priority]
      : currentPriority.filter(p => p !== priority);
    
    handleFilterChange('priority', newPriority.length > 0 ? newPriority : undefined);
  };

  const clearFilters = () => {
    const emptyFilters: TaskFilterType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof TaskFilterType];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-100' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
    { value: 'review', label: 'Review', color: 'bg-yellow-100' },
    { value: 'done', label: 'Done', color: 'bg-green-100' }
  ];

  const priorityOptions = [
    { value: 'urgent', label: '緊急', color: 'bg-red-100 text-red-800' },
    { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
    { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: '低', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">フィルター</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-3 h-3" />
            <span>クリア</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* 検索 */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            検索
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              placeholder="タスク名、説明、担当者..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* ステータス */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <div className="space-y-1">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(localFilters.status || []).includes(option.value)}
                  onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 優先度 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            優先度
          </label>
          <div className="space-y-1">
            {priorityOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(localFilters.priority || []).includes(option.value)}
                  onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 担当者 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            担当者
          </label>
          <select
            value={localFilters.assigneeId || ''}
            onChange={(e) => handleFilterChange('assigneeId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            <option value="1">田中太郎</option>
            <option value="2">佐藤花子</option>
            <option value="3">山田次郎</option>
            <option value="4">鈴木一郎</option>
          </select>
        </div>

        {/* 期間 */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            期限
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="date"
                value={localFilters.dateRange?.start || ''}
                onChange={(e) => {
                  const dateRange = localFilters.dateRange || { start: '', end: '' };
                  handleFilterChange('dateRange', 
                    e.target.value || dateRange.end ? 
                    { ...dateRange, start: e.target.value } : undefined
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <span className="self-center text-gray-500 text-sm">〜</span>
            <div className="flex-1">
              <input
                type="date"
                value={localFilters.dateRange?.end || ''}
                onChange={(e) => {
                  const dateRange = localFilters.dateRange || { start: '', end: '' };
                  handleFilterChange('dateRange', 
                    dateRange.start || e.target.value ? 
                    { ...dateRange, end: e.target.value } : undefined
                  );
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* アクティブなフィルター表示 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {localFilters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                検索: "{localFilters.search}"
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(localFilters.status || []).map(status => (
              <span key={status} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                ステータス: {statusOptions.find(opt => opt.value === status)?.label}
                <button
                  onClick={() => handleStatusChange(status, false)}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {(localFilters.priority || []).map(priority => (
              <span key={priority} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                優先度: {priorityOptions.find(opt => opt.value === priority)?.label}
                <button
                  onClick={() => handlePriorityChange(priority, false)}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilterComponent; 