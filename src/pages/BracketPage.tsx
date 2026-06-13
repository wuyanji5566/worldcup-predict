import { BracketView } from '@/components/bracket/BracketView'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMatchStore } from '@/store/matchStore'

export function BracketPage() {
  const matches = useMatchStore((s) => s.matches)

  if (Object.keys(matches).length === 0) {
    return <EmptyState icon="🏟️" title="暂无淘汰赛数据" description="比赛开始后会显示对阵图" />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text">🏟️ 淘汰赛对阵</h1>
      <BracketView />
    </div>
  )
}
