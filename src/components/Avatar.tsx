export function Avatar({ name, color = '#cfe5ff', size = 46 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .replace(/Dra?\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span className="avatar" style={{ background: color, width: size, height: size }} aria-hidden="true">
      {initials}
    </span>
  )
}
