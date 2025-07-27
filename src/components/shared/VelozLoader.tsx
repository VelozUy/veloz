export function VelozLoader({
  orientation = 'horizontal',
  size = 'default',
}: {
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'w-16 h-8',
    default: 'w-24 h-12',
    large: 'w-32 h-16',
  };

  const animationClasses = {
    horizontal: 'animate-pulse',
    vertical: 'animate-bounce',
  };

  return (
    <div
      className={`flex items-center justify-center ${animationClasses[orientation]}`}
    >
      <svg
        viewBox="0 0 65 34"
        className={`${sizeClasses[size]} text-[--primary]`}
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="m64.9 17.2c0 9-7.4 16.4-16.4 16.4-2.8 0-5.5-0.7-8-2.1-2.4 1.4-5.1 2.1-7.9 2.1-2.8 0-5.5-0.7-7.9-2.1-2.4 1.3-5.1 2.1-7.9 2.1-9.1 0-16.4-7.4-16.4-16.4 0-9.1 7.3-16.4 16.4-16.4 2.8 0 5.5 0.7 7.9 2 2.4-1.3 5.1-2 7.9-2 2.8 0 5.5 0.7 7.9 2 2.5-1.3 5.2-2 8-2 9 0 16.4 7.3 16.4 16.4zm-48.1 15.3c8.4 0 15.3-6.9 15.3-15.3 0-8.5-6.9-15.3-15.3-15.3-8.5 0-15.3 6.8-15.3 15.3 0 8.4 6.8 15.3 15.3 15.3zm15.8 0c2.7 0 5.4-0.7 7.7-2.1 4.7-2.7 7.6-7.8 7.6-13.2 0-5.5-2.9-10.5-7.6-13.3-2.3-1.3-5-2-7.7-2-2.4 0-4.7 0.5-6.8 1.6 4.4 2.9 7.4 8 7.4 13.7 0 5.7-3 10.7-7.4 13.7 2.1 1 4.4 1.6 6.8 1.6zm31.1-15.3c0-8.5-6.8-15.3-15.2-15.3-2.4 0-4.7 0.5-6.8 1.6 4.5 3 7.3 8.2 7.3 13.7 0 5.5-2.8 10.6-7.3 13.7 2.1 1 4.4 1.6 6.8 1.6 8.4 0 15.2-6.9 15.2-15.3z"
        />
      </svg>
    </div>
  );
}
