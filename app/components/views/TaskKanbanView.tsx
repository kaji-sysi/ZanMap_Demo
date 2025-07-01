'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Task, Project, User } from '@/app/types';
import { updateTaskStatus } from '@/app/lib/taskMasterData';
import { Plus, MoreVertical, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface TaskKanbanViewProps {
  tasks: Task[];
  currentUser: User | null;
  onTaskUpdate: () => void;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: () => void;
}

interface Column {
  id: Task['status'];
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
}

// ドラッグ可能なタスクカードコンポーネント
const SortableTaskCard: React.FC<{
  task: Task;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
}> = ({ task, selectedProject, onTaskEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: Task['priority']): string => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-white';
    }
  };

  const getPriorityLabel = (priority: Task['priority']): string => {
    switch (priority) {
      case 'urgent':
        return '緊急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays < 0) return `${Math.abs(diffDays)}日前`;
    if (diffDays < 7) return `${diffDays}日後`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };
          
          return (
            <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)} p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-blue-500 ring-opacity-50 transform scale-105' : ''
      }`}
      onDoubleClick={() => onTaskEdit?.(task)}
    >
      {/* ドラッグハンドル（視覚的表示のみ） */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded">
        <GripVertical className="w-4 h-4 text-gray-400" />
              </div>

                    {/* タスクタイトル */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 pr-6">
                      {task.title}
                    </h4>

                    {/* タスク説明 */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {task.description}
                      </p>
                    )}

                    {/* プロジェクト名 */}
                    {!selectedProject && task.projectName && (
                      <div className="mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {task.projectName}
                        </span>
                      </div>
                    )}

                    {/* タグ */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 進捗バー */}
                    {task.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>進捗</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
            />
                        </div>
                      </div>
                    )}

      {/* フッター情報 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{task.assignee}</span>
          <span 
            className={`px-2 py-1 rounded-full font-medium ${
              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}
          >
            {getPriorityLabel(task.priority)}
          </span>
                      </div>
        <div className={`font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
    </div>
  );
};

// ドロップ可能なカラムコンポーネント
const DroppableColumn: React.FC<{
  column: Column;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: () => void;
}> = ({ column, selectedProject, onTaskEdit, onTaskCreate }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border-2 border-dashed ${column.borderColor} ${column.bgColor} min-h-96 transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-100 border-blue-400' : ''
      }`}
    >
      {/* カラムヘッダー */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {column.tasks.length}
                        </span>
                      </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={onTaskCreate}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="タスクを追加"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
                    </div>
                  </div>

      {/* タスクリスト */}
      <div className={`flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 rounded-b-lg transition-colors ${
        isOver ? 'bg-blue-50' : ''
      }`}>
        {column.tasks.map(task => (
          <SortableTaskCard
            key={task.id}
            task={task}
            selectedProject={selectedProject}
            onTaskEdit={onTaskEdit}
          />
                ))}

                {/* 空の状態 */}
        {column.tasks.length === 0 && (
          <div className={`text-center py-12 transition-colors ${
            isOver ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className="text-sm font-medium">
              {isOver ? 'ここにドロップ' : 'タスクがありません'}
            </div>
            {!isOver && (
                    <button 
                      onClick={onTaskCreate}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                新しいタスクを追加
                    </button>
            )}
          </div>
        )}
        
        {/* ドロップエリアの拡張 */}
        {isOver && column.tasks.length > 0 && (
          <div className="h-8 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="text-xs text-blue-600 font-medium">ここにドロップ</span>
                  </div>
                )}
              </div>
            </div>
          );
};

const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  currentUser,
  onTaskUpdate,
  selectedProject,
  onTaskEdit,
  onTaskCreate
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // センサー設定（タッチ、ポインター、キーボード対応）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // ドラッグ開始までの距離を短縮
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // タッチ遅延を短縮
        tolerance: 8, // タッチ許容範囲を拡大
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // カラム定義
  const columns: Omit<Column, 'tasks'>[] = [
    { 
      id: 'todo', 
      title: 'To Do', 
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    { 
      id: 'review', 
      title: 'Review', 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300'
    },
    { 
      id: 'done', 
      title: 'Done', 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    }
  ];

  // タスクをステータス別にグループ化
  const columnsWithTasks: Column[] = useMemo(() => {
    return columns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task.status === column.id)
    }));
  }, [tasks]);

  // ドラッグ開始時の処理
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  }, [tasks]);

  // ドラッグ終了時の処理
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as number;
    const overId = over.id;

    // カラムIDかタスクIDかを判定
    let targetStatus: Task['status'];
    
    if (typeof overId === 'string' && ['todo', 'in-progress', 'review', 'done'].includes(overId)) {
      targetStatus = overId as Task['status'];
    } else {
      // タスクの上にドロップした場合、そのタスクのステータスを取得
      const targetTask = tasks.find(t => t.id === overId);
      if (!targetTask) {
        setActiveTask(null);
        return;
      }
      targetStatus = targetTask.status;
    }

    const draggedTask = tasks.find(t => t.id === taskId);
    
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        updateTaskStatus(taskId, targetStatus);
        onTaskUpdate();
      } catch (error) {
        console.error('タスクステータスの更新に失敗しました:', error);
      }
    }

    setActiveTask(null);
  }, [tasks, onTaskUpdate]);

  // ドラッグオーバー時の処理
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // 必要に応じて視覚的フィードバックを追加
  }, []);

  return (
    <div className="h-full p-6 bg-gray-100">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-4 gap-6 h-full">
            {columnsWithTasks.map(column => (
              <DroppableColumn
                key={column.id}
                column={column}
                selectedProject={selectedProject}
                onTaskEdit={onTaskEdit}
                onTaskCreate={onTaskCreate}
              />
            ))}
          </div>
        </SortableContext>

        {/* ドラッグオーバーレイ */}
        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask ? (
            <div className="kanban-drag-overlay bg-white rounded-lg shadow-2xl border-l-4 border-blue-500 p-4 max-w-xs transform rotate-2 ring-2 ring-blue-500 ring-opacity-30">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {activeTask.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{activeTask.assignee}</span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  activeTask.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  activeTask.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  activeTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {activeTask.priority === 'urgent' ? '緊急' :
                   activeTask.priority === 'high' ? '高' :
                   activeTask.priority === 'medium' ? '中' : '低'}
                </span>
              </div>
      </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TaskKanbanView; 