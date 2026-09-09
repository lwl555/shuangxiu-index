import { useEffect, type ReactNode } from 'react'
import type { Company } from '../types'
import { PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { INDUSTRY_MAP } from '../data/industries'
import { VERDICT_STYLE, verdictOf, isShiftEquivalent } from '../lib/filters'
import { mergeProfile } from '../data/profiles'
import { Tag } from './Badge'
import { SourceList } from './CompanyCard'

export default function CompanyDetail({ c, onClose }: { c: Company; onClose: () => void }) {
  const fc = mergeProfile(c)
  const p = PATTERN_MAP[fc.restPattern]
  const v = verdictOf(fc)
  const vs = VERDICT_STYLE[v]
  const industry = INDUSTRY_MAP[fc.industryId]
  const ev = EVIDENCE_META[fc.evidence]
  const shift = isShiftEquivalent(fc)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const Field = ({ label, value }: { label: string; value?: ReactNode }) =>
    value ? (
      <div className="border-b border-line py-2.5">
        <div className="kicker">{label}</div>
        <div className="mt-1 text-[13px] leading-relaxed text-ink">{value}</div>
      </div>
    ) : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="scroll-thin relative h-full w-full max-w-[560px] overflow-y-auto bg-paper shadow-xl">
        {/* 头部 */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-paper px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="text-[19px] font-semibold tracking-tight">{fc.name}</h2>
              {fc.brand && <span className="text-2xs text-ink-3">{fc.brand}</span>}
            </div>
            {fc.slogan && <p className="mt-1 text-[13px] font-medium leading-snug text-ink-2">{fc.slogan}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 border border-line-2 px-2 py-1 text-[12px] text-ink-3 transition-colors hover:border-ink hover:text-ink"
            aria-label="关闭"
          >
            关闭 ✕
          </button>
        </div>

        <div className="px-5 py-4">
          {/* 状态标签 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag color={p.color} bd={p.color + '55'} bg="#fff">
              {p.name}
            </Tag>
            <Tag color={vs.fg} bg={vs.bg} bd={vs.bd}>
              {v}
            </Tag>
            {shift && (
              <Tag color="#0f766e" bg="#f0fdfa" bd="#99f6e4" title="每周休息不足 2 天，但通过压缩日工时使周均工时≤40 小时，按综合计算工时制等效达标">
                轮休等效
              </Tag>
            )}
            <Tag color={ev.color} bd={ev.color + '55'}>
              {fc.evidence} 级证据
            </Tag>
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

          {/* 档案 */}
          <div className="mt-4">
            <h3 className="h-sec mb-1">企业档案</h3>
            <Field label="成立年份" value={fc.founded} />
            <Field label="总部 / 注册地" value={fc.hq} />
            <Field
              label="规模"
              value={fc.scale}
            />
            <Field
              label="官方网站"
              value={
                fc.website ? (
                  <a href={fc.website} target="_blank" rel="noreferrer noopener" className="text-[13px]">
                    {fc.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : undefined
              }
            />
            <Field
              label="行业"
              value={`${industry?.name ?? fc.industryId} · ${fc.subIndustry}`}
            />
            <Field label="地区" value={`${fc.province}${fc.city !== fc.province ? ` ${fc.city}` : ''}`} />
            <Field label="企业性质" value={fc.ownership} />
            <Field label="制度生效" value={fc.since !== '—' ? fc.since : undefined} />
            <Field label="覆盖范围" value={fc.scope} />
          </div>

          {/* 工厂 / 基地 */}
          {fc.factories && fc.factories.length > 0 && (
            <div className="mt-5">
              <h3 className="h-sec mb-2">工厂 / 生产基地 / 网点（{fc.factories.length}）</h3>
              <ul className="space-y-px border border-line bg-line">
                {fc.factories.map((f, i) => (
                  <li key={i} className="bg-paper px-3 py-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink">{f.name}</span>
                      <span className="text-2xs text-ink-3">{f.city}</span>
                    </div>
                    {f.note && <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{f.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 产品 */}
          <div className="mt-5">
            <h3 className="h-sec mb-2">主要产品与类型</h3>
            <div className="flex flex-wrap gap-1">
              {fc.products.map((x) => (
                <Tag key={x} bg="#fafafa">
                  {x}
                </Tag>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {fc.productTypes.map((x) => (
                <Tag key={x} color="#1d4ed8" bg="#eff6ff" bd="#bfdbfe">
                  {x}
                </Tag>
              ))}
            </div>
          </div>

          {/* 制度要点 */}
          <div className="mt-5">
            <h3 className="h-sec mb-2">双休 / 工时制度要点</h3>
            <p className="text-[13.5px] leading-[1.85] text-ink-2">{fc.policy}</p>
            {fc.note && (
              <p className="mt-2 border-l-2 border-line-2 pl-3 text-[12.5px] leading-relaxed text-ink-3">{fc.note}</p>
            )}
            {fc.detail && (
              <p className="mt-3 border-t border-line pt-3 text-[13px] leading-[1.85] text-ink-2">{fc.detail}</p>
            )}
          </div>

          {/* 核心数据 */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-line border border-line bg-paper-2">
            <div className="px-3 py-2.5">
              <div className="kicker">周均休息</div>
              <div className="num mt-0.5 text-[18px] font-semibold leading-none">
                {fc.weeklyRestDays !== null ? fc.weeklyRestDays : '—'}
                <span className="ml-0.5 text-2xs font-normal text-ink-3">天</span>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <div className="kicker">周均工时</div>
              <div className="num mt-0.5 text-[18px] font-semibold leading-none">
                {fc.weeklyHours !== null ? fc.weeklyHours : '—'}
                <span className="ml-0.5 text-2xs font-normal text-ink-3">小时</span>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <div className="kicker">证据等级</div>
              <div className="mt-1 text-[13px] font-semibold" style={{ color: ev.color }}>
                {ev.label}
              </div>
            </div>
          </div>

          {/* 来源 */}
          <div className="mt-5">
            <h3 className="h-sec mb-2">信息来源</h3>
            <div className="border border-line bg-paper-2 px-3 py-2.5">
              <SourceList sources={fc.sources} />
            </div>
          </div>

          <p className="mt-4 border-t border-line pt-3 text-2xs leading-relaxed text-ink-3">
            本站为公开信息整理工具，不构成对企业的评价或推荐。企业制度可能随时调整，且同一企业不同岗位、不同地区差异很大，
            求职或消费决策前请以企业官方说明为准。
          </p>
        </div>
      </aside>
    </div>
  )
}
