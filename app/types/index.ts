import { Material } from './materials';

export type { Material };

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'worker';
}

export interface HistoryEntry {
  id: number;
  type: string;
  material_id: number;
  material_name: string;
  quantity: number;
  location: string;
  operator: string;
  timestamp: string;
}

export interface NotificationType {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export interface StockInData {
  existingId?: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  unit: string;
  size: string;
  description: string;
  operator?: string;
}

// タスク管理機能の型定義
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  progress: number;
  manager: string;
  members: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  projectName?: string;
  assignee: string;
  assigneeId: number;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: number[];
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  fileName: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskFilter {
  projectId?: number;
  assigneeId?: number;
  status?: string[];
  priority?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface TaskView {
  type: 'kanban' | 'list' | 'gantt' | 'calendar';
  filters: TaskFilter;
  groupBy?: 'project' | 'assignee' | 'priority' | 'status';
  sortBy?: 'dueDate' | 'priority' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
} 