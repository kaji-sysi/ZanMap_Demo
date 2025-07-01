'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Package } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => boolean;
  simulateRFIDScan?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, simulateRFIDScan }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('ユーザーIDとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const success = onLogin(username, password);
      if (!success) {
        setErrorMessage('ログインに失敗しました。IDとパスワードを確認してください。');
      }
    } catch (error) {
      setErrorMessage('エラーが発生しました。しばらく経ってからもう一度お試しください。');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">残材管理システム</h1>
        </div>
        
        <div>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              ユーザーID
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin または worker"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワード"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full text-white py-2 px-4 rounded-md transition duration-200 ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
          
          {simulateRFIDScan && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={simulateRFIDScan}
                disabled={isLoading}
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