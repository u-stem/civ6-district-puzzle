import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Civ6 District Puzzle',
  description: 'Civilization VI の区域配置と隣接ボーナスをシミュレートするツール',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
