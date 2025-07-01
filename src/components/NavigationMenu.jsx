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
  ChevronRight
} from 'lucide-react';

const NavigationMenu = ({ 
  currentUser, 
  currentView, 
  setCurrentView, 
  handleLogout, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  isMenuCollapsed,
  setIsMenuCollapsed
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home, roles: ['admin', 'worker'] },
    { id: 'stock-in', label: '棚入れ登録', icon: Plus, roles: ['worker'] },
    { id: 'picking', label: 'ピッキング', icon: Minus, roles: ['worker'] },
    { id: 'inventory', label: '在庫トラッキング', icon: BarChart3, roles: ['admin', 'worker'] },
    { id: 'search', label: '残材検索', icon: Search, roles: ['admin', 'worker'] },
    { id: 'history', label: '作業履歴', icon: History, roles: ['admin'] },
    { id: 'label', label: 'ラベル発行', icon: QrCode, roles: ['admin'] }
  ];

  const userMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const toggleCollapse = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
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
            {userMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center ${isMenuCollapsed ? 'justify-center px-0' : ''} p-3 mb-2 rounded hover:bg-slate-700 transition ${
                  currentView === item.id ? 'bg-blue-600' : ''
                }`}
                title={isMenuCollapsed ? item.label : ''}
              >
                <item.icon className={`${isMenuCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'}`} />
                {!isMenuCollapsed && item.label}
              </button>
            ))}
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
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav>
                  {userMenuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center p-3 mb-2 rounded hover:bg-slate-700 transition ${
                        currentView === item.id ? 'bg-blue-600' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  ))}
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