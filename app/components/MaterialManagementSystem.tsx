'use client';

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

// コンポーネントのインポート
import LoginView from './LoginView';
import NavigationMenu from './NavigationMenu';
import DashboardView from './views/DashboardView';
import StockInView from './views/StockInView';
import PickingView from './views/PickingView';
import InventoryView from './views/InventoryView';
import SearchView from './views/SearchView';
import HistoryView from './views/HistoryView';
import LabelView from './views/LabelView';
import WarehouseMasterView from './WarehouseMasterView';
import StorageMasterManagement from './StorageMasterManagement';
import FacilityMasterManagement from './FacilityMasterManagement';
import TaskManagementView from './views/TaskManagementView';

// 型とモックデータのインポート
import { User, Material, HistoryEntry, NotificationType, StockInData } from '@/app/types';
import { WarehouseLayout } from '@/app/types/warehouse';
import { testUsers, testMaterials, testHistory, categories } from '@/app/lib/mockData';
import { sampleLayouts } from '@/app/lib/warehouseMasterData';

const MaterialManagementSystem: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('login');
  const [materials, setMaterials] = useState<Material[]>(testMaterials);
  const [history, setHistory] = useState<HistoryEntry[]>(testHistory);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  
  // マスタ管理用の状態
  const [warehouseLayouts, setWarehouseLayouts] = useState<WarehouseLayout[]>(sampleLayouts);

  // 通知表示
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ログイン処理
  const handleLogin = (username: string, password: string): boolean => {
    const user = testUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
      setNotification({ type: 'success', message: 'ログインしました' });
      return true;
    }
    setNotification({ type: 'error', message: 'ログインに失敗しました' });
    return false;
  };

  // ログアウト処理
  const handleLogout = (): void => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('login');
    setNotification({ type: 'success', message: 'ログアウトしました' });
  };

  // ピッキング処理
  const handlePicking = (materialId: number, quantity: number, operator: string): boolean => {
    setMaterials(prev => 
      prev.map(material => {
        if (material.id === materialId) {
          const newQuantity = material.quantity - quantity;
          return {
            ...material,
            quantity: newQuantity >= 0 ? newQuantity : 0,
            updated_at: new Date().toISOString().split('T')[0],
            last_action: 'ピッキング'
          };
        }
        return material;
      })
    );

    // 履歴に追加
    const pickedMaterial = materials.find(m => m.id === materialId);
    if (pickedMaterial) {
      const newHistoryEntry: HistoryEntry = {
        id: history.length + 1,
        type: 'ピッキング',
        material_id: materialId,
        material_name: pickedMaterial.name,
        quantity,
        location: pickedMaterial.location,
        operator,
        timestamp: new Date().toLocaleString()
      };
      
      setHistory(prev => [...prev, newHistoryEntry]);
    }

    return true;
  };

  // 棚入れ処理
  const handleStockIn = (materialData: StockInData): boolean => {
    // 既存の材料の在庫を増やす場合
    if (materialData.existingId) {
      setMaterials(prev => 
        prev.map(material => {
          if (material.id === materialData.existingId) {
            return {
              ...material,
              quantity: material.quantity + materialData.quantity,
              updated_at: new Date().toISOString().split('T')[0],
              last_action: '入庫'
            };
          }
          return material;
        })
      );

      // 履歴に追加
      const stockedMaterial = materials.find(m => m.id === materialData.existingId);
      if (stockedMaterial) {
        const newHistoryEntry: HistoryEntry = {
          id: history.length + 1,
          type: '入庫',
          material_id: materialData.existingId,
          material_name: stockedMaterial.name,
          quantity: materialData.quantity,
          location: stockedMaterial.location,
          operator: materialData.operator || (currentUser ? currentUser.name : ''),
          timestamp: new Date().toLocaleString()
        };
        
        setHistory(prev => [...prev, newHistoryEntry]);
      }
    } 
    // 新しい材料を登録する場合
    else {
      const newMaterial: Material = {
        id: materials.length + 1,
        code: materialData.code,
        name: materialData.name,
        category: materialData.category,
        quantity: materialData.quantity,
        location: materialData.location,
        unit: materialData.unit,
        size: materialData.size,
        description: materialData.description,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        last_action: '入庫'
      };
      
      setMaterials(prev => [...prev, newMaterial]);

      // 履歴に追加
      const newHistoryEntry: HistoryEntry = {
        id: history.length + 1,
        type: '入庫（新規）',
        material_id: newMaterial.id,
        material_name: newMaterial.name,
        quantity: newMaterial.quantity,
        location: newMaterial.location,
        operator: materialData.operator || (currentUser ? currentUser.name : ''),
        timestamp: new Date().toLocaleString()
      };
      
      setHistory(prev => [...prev, newHistoryEntry]);
    }

    return true;
  };

  // 倉庫レイアウト保存処理
  const handleSaveLayout = (layout: WarehouseLayout): void => {
    setWarehouseLayouts(prev => {
      const existingIndex = prev.findIndex(l => l.id === layout.id);
      if (existingIndex >= 0) {
        // 既存レイアウトの更新
        const updated = [...prev];
        updated[existingIndex] = layout;
        return updated;
      } else {
        // 新規レイアウトの追加
        return [...prev, layout];
      }
    });
    setNotification({ type: 'success', message: 'レイアウトを保存しました' });
  };

  // 倉庫レイアウト削除処理
  const handleDeleteLayout = (layoutId: string): void => {
    setWarehouseLayouts(prev => prev.filter(l => l.id !== layoutId));
    setNotification({ type: 'success', message: 'レイアウトを削除しました' });
  };

  // レスポンシブ対応: モバイルメニュー閉じる
  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <NavigationMenu 
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMenuCollapsed={isMenuCollapsed}
        setIsMenuCollapsed={setIsMenuCollapsed}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMenuCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0`}>
        {/* 通知 */}
        {notification && (
          <div 
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-blue-600 text-white' 
                : 'bg-red-500 text-white'
            } transform transition-all duration-300 ease-in-out animate-fade-in`}
            role="alert"
            aria-live="assertive"
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}
        
        {/* コンテンツエリア */}
        <main className={`flex-1 bg-gray-50 w-full ${
          currentView === 'task-gantt' ? 'p-2 overflow-hidden' : 'p-4 overflow-auto'
        }`}>
          {currentView === 'dashboard' && <DashboardView materials={materials} history={history} />}
          {currentView === 'stock-in' && <StockInView 
            materials={materials}
            onStockIn={handleStockIn}
            currentUser={currentUser} 
            setNotification={setNotification}
            categories={categories}
          />}
          {currentView === 'picking' && <PickingView 
            materials={materials}
            onPicking={handlePicking}
            currentUser={currentUser} 
            setNotification={setNotification}
          />}
          {currentView === 'inventory' && <InventoryView 
            materials={materials}
            categories={categories}
          />}
          {currentView === 'search' && <SearchView 
            materials={materials}
            categories={categories}
          />}
          {currentView === 'history' && <HistoryView 
            history={history} 
            materials={materials}
          />}
          {currentView === 'label' && <LabelView 
            materials={materials}
            setNotification={setNotification}
          />}
          {/* タスク管理ビュー */}
          {currentView === 'task-kanban' && <TaskManagementView 
            currentUser={currentUser}
            viewType="kanban"
          />}
          {currentView === 'task-list' && <TaskManagementView 
            currentUser={currentUser}
            viewType="list"
          />}
          {currentView === 'task-gantt' && <TaskManagementView 
            currentUser={currentUser}
            viewType="gantt"
          />}
          {currentView === 'task-calendar' && <TaskManagementView 
            currentUser={currentUser}
            viewType="calendar"
          />}
          {currentView === 'warehouse-master' && <WarehouseMasterView 
            layouts={warehouseLayouts}
            onSaveLayout={handleSaveLayout}
            onDeleteLayout={handleDeleteLayout}
          />}
          {currentView === 'storage-master' && <StorageMasterManagement />}
          {currentView === 'facility-master' && <FacilityMasterManagement />}
        </main>
      </div>
    </div>
  );
};

export default MaterialManagementSystem; 