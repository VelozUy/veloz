export function VelozCheckboard({
  size = 'default',
}: {
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'w-20 h-6',
    default: 'w-24 h-8',
    large: 'w-32 h-10',
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 98 22"
        className={`${sizeClasses[size]} text-[--primary]`}
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="m88.5 7.5l-2.4 7.1h7l-2.3 6.9h-7.1l2.4-6.9h-6.9l-2.4 6.9h-7l2.3-6.9h-6.9l-2.4 6.9h-7l2.3-6.9h-6.9l-2.3 6.9h-7l2.2-6.9h-6.9l-2.3 6.9h-7l2.3-6.9h-7l-2.3 6.9h-7l2.3-6.9h-7l-2.2 6.9h-7l2.2-6.9h7l2.2-7.1h-7l2.2-7h7.1l-2.3 7h7l2.3-7h7l-2.2 7h6.9l2.3-7h7.1l-2.3 7h6.9l2.4-7h7l-2.3 7h7l2.3-7h7l-2.3 7h7l2.3-7h7.1l-2.4 7h7l2.4-7h7l-2.4 7zm-63.1 0h-6.9l-2.3 7.1h7zm14 0h-7l-2.3 7h7zm14 0h-7l-2.3 7h7zm14 0h-7l-2.3 7h6.9z"
        />
      </svg>
    </div>
  );
}
