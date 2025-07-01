import React, { useEffect, useRef } from 'react';
import { Package, Search, AlertCircle } from 'lucide-react';

const WarehouseMap = ({ materials, onSelectMaterial }) => {
  // 棚の位置情報をパースして座標に変換する関数
  const parseLocation = (location) => {
    if (!location) return null;
    
    // 例: "A-1-1" => { area: "A", row: 1, shelf: 1 }
    const parts = location.split('-');
    if (parts.length !== 3) return null;
    
    return {
      area: parts[0],
      row: parseInt(parts[1], 10),
      shelf: parseInt(parts[2], 10)
    };
  };

  // エリアごとに配置情報を計算
  const areas = {
    'A': { x: 0, y: 0, color: 'bg-blue-100', borderColor: 'border-blue-400', title: '原材料エリア', shelfHeight: 35 },
    'B': { x: 0, y: 300, color: 'bg-green-100', borderColor: 'border-green-400', title: '加工済材料エリア', shelfHeight: 30 },
    'C': { x: 300, y: 0, color: 'bg-orange-100', borderColor: 'border-orange-400', title: '特殊材料エリア', shelfHeight: 40 },
    'D': { x: 300, y: 300, color: 'bg-purple-100', borderColor: 'border-purple-400', title: '廃材保管エリア', shelfHeight: 25 },
    'E': { x: 600, y: 0, color: 'bg-red-100', borderColor: 'border-red-400', title: '工具保管エリア', shelfHeight: 45 },
    'F': { x: 600, y: 300, color: 'bg-yellow-100', borderColor: 'border-yellow-400', title: '出荷待機エリア', shelfHeight: 35 },
    'G': { x: 900, y: 0, color: 'bg-indigo-100', borderColor: 'border-indigo-400', title: '特殊機材エリア', shelfHeight: 50 },
  };

  // 残材をマップ上に配置
  const getMaterialPosition = (material) => {
    const location = parseLocation(material.location);
    if (!location) return null;

    const area = areas[location.area];
    if (!area) return null;

    // 各エリア内での位置計算
    const x = area.x + (location.shelf - 1) * 40;
    const y = area.y + (location.row - 1) * 40;

    return { 
      x, 
      y, 
      area: location.area, 
      color: area.color, 
      borderColor: area.borderColor,
      shelfHeight: area.shelfHeight
    };
  };

  // マップの寸法
  const mapWidth = 1200;
  const mapHeight = 800;

  // 壁の座標（より詳細な建屋形状を定義）
  const buildingWalls = [
    // 外壁
    { x1: 0, y1: 0, x2: 900, y2: 0, thick: true }, // 上の壁 (メイン建屋)
    { x1: 0, y1: 0, x2: 0, y2: 600, thick: true }, // 左の壁
    { x1: 0, y1: 600, x2: 600, y2: 600, thick: true }, // 下の壁 (メイン建屋)
    { x1: 900, y1: 0, x2: 900, y2: 300, thick: true }, // 右上の壁
    { x1: 900, y1: 300, x2: 1100, y2: 300, thick: true }, // 右の横壁
    { x1: 1100, y1: 300, x2: 1100, y2: 800, thick: true }, // 右の縦壁
    { x1: 600, y1: 600, x2: 600, y2: 800, thick: true }, // L字部分の内側縦壁
    { x1: 600, y1: 800, x2: 1100, y2: 800, thick: true }, // L字部分の下壁

    // 内壁と間仕切り
    { x1: 300, y1: 0, x2: 300, y2: 600, thick: false }, // メインエリア区切り1
    { x1: 600, y1: 0, x2: 600, y2: 600, thick: false }, // メインエリア区切り2
    { x1: 0, y1: 300, x2: 600, y2: 300, thick: false }, // 横のエリア区切り
    
    // 中庭（ドーナツ型の空間を作る）
    { x1: 350, y1: 350, x2: 550, y2: 350, thick: true }, // 中庭の上壁
    { x1: 550, y1: 350, x2: 550, y2: 550, thick: true }, // 中庭の右壁
    { x1: 350, y1: 550, x2: 550, y2: 550, thick: true }, // 中庭の下壁
    { x1: 350, y1: 350, x2: 350, y2: 550, thick: true }, // 中庭の左壁

    // 別館への連絡通路
    { x1: 900, y1: 150, x2: 1000, y2: 150, thick: true }, // 連絡通路上壁
    { x1: 900, y1: 200, x2: 1000, y2: 200, thick: true }, // 連絡通路下壁
    { x1: 1000, y1: 100, x2: 1000, y2: 250, thick: true }, // 別館右上壁
    { x1: 1000, y1: 100, x2: 1100, y2: 100, thick: true }, // 別館上壁
    { x1: 1100, y1: 100, x2: 1100, y2: 300, thick: true }, // 別館右壁
  ];

  // 倉庫内の施設や設備の定義（詳細レイアウト）
  const facilities = [
    { type: 'entrance', x: 450, y: 600, width: 80, height: 20, label: '入口', rotate: false, height3d: 0 },
    { type: 'office', x: 700, y: 650, width: 180, height: 120, label: '事務所', rotate: false, height3d: 60 },
    { type: 'loading', x: 20, y: 600, width: 120, height: 20, label: '搬入口', rotate: false, height3d: 0 },
    { type: 'shipping', x: 780, y: 800, width: 120, height: 20, label: '出荷口', rotate: false, height3d: 0 },
    { type: 'restroom', x: 950, y: 430, width: 60, height: 50, label: 'トイレ', rotate: false, height3d: 30 },
    { type: 'cutStation', x: 150, y: 150, width: 80, height: 80, label: '裁断エリア', rotate: false, height3d: 25 },
    { type: 'measuringStation', x: 450, y: 130, width: 60, height: 60, label: '計測機器', rotate: false, height3d: 35 },
    { type: 'processArea', x: 780, y: 120, width: 100, height: 140, label: '加工エリア', rotate: false, height3d: 40 },
    { type: 'meetingRoom', x: 800, y: 350, width: 100, height: 80, label: '会議室', rotate: false, height3d: 45 },
    { type: 'securityRoom', x: 950, y: 500, width: 80, height: 60, label: '警備室', rotate: false, height3d: 30 },
    { type: 'stairs', x: 650, y: 350, width: 40, height: 80, label: '階段', rotate: false, height3d: 15 },
    { type: 'elevator', x: 650, y: 450, width: 40, height: 40, label: 'EV', rotate: false, height3d: 20 },
    { type: 'serverRoom', x: 1020, y: 150, width: 60, height: 80, label: 'サーバ室', rotate: false, height3d: 35 },
    { type: 'breakRoom', x: 950, y: 700, width: 120, height: 80, label: '休憩室', rotate: false, height3d: 40 },
  ];

  // ドアの位置
  const doors = [
    { x: 490, y: 600, width: 20, height: 5, rotate: false }, // メイン入口
    { x: 80, y: 600, width: 20, height: 5, rotate: false }, // 搬入口
    { x: 840, y: 800, width: 20, height: 5, rotate: false }, // 出荷口
    { x: 950, y: 175, width: 5, height: 20, rotate: true }, // 連絡通路ドア
  ];

  // 窓の位置
  const windows = [
    { x: 0, y: 100, width: 5, height: 40, rotate: true }, // 左壁1
    { x: 0, y: 200, width: 5, height: 40, rotate: true }, // 左壁2
    { x: 0, y: 400, width: 5, height: 40, rotate: true }, // 左壁3
    { x: 0, y: 500, width: 5, height: 40, rotate: true }, // 左壁4
    { x: 200, y: 0, width: 40, height: 5, rotate: false }, // 上壁1
    { x: 400, y: 0, width: 40, height: 5, rotate: false }, // 上壁2
    { x: 600, y: 0, width: 40, height: 5, rotate: false }, // 上壁3
    { x: 800, y: 0, width: 40, height: 5, rotate: false }, // 上壁4
    { x: 1000, y: 700, width: 40, height: 5, rotate: false }, // 下壁
    { x: 800, y: 700, width: 40, height: 5, rotate: false }, // 下壁2
  ];

  // 残材の棚の配置情報
  const shelves = [
    // エリアAの棚
    { x: 40, y: 50, width: 200, height: 40, area: 'A', rows: 3, shelves: 5 },
    { x: 40, y: 150, width: 200, height: 40, area: 'A', rows: 3, shelves: 5 },
    
    // エリアBの棚
    { x: 40, y: 350, width: 200, height: 40, area: 'B', rows: 3, shelves: 5 },
    { x: 40, y: 450, width: 200, height: 40, area: 'B', rows: 3, shelves: 5 },
    
    // エリアCの棚
    { x: 340, y: 50, width: 200, height: 40, area: 'C', rows: 3, shelves: 5 },
    { x: 340, y: 150, width: 200, height: 40, area: 'C', rows: 3, shelves: 5 },
    
    // エリアDの棚
    { x: 340, y: 350, width: 200, height: 40, area: 'D', rows: 3, shelves: 5 },
    { x: 340, y: 450, width: 200, height: 40, area: 'D', rows: 3, shelves: 5 },
    
    // エリアEの棚
    { x: 640, y: 50, width: 200, height: 40, area: 'E', rows: 3, shelves: 5 },
    { x: 640, y: 150, width: 200, height: 40, area: 'E', rows: 3, shelves: 5 },
    
    // エリアFの棚
    { x: 640, y: 350, width: 200, height: 40, area: 'F', rows: 3, shelves: 5 },
    { x: 640, y: 450, width: 200, height: 40, area: 'F', rows: 3, shelves: 5 },
    
    // エリアGの棚
    { x: 940, y: 50, width: 120, height: 40, area: 'G', rows: 3, shelves: 3 },
    { x: 940, y: 150, width: 120, height: 40, area: 'G', rows: 3, shelves: 3 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 my-4 overflow-auto">
      <h3 className="text-lg font-semibold mb-4">倉庫マップ（俯瞰図）</h3>
      
      <div className="relative" style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}>
        {/* 建屋の背景 */}
        <svg width={mapWidth} height={mapHeight} className="absolute top-0 left-0">
          {/* メイン建屋 */}
          <defs>
            <linearGradient id="floorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* 建物の床 - 俯瞰図用の微妙な影付き */}
          <path 
            d="M0,0 L900,0 L900,300 L1100,300 L1100,800 L600,800 L600,600 L0,600 Z" 
            fill="url(#floorGradient)" 
            filter="url(#shadow)"
          />
          
          {/* 建物の外壁 - 立体感を出す */}
          <path 
            d="M0,0 L900,0 L900,300 L1100,300 L1100,800 L600,800 L600,600 L0,600 Z" 
            fill="none" 
            stroke="#1f2937" 
            strokeWidth="8"
            filter="url(#shadow)"
          />
          
          {/* 中庭 */}
          <rect x="350" y="350" width="200" height="200" fill="#e5e7eb" stroke="#1f2937" strokeWidth="4" />
          
          {/* 別館 */}
          <path 
            d="M1000,100 L1100,100 L1100,300 L1000,250 Z" 
            fill="#f3f4f6" 
            stroke="#1f2937" 
            strokeWidth="4"
            filter="url(#shadow)"
          />
          
          {/* 連絡通路 */}
          <path 
            d="M900,150 L1000,150 L1000,200 L900,200 Z" 
            fill="#e5e7eb" 
            stroke="#1f2937" 
            strokeWidth="3"
          />
        </svg>

        {/* エリア区分 - 3D効果付き */}
        <div className="absolute top-0 left-0 border-2 border-blue-400 bg-blue-100 bg-opacity-30" 
          style={{ width: '240px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(59, 130, 246, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-blue-800">エリアA</span>
            <div className="text-xs text-blue-800">原材料エリア</div>
          </div>
        </div>
        <div className="absolute top-0 border-2 border-orange-400 bg-orange-100 bg-opacity-30" 
          style={{ left: '240px', width: '240px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(249, 115, 22, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-orange-800">エリアC</span>
            <div className="text-xs text-orange-800">特殊材料エリア</div>
          </div>
        </div>
        <div className="absolute top-0 border-2 border-red-400 bg-red-100 bg-opacity-30" 
          style={{ left: '480px', width: '240px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(239, 68, 68, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-red-800">エリアE</span>
            <div className="text-xs text-red-800">工具保管エリア</div>
          </div>
        </div>
        <div className="absolute top-0 border-2 border-indigo-400 bg-indigo-100 bg-opacity-30" 
          style={{ left: '720px', width: '180px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(99, 102, 241, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-indigo-800">エリアG</span>
            <div className="text-xs text-indigo-800">特殊機材エリア</div>
          </div>
        </div>
        <div className="absolute border-2 border-green-400 bg-green-100 bg-opacity-30" 
          style={{ top: '300px', left: '0', width: '300px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(34, 197, 94, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-green-800">エリアB</span>
            <div className="text-xs text-green-800">加工済材料エリア</div>
          </div>
        </div>
        <div className="absolute border-2 border-purple-400 bg-purple-100 bg-opacity-30" 
          style={{ top: '300px', left: '300px', width: '300px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(168, 85, 247, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-purple-800">エリアD</span>
            <div className="text-xs text-purple-800">廃材保管エリア</div>
          </div>
        </div>
        <div className="absolute border-2 border-yellow-400 bg-yellow-100 bg-opacity-30" 
          style={{ top: '300px', left: '600px', width: '300px', height: '300px', boxShadow: 'inset 0px 10px 20px -10px rgba(234, 179, 8, 0.3)' }}>
          <div className="absolute top-2 left-2 bg-white bg-opacity-70 px-2 py-1 rounded shadow-md">
            <span className="text-lg font-bold text-yellow-800">エリアF</span>
            <div className="text-xs text-yellow-800">出荷待機エリア</div>
          </div>
        </div>

        {/* 中庭のラベル */}
        <div className="absolute" style={{ top: '420px', left: '400px' }}>
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded text-sm font-medium text-gray-600 shadow-md">中庭</span>
        </div>

        {/* 別館のラベル */}
        <div className="absolute" style={{ top: '170px', left: '1050px' }}>
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded text-sm font-medium text-gray-600 transform -rotate-90 inline-block shadow-md">別館</span>
        </div>

        {/* 内部通路 */}
        <div className="absolute bg-gradient-to-r from-gray-300 to-gray-200" style={{ top: '150px', left: '0px', width: '720px', height: '4px' }}></div>
        <div className="absolute bg-gradient-to-r from-gray-300 to-gray-200" style={{ top: '450px', left: '0px', width: '300px', height: '4px' }}></div>
        <div className="absolute bg-gradient-to-r from-gray-300 to-gray-200" style={{ top: '450px', left: '600px', width: '500px', height: '4px' }}></div>
        <div className="absolute bg-gradient-to-b from-gray-300 to-gray-200" style={{ top: '0px', left: '120px', width: '4px', height: '600px' }}></div>
        <div className="absolute bg-gradient-to-b from-gray-300 to-gray-200" style={{ top: '0px', left: '360px', width: '4px', height: '300px' }}></div>
        <div className="absolute bg-gradient-to-b from-gray-300 to-gray-200" style={{ top: '0px', left: '600px', width: '4px', height: '300px' }}></div>
        <div className="absolute bg-gradient-to-b from-gray-300 to-gray-200" style={{ top: '300px', left: '750px', width: '4px', height: '500px' }}></div>
        <div className="absolute bg-gradient-to-r from-gray-300 to-gray-200" style={{ top: '650px', left: '600px', width: '500px', height: '4px' }}></div>

        {/* 残材用の棚（3D表示） */}
        {shelves.map((shelf, idx) => {
          const areaInfo = areas[shelf.area];
          const shelfColor = areaInfo ? areaInfo.borderColor.replace('border-', 'border-b-') : 'border-b-gray-400';
          const shelfBgColor = areaInfo ? areaInfo.color.replace('bg-', 'bg-') : 'bg-gray-100';
          const shelfHeight = areaInfo ? areaInfo.shelfHeight : 30;
          
          return (
            <div key={`shelf-${idx}`} className="absolute" style={{ 
              left: `${shelf.x}px`, 
              top: `${shelf.y}px`, 
              width: `${shelf.width}px`, 
              height: `${shelf.height}px`,
            }}>
              {/* 棚の側面（3D効果） */}
              <div className={`absolute ${shelfBgColor} ${shelfColor} border-2`} 
                style={{ 
                  width: '100%', 
                  height: `${shelfHeight}px`, 
                  bottom: '0px', 
                  transform: 'perspective(500px) rotateX(60deg)',
                  transformOrigin: 'bottom',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}></div>
              {/* 棚の上面 */}
              <div className={`absolute ${shelfBgColor} border-2 ${shelfColor.replace('border-b-', 'border-')}`} 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}></div>
              <div className="absolute text-xs font-medium text-gray-700 bg-white bg-opacity-70 px-1 rounded"
                style={{ top: '2px', left: '2px' }}>
                {areaInfo?.title}棚
              </div>
            </div>
          );
        })}

        {/* 倉庫内の施設や設備（3D効果付き） */}
        {facilities.map((facility, idx) => (
          <div key={idx} className="absolute" style={{ 
            left: `${facility.x}px`, 
            top: `${facility.y}px` 
          }}>
            {/* 3D効果のための側面 */}
            {facility.height3d > 0 && (
              <div
                className="absolute border-2 border-gray-600 bg-gray-300"
                style={{
                  width: `${facility.width}px`,
                  height: `${facility.height3d}px`,
                  bottom: '0px',
                  transform: 'perspective(800px) rotateX(60deg)',
                  transformOrigin: 'bottom',
                  zIndex: 1,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                }}
              ></div>
            )}
            {/* 施設の上面 */}
            <div 
              className="absolute border-2 border-gray-700 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center text-xs font-semibold"
              style={{
                width: `${facility.width}px`,
                height: `${facility.height}px`,
                transform: facility.rotate ? 'rotate(90deg)' : 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 5
              }}
            >
              {facility.label}
            </div>
          </div>
        ))}

        {/* ドア - 少し3D風に */}
        {doors.map((door, idx) => (
          <div key={`door-${idx}`} className="absolute">
            <div 
              className="absolute bg-gradient-to-b from-blue-500 to-blue-700"
              style={{
                left: `${door.x}px`,
                top: `${door.y}px`,
                width: `${door.width}px`,
                height: `${door.height}px`,
                transform: door.rotate ? 'rotate(90deg)' : 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            ></div>
          </div>
        ))}

        {/* 窓 - 光沢効果付き */}
        {windows.map((window, idx) => (
          <div key={`window-${idx}`} className="absolute">
            <div 
              className="absolute bg-gradient-to-br from-sky-100 to-sky-200"
              style={{
                left: `${window.x}px`,
                top: `${window.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
                transform: window.rotate ? 'rotate(90deg)' : 'none',
                boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.8)'
              }}
            ></div>
          </div>
        ))}

        {/* 危険エリア - 強調表示 */}
        <div className="absolute border-2 border-dashed border-red-500 bg-red-100 bg-opacity-30 rounded-full" 
          style={{ 
            top: '500px', 
            left: '850px', 
            width: '80px', 
            height: '80px',
            boxShadow: 'inset 0 0 15px rgba(239, 68, 68, 0.3), 0 0 10px rgba(239, 68, 68, 0.2)'
          }}>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="bg-white bg-opacity-80 px-2 py-1 rounded flex items-center shadow-md">
              <AlertCircle className="text-red-500 w-5 h-5" />
              <span className="ml-1 text-xs text-red-700">危険物保管</span>
            </div>
          </div>
        </div>

        {/* 残材アイテム - 3D風に表示 */}
        {materials.map(material => {
          const position = getMaterialPosition(material);
          if (!position) return null;

          return (
            <div
              key={material.id}
              className={`absolute ${position.color} border-2 ${position.borderColor} rounded-md p-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transform hover:scale-110 transition-transform`}
              style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                width: '32px',
                height: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                transform: 'perspective(500px) rotateX(10deg)'
              }}
              onClick={() => onSelectMaterial(material)}
              title={`${material.name} - ${material.location}`}
            >
              {/* 立体的な箱の上面 */}
              <div className="flex items-center justify-center w-full h-full relative">
                <Package className="w-5 h-5" />
                {/* 数量バッジ */}
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-400 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {material.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <Search className="w-4 h-4 mr-1" />
          残材をクリックすると詳細が表示されます
        </p>
        <p className="text-xs text-gray-500 mt-1">※エリア内の位置は残材の保管場所コード（例：A-1-1）に基づいて表示されています</p>
      </div>
    </div>
  );
};

export default WarehouseMap; 