'use client';

import { useState, useEffect } from 'react';
import MaterialManagementSystem from '@/app/components/MaterialManagementSystem';

export default function Home() {
  // Next.js App Routerでは、クライアント側のレンダリングを明示的に指定する必要があります
  const [isMounted, setIsMounted] = useState(false);

  // ハイドレーションエラーを防止するためのuseEffect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // サーバーサイドレンダリング時はなにも表示しない
  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <MaterialManagementSystem />
    </main>
  );
} 
