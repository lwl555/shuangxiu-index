import type { ReactNode } from 'react'

export function Tag({
  children,
  color = '#3f434b',
  bg = '#ffffff',
  bd = '#e4e4e7',
  title,
}: {
  children: ReactNode
  color?: string
  bg?: string
  bd?: string
  title?: string
}) {
  return (
    <span className="tag" style={{ color, background: bg, borderColor: bd }} title={title}>
      {children}
    </span>
  )
}
