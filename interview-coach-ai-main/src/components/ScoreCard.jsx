import CircularProgress from './CircularProgress';

const colorMap = {
  purple: '#7c3aed',
  blue: '#3b82f6',
  green: '#10b981',
  cyan: '#06b6d4',
  yellow: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  orange: '#f97316',
};

export default function ScoreCard({
  title,
  score = 0,
  max = 100,
  icon: Icon,
  color = 'purple',
  description,
  size = 100,
  className = '',
}) {
  const c = colorMap[color] || color;

  return (
    <div className={`glass-card p-5 flex flex-col items-center gap-3 text-center ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c}20` }}>
          <Icon className="w-5 h-5" style={{ color: c }} />
        </div>
      )}
      <CircularProgress value={score} max={max} size={size} color={c} />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
