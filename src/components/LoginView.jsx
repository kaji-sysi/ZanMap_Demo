import React, { useState } from 'react';
import { Package } from 'lucide-react';

const LoginView = ({ onLogin, simulateRFIDScan }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">残材管理システム</h1>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ユーザーID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin または worker"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワード"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onLogin(username, password);
                }
              }}
            />
          </div>
          
          <button
            onClick={() => onLogin(username, password)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            ログイン
          </button>
          
          {simulateRFIDScan && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => simulateRFIDScan()}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ICカードでログイン（シミュレーション）
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView; 