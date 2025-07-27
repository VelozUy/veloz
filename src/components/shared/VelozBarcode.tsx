export function VelozBarcode({
  size = 'default',
}: {
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'w-16 h-8',
    default: 'w-20 h-10',
    large: 'w-24 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 77 37"
        className={`${sizeClasses[size]} text-[--primary]`}
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="m44.3 36.1v-35.9h12.5v35.9zm-18.5 0v-35.9h12.4v35.9zm40.3 0v-35.9h1.3v35.9zm-3.3 0v-35.9h1.3v35.9zm-4.1 0v-35.9h2.2v35.9zm-18.5 0v-35.9h2.1v35.9zm-18.5 0v-35.9h2.2v35.9zm-3.6 0v-35.9h1.2v35.9zm-17.4 0v-35.9h2.2v35.9zm12.7 0v-35.9h2.2v35.9zm55.8 0v-35.9h6.7v35.9zm-64.5 0v-35.9h6.8v35.9z"
        />
      </svg>
    </div>
  );
}
