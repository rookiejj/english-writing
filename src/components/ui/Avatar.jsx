import clsx from 'clsx'

const COLORS = [
  'bg-blue-400', 'bg-emerald-400', 'bg-violet-400',
  'bg-rose-400', 'bg-amber-400', 'bg-cyan-400',
]

function colorFor(str) {
  let n = 0
  for (let i = 0; i < str.length; i++) n += str.charCodeAt(i)
  return COLORS[n % COLORS.length]
}

export default function Avatar({ nickname, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={clsx('rounded-full flex items-center justify-center text-white font-semibold shrink-0', colorFor(nickname), sizeClass)}>
      {nickname?.[0]?.toUpperCase()}
    </div>
  )
}
