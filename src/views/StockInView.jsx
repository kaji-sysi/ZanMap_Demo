import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';

const StockInView = ({ simulateRFIDScan, setWorkHistory, workHistory, currentUser, setNotification }) => {
  const [scannedMaterial, setScannedMaterial] = useState('');
  const [scannedLocation, setScannedLocation] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleStockIn = () => {
    if (!scannedMaterial || !scannedLocation) {
      setNotification({ type: 'error', message: 'RFIDをスキャンしてください' });
      return;
    }

    const newHistory = {
      id: Date.now().toString(),
      action: 'in',
      materialId: '1',
      materialName: 'SUS304板材',
      location: scannedLocation,
      quantity: quantity,
      worker: currentUser?.name || '',
      timestamp: new Date()
    };

    setWorkHistory([newHistory, ...workHistory]);
    setNotification({ type: 'success', message: '棚入れを登録しました' });
    
    setScannedMaterial('');
    setScannedLocation('');
    setQuantity(1);
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6">棚入れ登録</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">残材RFID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedMaterial}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="RFIDをスキャンしてください"
              />
              <button
                onClick={() => {
                  const tag = simulateRFIDScan();
                  setScannedMaterial(tag);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
              >
                <ScanLine className="w-5 h-5" />
                スキャン
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">棚位置RFID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedLocation}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="棚のRFIDをスキャンしてください"
              />
              <button
                onClick={() => {
                  const locations = ['A-1-1', 'B-2-3', 'C-4-2', 'D-1-5'];
                  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
                  setScannedLocation(randomLocation);
                  setNotification({ type: 'success', message: `棚位置: ${randomLocation}` });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
              >
                <ScanLine className="w-5 h-5" />
                スキャン
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">数量</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleStockIn}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            棚入れ登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockInView; 