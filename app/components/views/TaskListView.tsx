'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Task, Project, User } from '@/app/types';
import { updateTask } from '@/app/lib/taskMasterData';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import { 
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar, 
  User as UserIcon, 
  Clock, 
  Flag,
  CheckCircle2,
  Circle, 
  AlertCircle,
  PlayCircle
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  currentUser: User | null;
  onTaskUpdate: () => void;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskCreate?: () => void;
}

const columnHelper = createColumnHelper<Task>();

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  currentUser,
  onTaskUpdate,
  selectedProject,
  onTaskEdit,
  onTaskDelete,
  onTaskCreate
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // ステータスアイコンの取得
  const getStatusIcon = useCallback((status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-gray-500" />;
      case 'in-progress':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  // 優先度の色とラベルを取得
  const getPriorityInfo = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return { color: 'text-red-600 bg-red-50 border-red-200', label: '緊急' };
      case 'high':
        return { color: 'text-orange-600 bg-orange-50 border-orange-200', label: '高' };
      case 'medium':
        return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: '中' };
      case 'low':
        return { color: 'text-green-600 bg-green-50 border-green-200', label: '低' };
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: priority };
    }
  }, []);

  // ステータスの色とラベルを取得
  const getStatusInfo = useCallback((status: Task['status']) => {
    switch (status) {
      case 'todo':
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'To Do' };
      case 'in-progress':
        return { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'In Progress' };
      case 'review':
        return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Review' };
      case 'done':
        return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Done' };
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: status };
    }
  }, []);

  // テーブルカラムの定義
  const columns = useMemo(() => [
    // 選択チェックボックス
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300"
        />
      ),
      size: 50,
    }),

    // タスクタイトル
    columnHelper.accessor('title', {
      header: 'タスク',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {getStatusIcon(row.original.status)}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {row.original.title}
            </div>
            {row.original.description && (
              <div className="text-xs text-gray-500 truncate mt-1">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      ),
      size: 300,
    }),

    // プロジェクト
    columnHelper.accessor('projectName', {
      header: 'プロジェクト',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {getValue() || '未割り当て'}
                                  </span>
      ),
      size: 150,
    }),

    // 担当者
    columnHelper.accessor('assignee', {
      header: '担当者',
      cell: ({ getValue }) => (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{getValue()}</span>
                        </div>
      ),
      size: 120,
    }),

    // 優先度
    columnHelper.accessor('priority', {
      header: '優先度',
      cell: ({ getValue }) => {
        const { color, label } = getPriorityInfo(getValue());
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
            <Flag className="w-3 h-3 mr-1" />
            {label}
                        </span>
        );
      },
      size: 100,
    }),

    // ステータス
    columnHelper.accessor('status', {
      header: 'ステータス',
      cell: ({ getValue, row }) => {
        const { color, label } = getStatusInfo(getValue());
        return (
          <select
            value={getValue()}
            onChange={(e) => {
              updateTask(row.original.id, { status: e.target.value as Task['status'] });
              onTaskUpdate();
            }}
            className={`text-xs font-medium border rounded-full px-2 py-1 ${color} cursor-pointer`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        );
      },
      size: 120,
    }),

    // 進捗
    columnHelper.accessor('progress', {
      header: '進捗',
      cell: ({ getValue }) => (
                        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${getValue()}%` }}
                            ></div>
                          </div>
          <span className="text-xs text-gray-600 w-8">{getValue()}%</span>
        </div>
      ),
      size: 120,
    }),

    // 開始日
    columnHelper.accessor('startDate', {
      header: '開始日',
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(getValue()).toLocaleDateString('ja-JP')}</span>
        </div>
      ),
      size: 120,
    }),

    // 期限
    columnHelper.accessor('dueDate', {
      header: '期限',
      cell: ({ getValue }) => {
        const dueDate = new Date(getValue());
        const today = new Date();
        const isOverdue = dueDate < today;
        const isToday = dueDate.toDateString() === today.toDateString();
        
        return (
          <div className={`flex items-center space-x-1 text-sm ${
            isOverdue ? 'text-red-600' : isToday ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{dueDate.toLocaleDateString('ja-JP')}</span>
            {isOverdue && <span className="text-xs">(期限切れ)</span>}
            {isToday && <span className="text-xs">(今日)</span>}
                        </div>
        );
      },
      size: 120,
    }),

    // アクション
    columnHelper.display({
      id: 'actions',
      header: 'アクション',
      cell: ({ row }) => (
                        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTaskEdit?.(row.original)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="編集"
          >
                            <Edit className="w-4 h-4" />
                          </button>
          <button
            onClick={() => onTaskDelete?.(row.original)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="削除"
          >
                            <Trash2 className="w-4 h-4" />
                          </button>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="その他"
          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
        </div>
      ),
      size: 120,
    }),
  ], [getStatusIcon, getPriorityInfo, getStatusInfo, onTaskEdit, onTaskDelete, onTaskUpdate]);

  // テーブルインスタンスの作成
  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  // 一括操作
  const handleBulkAction = useCallback((action: string) => {
    const selectedRowIds = table.getSelectedRowModel().rows.map(row => row.original.id);
    console.log(`Bulk ${action} for tasks:`, selectedRowIds);
    // TODO: 実装
  }, [table]);

  // CSVエクスポート
  const handleExport = useCallback(() => {
    const data = table.getFilteredRowModel().rows.map(row => row.original);
    console.log('Exporting data:', data);
    // TODO: CSV生成とダウンロード実装
  }, [table]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* テーブル */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center space-x-1 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="w-4 h-4" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                  ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </div>

      {/* ページネーション */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {table.getFilteredRowModel().rows.length} 件中{' '}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            件を表示
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">ページ</span>
              <span className="font-medium">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span className="text-sm text-gray-600">
                / {table.getPageCount()}
              </span>
            </div>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 空の状態 */}
      {table.getFilteredRowModel().rows.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
          <div className="text-center">
            <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              {globalFilter || table.getState().columnFilters.length > 0
                ? '検索条件に一致するタスクがありません'
                : 'タスクがありません'
              }
            </p>
            <p className="text-sm">
              {globalFilter || table.getState().columnFilters.length > 0
                ? '検索条件を変更してください'
                : 'タスクを追加してプロジェクトを管理しましょう'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskListView; 