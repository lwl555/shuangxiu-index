import type { Company } from '../types'
import { PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { INDUSTRY_MAP } from '../data/industries'
import { VERDICT_STYLE, verdictOf, isShiftEquivalent } from '../lib/filters'
import { Tag } from './Badge'

export function SourceList({ sources }: { sources: Company['sources'] }) {
  if (!sources.length) return <span className="text-2xs text-ink-3">无公开来源</span>
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {sources.map((s, i) => (
        <a
          key={i}
          href={s.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-2xs text-ink-3 underline decoration-line-2 underline-offset-2 hover:text-ink hover:decoration-ink"
          title={s.title}
        >
          {s.publisher ?? '来源'} · {s.date}
        </a>
      ))}
    </span>
  )
}

export default function CompanyCard({ c }: { c: Company }) {
  const p = PATTERN_MAP[c.restPattern]
  const v = verdictOf(c)
  const vs = VERDICT_STYLE[v]
  const industry = INDUSTRY_MAP[c.industryId]
  const ev = EVIDENCE_META[c.evidence]

  return (
    <article className="card p-4 transition-colors hover:border-line-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-semibold leading-tight tracking-tight">{c.name}</h3>
            {c.brand && <span className="text-2xs text-ink-3">{c.brand}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-3">
            <span>
              {industry?.name ?? c.industryId} · {c.subIndustry}
            </span>
            <span>
              {c.province}
              {c.city !== c.province ? ` ${c.city}` : ''}
            </span>
            <span>{c.ownership}</span>
            <span>生效 {c.since}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Tag color={p.color} bd={p.color + '55'} bg="#fff">
            {p.name}
          </Tag>
          <Tag color={vs.fg} bg={vs.bg} bd={vs.bd}>
            {v}
          </Tag>
          {isShiftEquivalent(c) && (
            <Tag color="#0f766e" bg="#f0fdfa" bd="#99f6e4" title="每周休息不足 2 天，但通过压缩日工时使周均工时≤40 小时，按综合计算工时制等效达标">
              轮休等效
            </Tag>
          )}
        </div>
      </div>

      {/* 核心数值 */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-line border border-line bg-paper-2">
        <div className="px-3 py-2">
          <div className="kicker">周均休息</div>
          <div className="num mt-0.5 text-[17px] font-semibold leading-none">
            {c.weeklyRestDays !== null ? c.weeklyRestDays : '—'}
            <span className="ml-0.5 text-2xs font-normal text-ink-3">天</span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="kicker">周均工时</div>
          <div className="num mt-0.5 text-[17px] font-semibold leading-none">
            {c.weeklyHours !== null ? c.weeklyHours : '—'}
            <span className="ml-0.5 text-2xs font-normal text-ink-3">小时</span>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="kicker">覆盖范围</div>
          <div className="mt-1 text-[12px] leading-snug text-ink-2">{c.scope}</div>
        </div>
      </div>

      {/* 产品 */}
      <div className="mt-3">
        <div className="kicker mb-1.5">主要产品</div>
        <div className="flex flex-wrap gap-1">
          {c.products.slice(0, 8).map((x) => (
            <Tag key={x} bg="#fafafa">
              {x}
            </Tag>
          ))}
          {c.products.length > 8 && <Tag bg="#fafafa">+{c.products.length - 8}</Tag>}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {c.productTypes.map((x) => (
            <Tag key={x} color="#1d4ed8" bg="#eff6ff" bd="#bfdbfe">
              {x}
            </Tag>
          ))}
        </div>
      </div>

      {/* 制度 */}
      <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{c.policy}</p>
      {c.note && (
        <p className="mt-2 border-l-2 border-line-2 pl-2.5 text-[12px] leading-relaxed text-ink-3">{c.note}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
        <Tag color={ev.color} bd={ev.color + '55'} title={ev.desc}>
          {c.evidence} 级证据
        </Tag>
        <SourceList sources={c.sources} />
      </div>
    </article>
  )
}
