import { useEffect, useState } from 'react'

const COLORS = ['#f59e0b', '#06b6d4', '#22c55e', '#ef4444', '#a855f7', '#f97316', '#ec4899']
const PARTICLE_COUNT = 60

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  delay: number
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const p: Particle[] = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -5 - Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
    }))
    setParticles(p)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
