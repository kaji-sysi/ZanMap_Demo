'use client';

import React from 'react';
import { 
  Package, 
  QrCode, 
  Search, 
  Home, 
  User, 
  LogOut, 
  Plus, 
  Minus,
  History,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Building2,
  Database,
  LucideIcon,
  CheckSquare,
  Kanban,
  List,
  Calendar,
  GanttChart
} from 'lucide-react';
import { User as UserType } from '@/app/types';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  roles: ('admin' | 'worker')[];
  children?: MenuItem[];
}

interface NavigationMenuProps {
  currentUser: UserType | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  handleLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isMenuCollapsed: boolean;
  setIsMenuCollapsed: (isCollapsed: boolean) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  currentUser, 
  currentView, 
  setCurrentView, 
  handleLogout, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  isMenuCollapsed,
  setIsMenuCollapsed
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set(['master-management']));
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home, roles: ['admin', 'worker'] },
    { id: 'stock-in', label: '棚入れ登録', icon: Plus, roles: ['worker'] },
    { id: 'picking', label: 'ピッキング', icon: Minus, roles: ['worker'] },
    { id: 'inventory', label: '在庫トラッキング', icon: BarChart3, roles: ['admin', 'worker'] },
    { id: 'search', label: '残材検索', icon: Search, roles: ['admin', 'worker'] },
    { id: 'history', label: '作業履歴', icon: History, roles: ['admin'] },
    { id: 'label', label: 'ラベル発行', icon: QrCode, roles: ['admin'] },
    { 
      id: 'task-management', 
      label: 'タスク管理', 
      icon: CheckSquare, 
      roles: ['admin', 'worker'],
      children: [
        { id: 'task-kanban', label: 'カンバンボード', icon: Kanban, roles: ['admin', 'worker'] },
        { id: 'task-list', label: 'タスクリスト', icon: List, roles: ['admin', 'worker'] },
        { id: 'task-gantt', label: 'ガントチャート', icon: GanttChart, roles: ['admin', 'worker'] },
        { id: 'task-calendar', label: 'カレンダー', icon: Calendar, roles: ['admin', 'worker'] }
      ]
    },
    { 
      id: 'master-management', 
      label: 'マスタ管理', 
      icon: Database, 
      roles: ['admin'],
      children: [
        { id: 'warehouse-master', label: '倉庫マスタ管理', icon: Settings, roles: ['admin'] },
        { id: 'storage-master', label: '置き場マスタ管理', icon: Database, roles: ['admin'] },
        { id: 'facility-master', label: '設備マスタ管理', icon: Building2, roles: ['admin'] }
      ]
    }
  ];



  const toggleCollapse = (): void => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  const toggleExpanded = (itemId: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    items.forEach(item => {
      if (currentUser && item.roles.includes(currentUser.role)) {
        result.push(item);
        if (item.children && expandedItems.has(item.id)) {
          result.push(...flattenMenuItems(item.children));
        }
      }
    });
    return result;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = currentView === item.id;
    
    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              setCurrentView(item.id);
              if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
              }
            }
          }}
          className={`w-full flex items-center ${isMenuCollapsed ? 'justify-center px-0' : ''} p-3 mb-2 rounded hover:bg-slate-700 transition ${
            isActive ? 'bg-blue-600' : ''
          } ${level > 0 ? 'ml-4' : ''}`}
          title={isMenuCollapsed ? item.label : ''}
          style={{ paddingLeft: isMenuCollapsed ? undefined : `${12 + level * 16}px` }}
        >
          <item.icon className={`${isMenuCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} ${level > 0 ? 'w-4 h-4' : ''}`} />
          {!isMenuCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {hasChildren && (
                isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !isMenuCollapsed && (
          <div className="ml-4">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* デスクトップメニュー */}
      <div className={`hidden lg:block bg-slate-800 text-white ${isMenuCollapsed ? 'w-20' : 'w-64'} min-h-screen transition-all duration-300 relative`}>
        <div className="p-4">
          <div className="flex items-center mb-8">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Package className="w-6 h-6" />
            </div>
            {!isMenuCollapsed && <h2 className="text-xl font-bold">残材管理</h2>}
          </div>
          
          <nav>
            {menuItems.map(item => {
              if (currentUser && item.roles.includes(currentUser.role)) {
                return renderMenuItem(item);
              }
              return null;
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="border-t border-slate-600 pt-4">
              <div className="flex items-center mb-3">
                <User className={`${isMenuCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-2'}`} />
                {!isMenuCollapsed && <span className="text-sm">{currentUser?.name}</span>}
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${isMenuCollapsed ? 'justify-center px-0' : ''} p-2 rounded hover:bg-slate-700 transition`}
                title={isMenuCollapsed ? 'ログアウト' : ''}
              >
                <LogOut className={`${isMenuCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-2'}`} />
                {!isMenuCollapsed && 'ログアウト'}
              </button>
            </div>
          </div>
        </div>

        {/* 開閉ボタン */}
        <button 
          onClick={toggleCollapse}
          className="absolute -right-4 top-20 bg-slate-800 text-white p-2 rounded-full shadow-md hover:bg-slate-700 transition-colors"
          aria-label={isMenuCollapsed ? "メニューを展開" : "メニューを折りたたむ"}
        >
          {isMenuCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* モバイルメニュー */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex justify-between items-center z-30">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">残材管理</h2>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded hover:bg-slate-700 transition-colors"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <>
            {/* オーバーレイ */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* サイドメニュー */}
            <div className="fixed top-0 left-0 h-full w-64 bg-slate-800 text-white z-50 shadow-xl transform transition-transform duration-300">
              <div className="p-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold">残材管理</h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                    aria-label="メニューを閉じる"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav>
                  {menuItems.map(item => {
                    if (currentUser && item.roles.includes(currentUser.role)) {
                      return renderMenuItem(item);
                    }
                    return null;
                  })}
                </nav>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="border-t border-slate-600 pt-4">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 mr-2" />
                      <span className="text-sm">{currentUser?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center p-2 rounded hover:bg-slate-700 transition"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NavigationMenu; 