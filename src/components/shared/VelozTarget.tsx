export function VelozTarget({
  size = 'default',
  variant = 'simple',
}: {
  size?: 'small' | 'default' | 'large';
  variant?: 'simple' | 'circle' | 'complex';
}) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const renderTarget = () => {
    switch (variant) {
      case 'simple':
        return (
          <svg
            viewBox="0 0 37 38"
            className={`${sizeClasses[size]} text-[--primary]`}
            fill="currentColor"
          >
            <path fillRule="evenodd" d="m18.5 0.8v36.7" />
            <path fillRule="evenodd" d="m0.1 19.2h36.8" />
          </svg>
        );
      case 'circle':
        return (
          <svg
            viewBox="0 0 65 64"
            className={`${sizeClasses[size]} text-[--primary]`}
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="m64.4 32.8h-15.9c-0.4 8.2-7 14.9-15.2 15.3v15.9h-1.6v-15.9c-8.2-0.4-14.9-7.1-15.3-15.3h-15.9v-1.6h15.9c0.4-8.2 7.1-14.8 15.3-15.2v-15.9h1.6v15.9c8.2 0.4 14.8 7 15.2 15.2h15.9zm-46.6 0c0.4 7.5 6.4 13.6 13.9 14v-11.3c-1.3-0.3-2.3-1.4-2.7-2.7h-11.2zm13.9-15.5c-7.5 0.4-13.5 6.4-14 13.9h11.3c0.3-1.3 1.4-2.3 2.7-2.6v-11.3zm15.5 13.9c-0.4-7.5-6.4-13.5-13.9-13.9v11.3c1.3 0.3 2.3 1.3 2.6 2.6zm-13.9 15.6c7.5-0.4 13.5-6.5 13.9-14h-11.3c-0.3 1.3-1.3 2.4-2.6 2.7v11.3z"
            />
          </svg>
        );
      case 'complex':
        return (
          <svg
            viewBox="0 0 66 65"
            className={`${sizeClasses[size]} text-[--primary]`}
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="m65.1 32.2c0 10.6-9.1 19.6-21.7 22.9-2.8 6-6.5 9.3-10.6 9.3-4 0-7.7-3.3-10.5-9.3-12.6-3.3-21.7-12.3-21.7-22.9 0-10.6 9.1-19.6 21.7-22.9 2.8-6.1 6.5-9.4 10.5-9.4 4.1 0 7.8 3.3 10.6 9.4 12.6 3.3 21.7 12.3 21.7 22.9zm-23.6 23.3q-3.8 0.8-7.9 0.9v6.5c2.9-0.4 5.7-3 7.9-7.4zm-17.3 0c2.2 4.4 5 7 7.9 7.4v-6.5q-4.1-0.1-7.9-0.9zm-2.7-2.2c-2.3-5.6-3.5-12.8-3.6-20.4h-15.8c0.4 9.3 8.3 17.2 19.4 20.4zm-19.4-21.9h15.8c0.1-7.6 1.3-14.7 3.6-20.4-11.1 3.3-19 11.2-19.4 20.4zm22.1-22.6q3.8-0.8 7.9-0.9v-6.4c-2.9 0.4-5.7 2.9-7.9 7.3zm9.4-7.3v6.4q4.1 0.1 7.9 0.9c-2.2-4.4-5-6.9-7.9-7.3zm12.7 29.9c-0.1-7.9-1.5-15.2-4-20.9-2.7-0.6-5.7-1-8.7-1.1v17.8c0 2.3 1.9 4.2 4.2 4.2zm-23-20.9c-2.4 5.7-3.8 13-3.9 20.9h8.5c2.3 0 4.2-1.9 4.2-4.2v-17.8c-3.1 0.1-6 0.5-8.8 1.1zm8.8 44.4v-17.8c0-2.3-1.9-4.2-4.2-4.2h-8.5c0.1 7.9 1.5 15.3 3.9 20.9 2.8 0.7 5.7 1.1 8.8 1.1zm10.2-1.1c2.5-5.6 3.9-13 4-20.9h-8.5c-2.3 0-4.2 1.9-4.2 4.2v17.8c3 0 6-0.4 8.7-1.1zm1.9-42.8c2.2 5.7 3.5 12.8 3.6 20.4h15.8c-0.5-9.2-8.4-17.1-19.4-20.4zm19.4 21.9h-15.8c-0.1 7.6-1.4 14.8-3.6 20.4 11-3.2 18.9-11.1 19.4-20.4z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center">{renderTarget()}</div>
  );
}
