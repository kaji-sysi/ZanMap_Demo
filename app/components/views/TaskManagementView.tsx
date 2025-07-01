'use client';

import React, { useState, useEffect } from 'react';
import { Task, Project, TaskView, TaskFilter, User } from '@/app/types';
import { projects, tasks, createTask, updateTask } from '@/app/lib/taskMasterData';
import TaskKanbanView from './TaskKanbanView';
import TaskListView from './TaskListView';
import TaskGanttView from './TaskGanttView';
import TaskCalendarView from './TaskCalendarView';
import ProjectSelector from '../ProjectSelector';
import TaskModal from '../TaskModal';

interface TaskManagementViewProps {
  currentUser: User | null;
  viewType: 'kanban' | 'list' | 'gantt' | 'calendar';
}

const TaskManagementView: React.FC<TaskManagementViewProps> = ({ 
  currentUser, 
  viewType: initialViewType 
}) => {
  const [currentView, setCurrentView] = useState<TaskView>({
    type: initialViewType,
    filters: {},
    groupBy: 'status',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    applyFilters();
  }, [currentView.filters, selectedProject]);

  const applyFilters = () => {
    let filtered = [...tasks];

    // プロジェクトフィルタ
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject.id);
    }

    // その他のフィルタ
    const { assigneeId, status, priority, tags, dateRange, search } = currentView.filters;

    if (assigneeId) {
      filtered = filtered.filter(task => task.assigneeId === assigneeId);
    }

    if (status && status.length > 0) {
      filtered = filtered.filter(task => status.includes(task.status));
    }

    if (priority && priority.length > 0) {
      filtered = filtered.filter(task => priority.includes(task.priority));
    }

    if (tags && tags.length > 0) {
      filtered = filtered.filter(task => 
        tags.some(tag => task.tags.includes(tag))
      );
    }

    if (dateRange) {
      filtered = filtered.filter(task => 
        task.dueDate >= dateRange.start && task.dueDate <= dateRange.end
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assignee.toLowerCase().includes(searchLower)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (currentView.sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return currentView.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTasks(filtered);
  };

  const handleViewChange = (viewType: TaskView['type']) => {
    setCurrentView(prev => ({ ...prev, type: viewType }));
  };



  const handleProjectChange = (project: Project | null) => {
    setSelectedProject(project);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      // 編集の場合
      updateTask(editingTask.id, taskData);
    } else {
      // 新規作成の場合
      createTask(taskData);
    }
    applyFilters();
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const renderViewContent = () => {
    const commonProps = {
      tasks: filteredTasks,
      currentUser,
      onTaskUpdate: applyFilters,
      selectedProject,
      onTaskEdit: handleEditTask,
      onTaskCreate: handleCreateTask
    };

    switch (currentView.type) {
      case 'kanban':
        return <TaskKanbanView {...commonProps} />;
      case 'list':
        return <TaskListView {...commonProps} />;
      case 'gantt':
        return <TaskGanttView {...commonProps} />;
      case 'calendar':
        return <TaskCalendarView {...commonProps} />;
      default:
        return <TaskKanbanView {...commonProps} />;
    }
  };



  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
            
            {/* プロジェクト選択 */}
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              onProjectChange={handleProjectChange}
            />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {renderViewContent()}
      </div>

      {/* タスク作成・編集モーダル */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        projects={projects}
        currentUser={currentUser}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  );
};

export default TaskManagementView; 