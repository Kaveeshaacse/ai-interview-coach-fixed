export default function Card({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <div
      className={`glass-card p-6 ${hover ? '' : '!transform-none !shadow-none hover:!border-[#2a2a5a]'}
        ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, icon: Icon, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-white flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>;
}
