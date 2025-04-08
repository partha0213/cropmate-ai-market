
import React from 'react';
import { BadgeCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AIBadge: React.FC<AIBadgeProps> = ({ 
  score, 
  size = 'md',
  className
}) => {
  // Determine grade and color based on score
  let grade: string;
  let colorClass: string;
  
  if (score >= 90) {
    grade = 'Premium';
    colorClass = 'from-emerald-500 to-green-600';
  } else if (score >= 75) {
    grade = 'Quality';
    colorClass = 'from-green-500 to-teal-600';
  } else if (score >= 60) {
    grade = 'Standard';
    colorClass = 'from-yellow-400 to-orange-500';
  } else {
    grade = 'Basic';
    colorClass = 'from-orange-400 to-red-500';
  }
  
  // Size classes
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 space-x-1',
    md: 'text-xs px-2 py-1 space-x-1.5',
    lg: 'text-sm px-3 py-1.5 space-x-2'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div 
      className={cn(
        `flex items-center rounded-full bg-gradient-to-r ${colorClass} text-white font-medium`,
        sizeClasses[size],
        className
      )}
    >
      {score >= 75 ? (
        <BadgeCheck className={iconSizes[size]} />
      ) : (
        <Star className={iconSizes[size]} />
      )}
      <span>{grade}</span>
    </div>
  );
};

export default AIBadge;
