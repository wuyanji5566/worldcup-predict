import { STAGE_MULTIPLIERS, STAGE_LABELS, EXACT_SCORE_POINTS, CORRECT_OUTCOME_POINTS, JOKERS_PER_USER } from '@/utils/constants'
import type { MatchStage } from '@/types/match'

const STAGES: MatchStage[] = ['group', 'round32', 'round16', 'quarter', 'semi', 'third', 'final']

export function RulesPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-text">📖 计分规则</h1>

      {/* 基础分 */}
      <section className="bg-bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-semibold text-text mb-3">🎯 基础得分</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>精确预测比分（如预测 2:1，实际 2:1）</span>
            <span className="font-bold text-accent">+{EXACT_SCORE_POINTS} 分</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>预测正确胜负/平局（如预测 2:1 主胜，实际 3:1 主胜）</span>
            <span className="font-bold text-accent">+{CORRECT_OUTCOME_POINTS} 分</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>预测完全错误</span>
            <span className="font-bold text-text-muted">0 分</span>
          </div>
        </div>
      </section>

      {/* 阶段倍率 */}
      <section className="bg-bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-semibold text-text mb-3">📈 阶段倍率</h2>
        <p className="text-sm text-text-muted mb-3">
          越到赛事后期，预测得分越高！总分 = 基础分 × 阶段倍率
        </p>
        <div className="space-y-1.5">
          {STAGES.map((stage) => (
            <div key={stage} className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg text-sm">
              <span>{STAGE_LABELS[stage]}</span>
              <span className="font-bold text-accent">×{STAGE_MULTIPLIERS[stage]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Joker */}
      <section className="bg-bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-semibold text-text mb-3">🔥 Joker 加倍卡</h2>
        <div className="text-sm space-y-2">
          <p className="text-text-muted">
            每位玩家拥有 <span className="text-accent font-bold">{JOKERS_PER_USER}</span> 张 Joker：
          </p>
          <ul className="list-disc list-inside text-text-muted space-y-1 ml-2">
            <li>小组赛阶段 1 张</li>
            <li>淘汰赛阶段 1 张</li>
          </ul>
          <p className="text-text-muted">
            使用 Joker 后，该场比赛得分 <span className="text-accent font-bold">翻倍</span>。
            在提交预测时勾选即可，一旦使用不可撤回。
          </p>
        </div>
      </section>

      {/* 附加分 */}
      <section className="bg-bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-semibold text-text mb-3">⭐ 附加分</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>🎯 小组赛全对（6 场全部正确胜负或精确比分）</span>
            <span className="font-bold text-accent">+5 分</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>🏆 淘汰赛阶段全对</span>
            <span className="font-bold text-accent">+10 分</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-bg-card-hover rounded-lg">
            <span>👑 正确预测冠军队伍</span>
            <span className="font-bold text-accent">+15 分</span>
          </div>
        </div>
      </section>

      {/* 重要说明 */}
      <section className="bg-bg-card border border-border rounded-2xl p-5">
        <h2 className="text-base font-semibold text-text mb-3">⚠️ 重要说明</h2>
        <ul className="list-disc list-inside text-sm text-text-muted space-y-2 ml-2">
          <li>预测在比赛开球时间锁定，锁定后不可修改</li>
          <li>淘汰赛点球决胜：预测分数以加时赛结束后的比分为准（不含点球）</li>
          <li>延期比赛：预测保持锁定，比赛实际进行后结算</li>
          <li>弃权比赛：以官方公布最终比分为准</li>
        </ul>
      </section>
    </div>
  )
}
