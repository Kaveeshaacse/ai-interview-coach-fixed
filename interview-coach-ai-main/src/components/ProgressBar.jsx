export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  color = 'purple',
  size = 'md',
  className = '',
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    purple: 'from-purple-600 to-blue-500',
    green: 'from-emerald-500 to-green-400',
    blue: 'from-blue-500 to-cyan-400',
    yellow: 'from-yellow-500 to-orange-400',
    red: 'from-red-500 to-pink-400',
    cyan: 'from-cyan-500 to-blue-400',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-300">{label}</span>}
          {showPercent && <span className="text-xs font-semibold text-purple-300">{pct}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-[#1a1a3e] rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
