import type { ReactNode } from 'react'
import Icon from './Icon'

export default function PageHeader({
  kicker,
  title,
  desc,
  icon,
}: {
  kicker: string
  title: string
  desc: React.ReactNode
  icon?: string
}) {
  return (
    <div className="rounded-[2rem] border border-rose-100 bg-hero p-6 sm:p-8">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-rose-600 shadow-sm">
            <Icon name={icon as any} className="h-5 w-5" />
          </span>
        )}
        <div>
          <div className="kicker text-rose-600">{kicker}</div>
          <h1 className="mt-2 text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
          <p className="mt-2 max-w-[760px] text-[14px] leading-relaxed text-ink-2">{desc}</p>
        </div>
      </div>
    </div>
  )
}
