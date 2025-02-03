import React from 'react';

interface CircularContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CircularContainer({ children, className = '' }: CircularContainerProps) {
  return (
    <div className={`relative w-48 h-48 ${className}`}>
      <div className="absolute inset-0 rounded-full overflow-hidden ring-2 ring-gray-200">
        {children}
      </div>
    </div>
  );
}