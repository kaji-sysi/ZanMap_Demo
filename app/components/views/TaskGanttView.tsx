'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import { Task, Project, User } from '@/app/types';
import { updateTask } from '@/app/lib/taskMasterData';

interface TaskGanttViewProps {
  tasks: Task[];
  currentUser: User | null;
  onTaskUpdate: () => void;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: () => void;
}

const TaskGanttView: React.FC<TaskGanttViewProps> = ({
  tasks,
  currentUser,
  onTaskUpdate,
  selectedProject,
  onTaskEdit,
  onTaskCreate
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [showDependencies, setShowDependencies] = useState(true);

  // 優先度の色を取得
  const getPriorityColor = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  }, []);

  // ステータスの色を取得
  const getStatusColor = useCallback((status: Task['status']) => {
    switch (status) {
      case 'todo':
        return '#9CA3AF';
      case 'in-progress':
        return '#3B82F6';
      case 'review':
        return '#F59E0B';
      case 'done':
        return '#10B981';
      default:
        return '#6B7280';
    }
  }, []);

  // TaskをGanttTaskに変換
  const ganttTasks = useMemo((): GanttTask[] => {
    return tasks.map((task) => ({
      start: new Date(task.startDate),
      end: new Date(task.dueDate),
      name: task.title,
      id: task.id.toString(),
      type: 'task',
      progress: task.progress,
      isDisabled: false,
      styles: {
        backgroundColor: getStatusColor(task.status),
        backgroundSelectedColor: getPriorityColor(task.priority),
        progressColor: getPriorityColor(task.priority),
        progressSelectedColor: getPriorityColor(task.priority),
      },
      dependencies: task.dependencies.map(dep => dep.toString()),
      project: task.projectName,
    }));
  }, [tasks, getStatusColor, getPriorityColor]);

  // タスクの日付変更ハンドラー
  const handleTaskChange = useCallback((task: GanttTask) => {
    const taskId = parseInt(task.id);
    const originalTask = tasks.find(t => t.id === taskId);
    
    if (originalTask) {
      updateTask(taskId, {
        startDate: task.start.toISOString().split('T')[0],
        dueDate: task.end.toISOString().split('T')[0],
        progress: task.progress,
      });
      onTaskUpdate();
    }
  }, [tasks, onTaskUpdate]);

  // タスクの進捗変更ハンドラー
  const handleProgressChange = useCallback((task: GanttTask) => {
    const taskId = parseInt(task.id);
    updateTask(taskId, {
      progress: task.progress,
    });
    onTaskUpdate();
  }, [onTaskUpdate]);

  // タスクの削除ハンドラー
  const handleTaskDelete = useCallback((task: GanttTask) => {
    // 削除機能は必要に応じて実装
    console.log('Task delete:', task.id);
  }, []);

  // タスクの選択ハンドラー
  const handleTaskSelect = useCallback((task: GanttTask, isSelected: boolean) => {
    // タスク選択時は編集画面を開かない（ダブルクリックでのみ開く）
    // 選択状態の管理のみ行う
  }, []);

  // ダブルクリック時の処理（編集画面を開く）
  const handleTaskDoubleClick = useCallback((task: GanttTask) => {
    if (onTaskEdit) {
      const originalTask = tasks.find(t => t.id === parseInt(task.id));
      if (originalTask) {
        onTaskEdit(originalTask as any);
      }
    }
  }, [tasks, onTaskEdit]);

  // タスクドラッグ開始時の処理
  const handleTaskDragStart = useCallback((task: GanttTask) => {
    // ドラッグ開始時は選択イベントを無効化するフラグを設定
    return true;
  }, []);

  // タスクドラッグ終了時の処理
  const handleTaskDragEnd = useCallback((task: GanttTask) => {
    // ドラッグ終了後にフラグをリセット
    return true;
  }, []);

  // 今日の日付に移動
  const scrollToToday = useCallback(() => {
    const today = new Date();
    // Ganttコンポーネントが今日の日付にスクロールする機能は限定的
    // 代わりにビューモードを調整して今日が見えるようにする
    console.log('Scroll to today:', today);
  }, []);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">ガントチャート</h2>
          {selectedProject && (
            <span className="text-sm text-gray-600">
              プロジェクト: {selectedProject.name}
            </span>
          )}
          <span className="text-xs text-gray-500 hidden md:inline">
            ドラッグで期間変更 | ダブルクリックで編集
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">表示モード:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="表示モード選択"
          >
            <option value={ViewMode.Day}>日</option>
            <option value={ViewMode.Week}>週</option>
            <option value={ViewMode.Month}>月</option>
          </select>
          
          <label className="flex items-center text-sm text-gray-600 ml-4">
            <input
              type="checkbox"
              checked={showDependencies}
              onChange={(e) => setShowDependencies(e.target.checked)}
              className="mr-2"
            />
            依存関係を表示
          </label>
        </div>
      </div>

      {/* ガントチャートコンテナ */}
      <div 
        className="relative" 
        style={{ 
          height: 'calc(100vh - 200px)', 
          minHeight: '500px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {ganttTasks.length > 0 ? (
          <div 
            className="w-full h-full gantt-container" 
            data-view-mode={viewMode.toLowerCase()}
            style={{ 
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <Gantt
              tasks={ganttTasks}
              viewMode={viewMode}
              onDateChange={handleTaskChange}
              onProgressChange={handleProgressChange}
              onDelete={handleTaskDelete}
              onSelect={handleTaskSelect}
              onDoubleClick={handleTaskDoubleClick}
              locale="ja"
              rtl={false}
              listCellWidth={
                viewMode === ViewMode.Day ? "150px" : 
                viewMode === ViewMode.Week ? "180px" : "200px"
              }
              columnWidth={
                viewMode === ViewMode.Day ? 35 : 
                viewMode === ViewMode.Week ? 60 : 85
              }
              rowHeight={45}
              barCornerRadius={3}
              handleWidth={6}
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="13px"
              barFill={60}
              barProgressColor="#3B82F6"
              barProgressSelectedColor="#1D4ED8"
              barBackgroundColor="#E5E7EB"
              barBackgroundSelectedColor="#D1D5DB"
              projectProgressColor="#10B981"
              projectProgressSelectedColor="#059669"
              projectBackgroundColor="#F3F4F6"
              projectBackgroundSelectedColor="#E5E7EB"
              milestoneBackgroundColor="#F59E0B"
              milestoneBackgroundSelectedColor="#D97706"
              todayColor="#EF4444"
              preStepsCount={viewMode === ViewMode.Day ? 0 : viewMode === ViewMode.Week ? 1 : 2}
              TooltipContent={({ task, fontSize, fontFamily }) => (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs z-50">
                  <div className="font-semibold text-gray-900 mb-1">{task.name}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>開始: {task.start.toLocaleDateString('ja-JP')}</div>
                    <div>終了: {task.end.toLocaleDateString('ja-JP')}</div>
                    <div>進捗: {task.progress}%</div>
                    {task.project && <div>プロジェクト: {task.project}</div>}
                  </div>
                </div>
              )}
              TaskListHeader={({ headerHeight }) => (
                <div 
                  className="bg-gray-50 border-b border-gray-200 flex items-center px-2"
                  style={{ height: headerHeight }}
                >
                  <span className="font-medium text-gray-900 text-sm">タスク</span>
                </div>
              )}
              TaskListTable={({ rowHeight, rowWidth, fontFamily, fontSize, locale, tasks, selectedTaskId, setSelectedTask, onExpanderClick }) => (
                <div className="bg-white border-r border-gray-200">
                  {tasks.map((task, index) => {
                    const originalTask = tasks.find(t => t.id === task.id);
                    const isSelected = selectedTaskId === task.id;
                    
                    return (
                      <div
                        key={task.id}
                        className={`border-b border-gray-200 px-2 py-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        style={{ 
                          height: rowHeight,
                          width: rowWidth,
                          fontFamily,
                          fontSize: '12px'
                        }}
                        onClick={() => setSelectedTask(task.id)}
                        onDoubleClick={() => {
                          const originalTask = tasks.find(t => t.id === task.id);
                          if (originalTask && onTaskEdit) {
                            onTaskEdit(originalTask as any);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between h-full">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate text-xs leading-tight">
                              {task.name}
                            </div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: task.styles?.backgroundColor }}
                              />
                              <span className="text-xs text-gray-500">
                                {task.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">タスクがありません</div>
              <div className="text-sm">タスクを追加してガントチャートを表示してください</div>
              {onTaskCreate && (
                <button
                  onClick={onTaskCreate}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  タスクを追加
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskGanttView; 