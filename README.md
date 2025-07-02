# 残材管理システム 

建設現場の残材を効率的に管理するためのシステムです。

## 技術スタック

- TypeScript 5.x
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Lucide React (アイコン)

## 主な機能

- 材料の棚入れ・ピッキング管理
- 在庫トラッキング
- 残材検索
- 作業履歴管理
- ラベル発行

## 開発環境のセットアップ

```bash
# パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

## プロジェクト構造

```
/app
  /components       # コンポーネント
    /views          # ビューコンポーネント
  /lib              # ユーティリティ、ヘルパー関数
  /types            # TypeScript型定義
  layout.tsx        # ルートレイアウト
  page.tsx          # ホームページ
/public             # 静的ファイル
```

## 特徴

- React 18の機能 (Suspense, Server Components) の活用
- TypeScriptによる型安全性の確保
- レスポンシブデザイン対応
- エラーハンドリングとローディング状態の実装 
