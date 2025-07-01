import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '残材管理システム',
  description: '建設現場の残材管理のためのシステム',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%232563eb"/><path d="M8 8h16v4H8zm0 6h12v4H8zm0 6h16v4H8z" fill="white"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
} 