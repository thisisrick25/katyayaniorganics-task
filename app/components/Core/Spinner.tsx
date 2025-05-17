import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  return (
    <div className="flex justify-center items-center my-4">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 dark:border-blue-400 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Spinner;