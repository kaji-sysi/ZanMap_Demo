'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Task, Project, User } from '@/app/types';
import { updateTask } from '@/app/lib/taskMasterData';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventApi, EventInput, DateSelectArg, EventClickArg, EventChangeArg } from '@fullcalendar/core';
import { 
  Calendar as CalendarIcon
} from 'lucide-react';

interface TaskCalendarViewProps {
  tasks: Task[];
  currentUser: User | null;
  onTaskUpdate: () => void;
  selectedProject: Project | null;
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: () => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  currentUser,
  onTaskUpdate,
  selectedProject,
  onTaskEdit,
  onTaskCreate
}) => {
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [showWeekends, setShowWeekends] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Task['status'][]>(['todo', 'in-progress', 'review', 'done']);

  // 優先度に基づく色を取得
  const getPriorityColor = useCallback((priority: Task['priority']): string => {
    switch (priority) {
      case 'urgent':
        return '#DC2626'; // red-600
      case 'high':
        return '#EA580C'; // orange-600
      case 'medium':
        return '#D97706'; // amber-600
      case 'low':
        return '#16A34A'; // green-600
      default:
        return '#6B7280'; // gray-500
    }
  }, []);

  // ステータスに基づく背景色を取得
  const getStatusColor = useCallback((status: Task['status']): string => {
    switch (status) {
      case 'todo':
        return '#F3F4F6'; // gray-100
      case 'in-progress':
        return '#DBEAFE'; // blue-100
      case 'review':
        return '#FEF3C7'; // yellow-100
      case 'done':
        return '#D1FAE5'; // green-100
      default:
        return '#F3F4F6'; // gray-100
    }
  }, []);

  // タスクをFullCalendarイベントに変換
  const calendarEvents: EventInput[] = useMemo(() => {
    return tasks
      .filter(task => filterStatus.includes(task.status))
      .map(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.dueDate);
        
        // 終了日を次の日に設定（FullCalendarの仕様）
        const displayEndDate = new Date(endDate);
        displayEndDate.setDate(displayEndDate.getDate() + 1);

        return {
          id: task.id.toString(),
          title: task.title,
          start: startDate,
          end: displayEndDate,
          allDay: true,
          backgroundColor: getStatusColor(task.status),
          borderColor: getPriorityColor(task.priority),
          textColor: '#374151', // gray-700
          extendedProps: {
            task: task,
            assignee: task.assignee,
            priority: task.priority,
            status: task.status,
            progress: task.progress,
            description: task.description
          }
        };
      });
  }, [tasks, filterStatus, getStatusColor, getPriorityColor]);

  // イベントクリック時の処理
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const task = clickInfo.event.extendedProps.task as Task;
    if (onTaskEdit) {
      onTaskEdit(task);
    }
  }, [onTaskEdit]);

  // 日付選択時の処理（新しいタスク作成）
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (onTaskCreate) {
      onTaskCreate();
    }
    selectInfo.view.calendar.unselect();
  }, [onTaskCreate]);

  // イベントドラッグ時の処理
  const handleEventChange = useCallback(async (changeInfo: EventChangeArg) => {
    const task = changeInfo.event.extendedProps.task as Task;
    const newStart = changeInfo.event.start;
    const newEnd = changeInfo.event.end;

    if (newStart && newEnd) {
      try {
        // 終了日を1日戻す（FullCalendarの仕様対応）
        const adjustedEndDate = new Date(newEnd);
        adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);

        const updates = {
          startDate: newStart.toISOString().split('T')[0],
          dueDate: adjustedEndDate.toISOString().split('T')[0]
        };

        updateTask(task.id, updates);
        onTaskUpdate();
      } catch (error) {
        console.error('タスクの更新に失敗しました:', error);
        changeInfo.revert();
      }
    }
  }, [onTaskUpdate]);

  // ビュー変更
  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view);
  };

  // ステータスフィルター切り替え
  const handleStatusFilter = (status: Task['status']) => {
    setFilterStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // ステータス表示名
  const getStatusLabel = (status: Task['status']): string => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  // カスタムイベントレンダー
  const renderEventContent = useCallback((eventInfo: any) => {
    const task = eventInfo.event.extendedProps.task as Task;
    
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{eventInfo.event.title}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-600 truncate">{task.assignee}</span>
          <span className="text-gray-500">{task.progress}%</span>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* カレンダー本体 */}
      <div className="flex-1 p-6">
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            initialView={currentView}
            events={calendarEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={showWeekends}
            locale="ja"
            height="100%"
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventChange={handleEventChange}
            eventContent={renderEventContent}
            dayHeaderFormat={{ weekday: 'short' }}
            titleFormat={{ 
              year: 'numeric', 
              month: 'long' 
            }}
            buttonText={{
              today: '今日',
              month: '月',
              week: '週',
              day: '日'
            }}
            eventDisplay="block"
            displayEventTime={false}
            eventMaxStack={3}
            moreLinkClick="popover"
            moreLinkText="他 {num} 件"
            noEventsText="タスクがありません"
            eventClassNames="cursor-pointer hover:shadow-md transition-shadow"
            dayCellClassNames="hover:bg-gray-50"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
          />
        </div>
      </div>

      {/* 凡例 */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-gray-700">優先度:</div>
          <div className="flex items-center space-x-4">
              {[
                { priority: 'urgent', label: '緊急', color: '#DC2626' },
                { priority: 'high', label: '高', color: '#EA580C' },
                { priority: 'medium', label: '中', color: '#D97706' },
                { priority: 'low', label: '低', color: '#16A34A' }
              ].map(({ priority, label, color }) => (
                <div key={priority} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-3 rounded border-2"
                    style={{ borderColor: color }}
                  ></div>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-gray-700">ステータス:</div>
            <div className="flex items-center space-x-4">
              {[
                { status: 'todo', label: 'To Do', color: '#F3F4F6' },
                { status: 'in-progress', label: 'In Progress', color: '#DBEAFE' },
                { status: 'review', label: 'Review', color: '#FEF3C7' },
                { status: 'done', label: 'Done', color: '#D1FAE5' }
              ].map(({ status, label, color }) => (
                <div key={status} className="flex items-center space-x-1">
                          <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                          ></div>
                  <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
              </div>
          </div>
          </div>
        </div>
    </div>
  );
};

export default TaskCalendarView; 