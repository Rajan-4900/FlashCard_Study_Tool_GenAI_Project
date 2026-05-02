export default function Spinner({ size = 16, className = '' }) {
  const px = typeof size === 'number' ? `${size}px` : size
  return (
    <span
      className={[
        'inline-block animate-spin rounded-full border-2 border-white/40 border-t-white',
        className,
      ].join(' ')}
      style={{ width: px, height: px }}
      aria-hidden="true"
    />
  )
}

