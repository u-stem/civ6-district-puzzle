# civ6-district-puzzle

Civilization VI の「区域(District)配置パズル」をシミュレートするツール。都市周辺のヘックスに区域・地形・地形改善を配置し、隣接ボーナスをリアルタイム計算する。最適配置の自動探索ソルバーと、ペイント感覚の地形/区域エディタを備える。

対応ルールセットは **Rise & Fall(文明の興亡)まで**。

## スタック

- Next.js (App Router) + TypeScript strict — バックエンド不要のクライアント完結
- 状態管理: Zustand + zundo(Undo/Redo)
- 描画: SVG
- テスト: Vitest / 整形・Lint: Biome
- パッケージ管理: bun

## 開発

```sh
bun install
bun run dev        # 開発サーバ
bun run test       # Vitest
bun run typecheck  # tsc --noEmit
bun run lint       # Biome check
bun run format     # Biome format --write
```

## アーキテクチャ

純粋ドメイン層 `src/domain/` を React・DOM から完全分離する。これが TDD・ソルバーの Worker 化・将来のシリアライズの土台。

```
src/domain/
  coords/  ヘックス座標(axial 保存 / cube 計算)・近傍・辺(川/海岸)
  model/   地形・区域・イールド・タイル・マップの型
  parse/   検証コンストラクタと型ガード(Parse-don't-validate)
  rules/   隣接ボーナスのデータ駆動ルールと計算
  solver/  最適配置の探索(分枝限定 / ビームサーチ)
```

### 設計上の規約

- 隣接ボーナスは分数(major=+1, minor=+0.5)を合算してから最後に `Math.floor`。途中で丸めない。
- 川・海岸は「タイル属性」ではなく辺(edge)集合として持つ。
- `as` 型断言は使わず、`parse/guards.ts` の型ガード関数を経由する。
