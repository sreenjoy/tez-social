import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

const colorMap = {
  primary: 'border-primary-500 border-t-transparent',
  secondary: 'border-secondary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
};

export default function Loader({ size = 'md', color = 'primary', className = '' }: LoaderProps) {
  return (
    <div
      className={`animate-spin rounded-full ${sizeMap[size]} ${colorMap[color]} ${className}`}
      aria-label="Loading"
    ></div>
  );
} 