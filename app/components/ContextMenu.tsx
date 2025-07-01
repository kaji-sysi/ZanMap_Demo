import React, { useEffect, useRef } from 'react';
import { Edit, Trash2, Copy, Move, Settings } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
  onSettings?: () => void;
  itemType: 'area' | 'storage' | 'facility';
  itemName: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onDelete,
  onEdit,
  onCopy,
  onMove,
  onSettings,
  itemType,
  itemName
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 画面端での位置調整
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'area': return 'エリア';
      case 'storage': return '置き場';
      case 'facility': return '設備';
      default: return 'アイテム';
    }
  };

  const menuItems = [
    {
      label: '編集',
      icon: Edit,
      onClick: onEdit,
      available: !!onEdit,
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'コピー',
      icon: Copy,
      onClick: onCopy,
      available: !!onCopy,
      className: 'text-green-600 hover:bg-green-50'
    },
    {
      label: '移動',
      icon: Move,
      onClick: onMove,
      available: !!onMove,
      className: 'text-purple-600 hover:bg-purple-50'
    },
    {
      label: '設定',
      icon: Settings,
      onClick: onSettings,
      available: !!onSettings,
      className: 'text-gray-600 hover:bg-gray-50'
    },
    {
      label: '削除',
      icon: Trash2,
      onClick: onDelete,
      available: true,
      className: 'text-red-600 hover:bg-red-50',
      isDangerous: true
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ヘッダー */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-900 truncate">
          {getItemTypeLabel()}: {itemName}
        </div>
      </div>

      {/* メニューアイテム */}
      <div className="py-1">
        {menuItems
          .filter(item => item.available)
          .map((item, index) => (
            <React.Fragment key={item.label}>
              {item.isDangerous && index > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}
              <button
                onClick={() => {
                  item.onClick?.();
                  onClose();
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${item.className}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            </React.Fragment>
          ))
        }
      </div>
    </div>
  );
};

export default ContextMenu; 