"use client";

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'rectangular' | 'circular';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  lines = 1, 
  variant = 'text' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return 'w-10 h-10';
      case 'rectangular':
        return 'w-full h-32';
      case 'text':
      default:
        return 'h-4 w-full';
    }
  };

  return (
    <div className="animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-300 ${getVariantClasses()} ${
            className || getDefaultSize()
          } ${index > 0 ? 'mt-2' : ''}`}
        ></div>
      ))}
    </div>
  );
};

export default Skeleton;
