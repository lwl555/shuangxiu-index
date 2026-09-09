import type { Company } from '../types'
import { PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { INDUSTRY_MAP } from '../data/industries'
import { VERDICT_STYLE, verdictOf, isShiftEquivalent } from '../lib/filters'
import { mergeProfile } from '../data/profiles'
import { Tag } from './Badge'
import Icon from './Icon'

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
          className="text-2xs text-ink-3 underline decoration-rose-200 underline-offset-2 hover:text-rose-600 hover:decoration-rose-400"
          title={s.title}
        >
          {s.publisher ?? '来源'} · {s.date}
        </a>
      ))}
    </span>
  )
}

export default function CompanyCard({ c, onOpen }: { c: Company; onOpen?: () => void }) {
  const fc = mergeProfile(c)
  const p = PATTERN_MAP[fc.restPattern]
  const v = verdictOf(fc)
  const vs = VERDICT_STYLE[v]
  const industry = INDUSTRY_MAP[fc.industryId]
  const ev = EVIDENCE_META[fc.evidence]

  return (
    <article className="card relative flex flex-col overflow-hidden p-5">
      <div className="absolute left-0 top-0 h-1 w-full" style={{ background: p.color }} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className="text-[16px] font-bold leading-tight tracking-tight text-ink">{fc.name}</h3>
            {fc.brand && <span className="text-2xs font-medium text-ink-3">{fc.brand}</span>}
          </div>
          {fc.slogan && (
            <p className="mt-1 text-[12.5px] font-semibold leading-snug text-rose-600">{fc.slogan}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-3">
            <span className="font-medium text-ink-2">
              {industry?.name ?? fc.industryId} · {fc.subIndustry}
            </span>
            <span>
              {fc.province}
              {fc.city !== fc.province ? ` ${fc.city}` : ''}
            </span>
            <span>{fc.ownership}</span>
            <span>生效 {fc.since}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <Tag color={p.color} bd={p.color + '35'} bg={p.color + '10'}>
            {p.name}
          </Tag>
          <Tag color={vs.fg} bg={vs.bg} bd={vs.bd}>
            {v}
          </Tag>
          {isShiftEquivalent(fc) && (
            <Tag color="#0f766e" bg="#f0fdfa" bd="#99f6e4" title="每周休息不足 2 天，但通过压缩日工时使周均工时≤40 小时，按综合计算工时制等效达标">
              轮休等效
            </Tag>
          )}
        </div>
      </div>

      {/* 亮点标签 */}
      {fc.tags && fc.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {fc.tags.map((t) => (
            <Tag key={t} color="#475569" bd="#e2e8f0" bg="#f8fafc">
              {t}
            </Tag>
          ))}
        </div>
      )}

      {/* 核心数值 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line bg-paper-2 px-3 py-2.5">
          <div className="kicker">周均休息</div>
          <div className="num mt-1 text-[18px] font-bold leading-none text-ink">
            {fc.weeklyRestDays !== null ? fc.weeklyRestDays : '—'}
            <span className="ml-0.5 text-2xs font-medium text-ink-3">天</span>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-paper-2 px-3 py-2.5">
          <div className="kicker">周均工时</div>
          <div className="num mt-1 text-[18px] font-bold leading-none text-ink">
            {fc.weeklyHours !== null ? fc.weeklyHours : '—'}
            <span className="ml-0.5 text-2xs font-medium text-ink-3">小时</span>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-paper-2 px-3 py-2.5">
          <div className="kicker">基地 / 网点</div>
          <div className="num mt-1 text-[18px] font-bold leading-none text-ink">
            {fc.factories?.length ?? 0}
            <span className="ml-0.5 text-2xs font-medium text-ink-3">个</span>
          </div>
        </div>
      </div>

      {/* 产品 */}
      <div className="mt-4">
        <div className="kicker mb-1.5">主要产品</div>
        <div className="flex flex-wrap gap-1.5">
          {fc.products.slice(0, 8).map((x) => (
            <Tag key={x} bg="#fafafa" color="#4b5563" bd="#e5e7eb">
              {x}
            </Tag>
          ))}
          {fc.products.length > 8 && <Tag bg="#fafafa" color="#4b5563" bd="#e5e7eb">+{fc.products.length - 8}</Tag>}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fc.productTypes.map((x) => (
            <Tag key={x} color="#2563eb" bg="#eff6ff" bd="#bfdbfe">
              {x}
            </Tag>
          ))}
        </div>
      </div>

      {/* 制度 */}
      <p className="mt-4 max-h-[4.5rem] overflow-hidden text-[13px] leading-relaxed text-ink-2">{fc.policy}</p>
      {fc.note && (
        <p className="mt-2 rounded-r-lg border-l-2 border-rose-300 bg-rose-50/50 pl-3 text-[12px] leading-relaxed text-ink-3">
          {fc.note}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <Tag color={ev.color} bd={ev.color + '35'} bg={ev.color + '10'} title={ev.desc}>
          {fc.evidence} 级证据
        </Tag>
        <button
          onClick={onOpen}
          className="inline-flex items-center text-2xs font-semibold text-rose-600 no-underline hover:text-rose-700"
        >
          查看详情
          <Icon name="arrowRight" className="ml-0.5 h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}
