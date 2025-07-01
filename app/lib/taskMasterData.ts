import { Project, Task, User } from '@/app/types';

// プロジェクトマスタデータ
export const projects: Project[] = [
  {
    id: 1,
    name: '残材管理システム改修',
    description: '残材管理システムの機能拡張とUI改善',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    progress: 65,
    manager: '田中太郎',
    members: ['田中太郎', '佐藤花子', '山田次郎'],
    color: '#3B82F6',
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2025-06-20T10:30:00Z'
  },
  {
    id: 2,
    name: '倉庫レイアウト最適化',
    description: '倉庫の配置効率化とピッキング作業の改善',
    startDate: '2025-06-15',
    endDate: '2025-09-30',
    status: 'active',
    progress: 30,
    manager: '佐藤花子',
    members: ['佐藤花子', '鈴木一郎', '高橋美咲'],
    color: '#10B981',
    createdAt: '2025-05-25T00:00:00Z',
    updatedAt: '2025-06-10T14:15:00Z'
  },
  {
    id: 3,
    name: '在庫監査プロセス改善',
    description: '定期的な在庫監査の効率化とデジタル化',
    startDate: '2025-07-01',
    endDate: '2025-10-31',
    status: 'planning',
    progress: 5,
    manager: '山田次郎',
    members: ['山田次郎', '田中太郎'],
    color: '#F59E0B',
    createdAt: '2025-06-15T00:00:00Z',
    updatedAt: '2025-06-28T09:45:00Z'
  }
];

// タスクマスタデータ
export const tasks: Task[] = [
  {
    id: 1,
    title: 'タスク管理機能の設計',
    description: 'タスク管理機能の詳細設計とデータベース設計を行う',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '田中太郎',
    assigneeId: 1,
    status: 'done',
    priority: 'high',
    startDate: '2025-06-01',
    dueDate: '2025-06-10',
    completedDate: '2025-06-09',
    estimatedHours: 16,
    actualHours: 14,
    progress: 100,
    dependencies: [],
    tags: ['設計', 'データベース'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-06-09T17:30:00Z'
  },
  {
    id: 2,
    title: 'カンバンボード画面の実装',
    description: 'React+TypeScriptでカンバンボード画面を実装する',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '佐藤花子',
    assigneeId: 2,
    status: 'in-progress',
    priority: 'high',
    startDate: '2025-06-11',
    dueDate: '2025-06-25',
    estimatedHours: 24,
    actualHours: 16,
    progress: 70,
    dependencies: [1],
    tags: ['フロントエンド', 'React'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-05T10:00:00Z',
    updatedAt: '2025-06-20T16:20:00Z'
  },
  {
    id: 3,
    title: 'ガントチャート機能の実装',
    description: 'プロジェクトスケジュール管理用のガントチャート機能を実装',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '山田次郎',
    assigneeId: 3,
    status: 'todo',
    priority: 'medium',
    startDate: '2025-06-26',
    dueDate: '2025-07-15',
    estimatedHours: 32,
    actualHours: 0,
    progress: 0,
    dependencies: [2],
    tags: ['フロントエンド', 'チャート'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-05T10:15:00Z',
    updatedAt: '2025-06-05T10:15:00Z'
  },
  {
    id: 4,
    title: 'API設計とエンドポイント実装',
    description: 'タスク管理機能のREST API設計と実装',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '田中太郎',
    assigneeId: 1,
    status: 'review',
    priority: 'high',
    startDate: '2025-06-05',
    dueDate: '2025-06-20',
    estimatedHours: 20,
    actualHours: 18,
    progress: 95,
    dependencies: [1],
    tags: ['バックエンド', 'API'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-03T14:00:00Z',
    updatedAt: '2025-06-18T11:45:00Z'
  },
  {
    id: 5,
    title: '倉庫内動線分析',
    description: '現在の倉庫内作業動線を分析し、最適化案を作成',
    projectId: 2,
    projectName: '倉庫レイアウト最適化',
    assignee: '佐藤花子',
    assigneeId: 2,
    status: 'in-progress',
    priority: 'high',
    startDate: '2025-06-15',
    dueDate: '2025-07-05',
    estimatedHours: 40,
    actualHours: 25,
    progress: 60,
    dependencies: [],
    tags: ['分析', '最適化'],
    attachments: [],
    comments: [],
    createdBy: '佐藤花子',
    createdAt: '2025-06-10T08:30:00Z',
    updatedAt: '2025-06-22T15:20:00Z'
  },
  {
    id: 6,
    title: 'ピッキング効率測定',
    description: '現在のピッキング作業の効率測定とボトルネック特定',
    projectId: 2,
    projectName: '倉庫レイアウト最適化',
    assignee: '鈴木一郎',
    assigneeId: 4,
    status: 'todo',
    priority: 'medium',
    startDate: '2025-07-06',
    dueDate: '2025-07-30',
    estimatedHours: 30,
    actualHours: 0,
    progress: 0,
    dependencies: [5],
    tags: ['測定', 'ピッキング'],
    attachments: [],
    comments: [],
    createdBy: '佐藤花子',
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2025-06-15T09:00:00Z'
  },
  {
    id: 7,
    title: '監査チェックリスト作成',
    description: 'デジタル化対応の在庫監査チェックリストを作成',
    projectId: 3,
    projectName: '在庫監査プロセス改善',
    assignee: '山田次郎',
    assigneeId: 3,
    status: 'todo',
    priority: 'low',
    startDate: '2025-07-01',
    dueDate: '2025-07-20',
    estimatedHours: 16,
    actualHours: 0,
    progress: 0,
    dependencies: [],
    tags: ['監査', 'チェックリスト'],
    attachments: [],
    comments: [],
    createdBy: '山田次郎',
    createdAt: '2025-06-20T10:00:00Z',
    updatedAt: '2025-06-20T10:00:00Z'
  },
  {
    id: 8,
    title: 'ユーザーインターフェース改善',
    description: 'ユーザビリティテストの結果を基にUI/UXを改善',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '佐藤花子',
    assigneeId: 2,
    status: 'todo',
    priority: 'medium',
    startDate: '2025-07-16',
    dueDate: '2025-08-05',
    estimatedHours: 28,
    actualHours: 0,
    progress: 0,
    dependencies: [3],
    tags: ['UI/UX', 'フロントエンド'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-10T11:00:00Z',
    updatedAt: '2025-06-10T11:00:00Z'
  },
  {
    id: 9,
    title: 'システムテスト実施',
    description: '統合テストとユーザー受け入れテストの実施',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '山田次郎',
    assigneeId: 3,
    status: 'todo',
    priority: 'urgent',
    startDate: '2025-08-06',
    dueDate: '2025-08-20',
    estimatedHours: 35,
    actualHours: 0,
    progress: 0,
    dependencies: [8],
    tags: ['テスト', '品質保証'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-06-15T13:30:00Z',
    updatedAt: '2025-06-15T13:30:00Z'
  },
  {
    id: 10,
    title: 'レイアウト変更実装',
    description: '分析結果に基づく倉庫レイアウトの物理的変更',
    projectId: 2,
    projectName: '倉庫レイアウト最適化',
    assignee: '高橋美咲',
    assigneeId: 5,
    status: 'todo',
    priority: 'high',
    startDate: '2025-07-31',
    dueDate: '2025-08-28',
    estimatedHours: 50,
    actualHours: 0,
    progress: 0,
    dependencies: [6],
    tags: ['実装', 'レイアウト'],
    attachments: [],
    comments: [],
    createdBy: '佐藤花子',
    createdAt: '2025-06-20T14:00:00Z',
    updatedAt: '2025-06-20T14:00:00Z'
  },
  {
    id: 11,
    title: 'モバイルアプリ開発',
    description: 'スマートフォン対応のモバイルアプリケーション開発',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '田中太郎',
    assigneeId: 1,
    status: 'todo',
    priority: 'medium',
    startDate: '2025-08-21',
    dueDate: '2025-09-15',
    estimatedHours: 45,
    actualHours: 0,
    progress: 0,
    dependencies: [9],
    tags: ['モバイル', 'アプリ開発'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-01T10:00:00Z'
  },
  {
    id: 12,
    title: 'データ移行作業',
    description: '既存システムから新システムへのデータ移行',
    projectId: 3,
    projectName: '在庫監査プロセス改善',
    assignee: '山田次郎',
    assigneeId: 3,
    status: 'todo',
    priority: 'high',
    startDate: '2025-07-21',
    dueDate: '2025-08-10',
    estimatedHours: 25,
    actualHours: 0,
    progress: 0,
    dependencies: [7],
    tags: ['データ移行', 'システム'],
    attachments: [],
    comments: [],
    createdBy: '山田次郎',
    createdAt: '2025-07-05T14:00:00Z',
    updatedAt: '2025-07-05T14:00:00Z'
  },
  {
    id: 13,
    title: '運用マニュアル作成',
    description: 'システム運用・保守のためのマニュアル作成',
    projectId: 1,
    projectName: '残材管理システム改修',
    assignee: '佐藤花子',
    assigneeId: 2,
    status: 'todo',
    priority: 'low',
    startDate: '2025-09-01',
    dueDate: '2025-09-20',
    estimatedHours: 20,
    actualHours: 0,
    progress: 0,
    dependencies: [11],
    tags: ['ドキュメント', '運用'],
    attachments: [],
    comments: [],
    createdBy: '田中太郎',
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2025-08-01T09:00:00Z'
  },
  {
    id: 14,
    title: 'セキュリティ監査',
    description: 'システムのセキュリティ脆弱性チェックと対策',
    projectId: 2,
    projectName: '倉庫レイアウト最適化',
    assignee: '鈴木一郎',
    assigneeId: 4,
    status: 'todo',
    priority: 'urgent',
    startDate: '2025-08-29',
    dueDate: '2025-09-12',
    estimatedHours: 30,
    actualHours: 0,
    progress: 0,
    dependencies: [10],
    tags: ['セキュリティ', '監査'],
    attachments: [],
    comments: [],
    createdBy: '佐藤花子',
    createdAt: '2025-08-15T11:00:00Z',
    updatedAt: '2025-08-15T11:00:00Z'
  },
  {
    id: 15,
    title: 'パフォーマンス最適化',
    description: 'システムの処理速度とレスポンス時間の最適化',
    projectId: 3,
    projectName: '在庫監査プロセス改善',
    assignee: '高橋美咲',
    assigneeId: 5,
    status: 'todo',
    priority: 'medium',
    startDate: '2025-08-11',
    dueDate: '2025-09-05',
    estimatedHours: 35,
    actualHours: 0,
    progress: 0,
    dependencies: [12],
    tags: ['パフォーマンス', '最適化'],
    attachments: [],
    comments: [],
    createdBy: '山田次郎',
    createdAt: '2025-07-20T13:00:00Z',
    updatedAt: '2025-07-20T13:00:00Z'
  }
];

// データ操作関数
export const getProjectById = (id: number): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getTasksByProjectId = (projectId: number): Task[] => {
  return tasks.filter(task => task.projectId === projectId);
};

export const getTasksByAssigneeId = (assigneeId: number): Task[] => {
  return tasks.filter(task => task.assigneeId === assigneeId);
};

export const getTasksByStatus = (status: string): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const updateTaskStatus = (taskId: number, newStatus: Task['status']): Task | null => {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    // ステータスがdoneの場合、完了日を設定
    if (newStatus === 'done') {
      tasks[taskIndex].completedDate = new Date().toISOString().split('T')[0];
      tasks[taskIndex].progress = 100;
    }
    
    return tasks[taskIndex];
  }
  return null;
};

export const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
  const newTask: Task = {
    ...taskData,
    id: Math.max(...tasks.map(t => t.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return newTask;
};

export const updateTask = (taskId: number, updates: Partial<Task>): Task | null => {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return tasks[taskIndex];
  }
  return null;
};

export const deleteTask = (taskId: number): boolean => {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    return true;
  }
  return false;
};

export const duplicateTask = (taskId: number): Task | null => {
  const originalTask = tasks.find(task => task.id === taskId);
  if (originalTask) {
    const duplicatedTask: Task = {
      ...originalTask,
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title: `${originalTask.title} (コピー)`,
      status: 'todo',
      progress: 0,
      actualHours: 0,
      completedDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(duplicatedTask);
    return duplicatedTask;
  }
  return null;
}; 