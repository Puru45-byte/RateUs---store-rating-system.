import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delta: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  delta,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary'
}) => {
  return (
    <div className="bg-surface p-6 rounded-card shadow-soft flex items-start justify-between select-none">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="text-3xl font-extrabold text-heading tracking-tight mt-1">
          {value}
        </span>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
            {delta}
          </span>
        </div>
      </div>
      <div className={`p-3.5 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
