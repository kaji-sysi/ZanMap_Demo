import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import LoginView from './components/LoginView';
import NavigationMenu from './components/NavigationMenu';
import DashboardView from './views/DashboardView';
import StockInView from './views/StockInView';
import PickingView from './views/PickingView';
import InventoryView from './views/InventoryView';
import SearchView from './views/SearchView';
import HistoryView from './views/HistoryView';
import LabelView from './views/LabelView';

// テスト用のサンプルデータ
const testUsers = [
  { id: 1, username: 'admin', password: 'admin123', name: '管理者', role: 'admin' },
  { id: 2, username: 'worker', password: 'worker123', name: '作業者', role: 'worker' }
];

const testMaterials = [
  { 
    id: 1, 
    code: 'B001', 
    name: '構造用合板', 
    category: '合板', 
    quantity: 5, 
    location: 'A-1-2', 
    unit: '枚',
    size: '1820×910×12mm',
    description: '構造用合板 JAS F☆☆☆☆',
    created_at: '2023-05-10',
    updated_at: '2023-05-15',
    last_action: '入庫'
  },
  { 
    id: 2, 
    code: 'B002', 
    name: 'SPF 2×4', 
    category: '木材', 
    quantity: 12, 
    location: 'B-2-1', 
    unit: '本',
    size: '1820×38×89mm',
    description: 'SPF 2×4材 乾燥処理済',
    created_at: '2023-05-12',
    updated_at: '2023-05-12',
    last_action: '入庫'
  },
  { 
    id: 3, 
    code: 'B003', 
    name: 'OSB合板', 
    category: '合板', 
    quantity: 8, 
    location: 'A-2-3', 
    unit: '枚',
    size: '1820×910×9mm',
    description: 'OSB合板 構造用',
    created_at: '2023-05-18',
    updated_at: '2023-05-20',
    last_action: 'ピッキング'
  },
  { 
    id: 4, 
    code: 'B004', 
    name: '杉板', 
    category: '板材', 
    quantity: 20, 
    location: 'C-1-2', 
    unit: '枚',
    size: '1800×180×15mm',
    description: '杉板 無垢材 本実加工',
    created_at: '2023-05-20',
    updated_at: '2023-05-20',
    last_action: '入庫'
  },
  { 
    id: 5, 
    code: 'B005', 
    name: 'メラミン化粧板', 
    category: '化粧板', 
    quantity: 3, 
    location: 'D-3-1', 
    unit: '枚',
    size: '1800×900×20mm',
    description: 'メラミン化粧板 ホワイト',
    created_at: '2023-05-22',
    updated_at: '2023-05-25',
    last_action: 'ピッキング'
  }
];

// テスト用の作業履歴データ
const testHistory = [
  { 
    id: 1, 
    type: '入庫', 
    material_id: 1, 
    material_name: '構造用合板', 
    quantity: 10, 
    location: 'A-1-2', 
    operator: '山田太郎', 
    timestamp: '2023-05-10 09:30:45' 
  },
  { 
    id: 2, 
    type: '入庫', 
    material_id: 2, 
    material_name: 'SPF 2×4', 
    quantity: 15, 
    location: 'B-2-1', 
    operator: '佐藤次郎', 
    timestamp: '2023-05-12 13:15:22' 
  },
  { 
    id: 3, 
    type: 'ピッキング', 
    material_id: 1, 
    material_name: '構造用合板', 
    quantity: 5, 
    location: 'A-1-2', 
    operator: '鈴木花子', 
    timestamp: '2023-05-15 10:45:33' 
  },
  { 
    id: 4, 
    type: '入庫', 
    material_id: 3, 
    material_name: 'OSB合板', 
    quantity: 8, 
    location: 'A-2-3', 
    operator: '山田太郎', 
    timestamp: '2023-05-18 14:20:10' 
  },
  { 
    id: 5, 
    type: 'ピッキング', 
    material_id: 3, 
    material_name: 'OSB合板', 
    quantity: 2, 
    location: 'A-2-3', 
    operator: '佐藤次郎', 
    timestamp: '2023-05-20 11:05:51' 
  }
];

// カテゴリリスト
const categories = ['合板', '木材', '板材', '化粧板', '金属', 'その他'];

const MaterialManagementSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [materials, setMaterials] = useState(testMaterials);
  const [history, setHistory] = useState(testHistory);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);

  // 通知表示
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ログイン処理
  const handleLogin = (username, password) => {
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
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('login');
    setNotification({ type: 'success', message: 'ログアウトしました' });
  };

  // ピッキング処理
  const handlePicking = (materialId, quantity, operator) => {
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
      const newHistoryEntry = {
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
  const handleStockIn = (materialData) => {
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
        const newHistoryEntry = {
          id: history.length + 1,
          type: '入庫',
          material_id: materialData.existingId,
          material_name: stockedMaterial.name,
          quantity: materialData.quantity,
          location: stockedMaterial.location,
          operator: materialData.operator || currentUser.name,
          timestamp: new Date().toLocaleString()
        };
        
        setHistory(prev => [...prev, newHistoryEntry]);
      }
    } 
    // 新しい材料を登録する場合
    else {
      const newMaterial = {
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
      const newHistoryEntry = {
        id: history.length + 1,
        type: '入庫（新規）',
        material_id: newMaterial.id,
        material_name: newMaterial.name,
        quantity: newMaterial.quantity,
        location: newMaterial.location,
        operator: materialData.operator || currentUser.name,
        timestamp: new Date().toLocaleString()
      };
      
      setHistory(prev => [...prev, newHistoryEntry]);
    }

    return true;
  };

  // レスポンシブ対応: モバイルメニュー閉じる
  useEffect(() => {
    const handleResize = () => {
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
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMenuCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* 通知 */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}
        
        {/* コンテンツエリア */}
        <main className="flex-1 overflow-auto bg-gray-50">
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
        </main>
      </div>
    </div>
  );
};

export default MaterialManagementSystem; 