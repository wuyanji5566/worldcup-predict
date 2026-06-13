import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, type ChartOptions, type ChartData } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp } from 'lucide-react'
import type { PointsHistory } from '@/data/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

interface PointsChartProps {
  data: PointsHistory[]
}

export function PointsChart({ data }: PointsChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: '积分',
        data: data.map((d) => d.points),
        borderColor: '#06b6d4',
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return 'rgba(6,182,212,0)'
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.chartArea.bottom)
          gradient.addColorStop(0, 'rgba(6,182,212,0.25)')
          gradient.addColorStop(1, 'rgba(6,182,212,0.01)')
          return gradient
        },
        borderWidth: 2.5,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0e0e15',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a28',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 10,
        displayColors: false,
        titleFont: { family: 'system-ui', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'JetBrains Mono, monospace', size: 18, weight: 'bold' as const },
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} 分`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'system-ui' },
          padding: 8,
        },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: 'JetBrains Mono, monospace' },
          padding: 8,
          stepSize: 10,
        },
        border: { display: false },
        beginAtZero: false,
        min: 0,
        max: 50,
      },
    },
  }

  const total = data.reduce((s, d) => s + d.points, 0)
  const latest = data[data.length - 1]?.points ?? 0

  return (
    <div className="bg-surface-2 border border-border-default rounded-2xl p-5 md:p-6 card-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">我的积分趋势</h3>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">近 7 场预测</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gold font-mono tabular-nums">{latest}</div>
          <div className="text-[10px] text-text-tertiary">当前积分</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 md:h-48 -mx-2">
        <Line data={chartData} options={options} />
      </div>

      {/* Summary micro-row */}
      <div className="mt-3 flex items-center justify-around pt-3 border-t border-border-default">
        <div className="text-center">
          <div className="text-xs text-text-tertiary">累计获得</div>
          <div className="text-sm font-bold text-text-primary font-mono">{total} 分</div>
        </div>
        <div className="w-px h-8 bg-border-default" />
        <div className="text-center">
          <div className="text-xs text-text-tertiary">预测场次</div>
          <div className="text-sm font-bold text-text-primary font-mono">{data.length} 场</div>
        </div>
        <div className="w-px h-8 bg-border-default" />
        <div className="text-center">
          <div className="text-xs text-text-tertiary">场均得分</div>
          <div className="text-sm font-bold text-text-primary font-mono">
            {(total / data.length).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
