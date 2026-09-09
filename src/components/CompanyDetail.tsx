import { useEffect, type ReactNode } from 'react'
import type { Company } from '../types'
import { PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { INDUSTRY_MAP } from '../data/industries'
import { VERDICT_STYLE, verdictOf, isShiftEquivalent } from '../lib/filters'
import { mergeProfile } from '../data/profiles'
import { Tag } from './Badge'
import Icon from './Icon'
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
      <div className="border-b border-line py-2.5 last:border-b-0">
        <div className="kicker">{label}</div>
        <div className="mt-1 text-[13px] font-medium leading-relaxed text-ink">{value}</div>
      </div>
    ) : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="scroll-thin relative h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
        {/* 头部 */}
        <div className="relative overflow-hidden bg-hero px-6 py-5">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-rose-200/30 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-200/30 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="text-[20px] font-bold tracking-tight text-ink">{fc.name}</h2>
                {fc.brand && <span className="text-2xs font-medium text-ink-3">{fc.brand}</span>}
              </div>
              {fc.slogan && <p className="mt-1 text-[13px] font-semibold leading-snug text-rose-600">{fc.slogan}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-white/80 text-ink-3 transition-all hover:border-rose-200 hover:bg-white hover:text-rose-600"
              aria-label="关闭"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>

          {/* 状态标签 */}
          <div className="relative mt-4 flex flex-wrap items-center gap-1.5">
            <Tag color={p.color} bd={p.color + '35'} bg={p.color + '10'}>
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
            <Tag color={ev.color} bd={ev.color + '35'} bg={ev.color + '10'}>
              {fc.evidence} 级证据
            </Tag>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* 亮点标签 */}
          {fc.tags && fc.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {fc.tags.map((t) => (
                <Tag key={t} color="#475569" bd="#e2e8f0" bg="#f8fafc">
                  {t}
                </Tag>
              ))}
            </div>
          )}

          {/* 核心数据 */}
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-paper-2 p-2">
            <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="kicker">周均休息</div>
              <div className="num mt-1 text-[22px] font-bold text-ink">
                {fc.weeklyRestDays !== null ? fc.weeklyRestDays : '—'}
                <span className="ml-0.5 text-2xs font-medium text-ink-3">天</span>
              </div>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="kicker">周均工时</div>
              <div className="num mt-1 text-[22px] font-bold text-ink">
                {fc.weeklyHours !== null ? fc.weeklyHours : '—'}
                <span className="ml-0.5 text-2xs font-medium text-ink-3">小时</span>
              </div>
            </div>
            <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm">
              <div className="kicker">基地 / 网点</div>
              <div className="num mt-1 text-[22px] font-bold text-ink">
                {fc.factories?.length ?? 0}
                <span className="ml-0.5 text-2xs font-medium text-ink-3">个</span>
              </div>
            </div>
          </div>

          {/* 档案 */}
          <div className="rounded-2xl border border-line bg-paper-2 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="briefcase" className="h-4 w-4 text-rose-600" />
              <h3 className="h-sec">企业档案</h3>
            </div>
            <Field label="成立年份" value={fc.founded} />
            <Field label="总部 / 注册地" value={fc.hq} />
            <Field label="规模" value={fc.scale} />
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
            <Field label="行业" value={`${industry?.name ?? fc.industryId} · ${fc.subIndustry}`} />
            <Field label="地区" value={`${fc.province}${fc.city !== fc.province ? ` ${fc.city}` : ''}`} />
            <Field label="企业性质" value={fc.ownership} />
            <Field label="制度生效" value={fc.since !== '—' ? fc.since : undefined} />
            <Field label="覆盖范围" value={fc.scope} />
          </div>

          {/* 工厂 / 基地 */}
          {fc.factories && fc.factories.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="building" className="h-4 w-4 text-rose-600" />
                <h3 className="h-sec">工厂 / 生产基地 / 网点（{fc.factories.length}）</h3>
              </div>
              <div className="space-y-2">
                {fc.factories.map((f, i) => (
                  <div key={i} className="rounded-xl border border-line bg-paper-2 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink">{f.name}</span>
                      <span className="text-2xs font-medium text-ink-3">{f.city}</span>
                    </div>
                    {f.note && <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{f.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 产品 */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="award" className="h-4 w-4 text-rose-600" />
              <h3 className="h-sec">主要产品与类型</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fc.products.map((x) => (
                <Tag key={x} bg="#fafafa" color="#4b5563" bd="#e5e7eb">
                  {x}
                </Tag>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fc.productTypes.map((x) => (
                <Tag key={x} color="#2563eb" bg="#eff6ff" bd="#bfdbfe">
                  {x}
                </Tag>
              ))}
            </div>
          </div>

          {/* 制度要点 */}
          <div className="mt-5 rounded-2xl border border-line bg-paper-2 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-rose-600" />
              <h3 className="h-sec">双休 / 工时制度要点</h3>
            </div>
            <p className="text-[13.5px] leading-[1.85] text-ink-2">{fc.policy}</p>
            {fc.note && (
              <p className="mt-2 rounded-r-lg border-l-2 border-rose-300 bg-rose-50/50 pl-3 text-[12.5px] leading-relaxed text-ink-3">
                {fc.note}
              </p>
            )}
            {fc.detail && (
              <p className="mt-3 border-t border-line pt-3 text-[13px] leading-[1.85] text-ink-2">{fc.detail}</p>
            )}
          </div>

          {/* 来源 */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 text-rose-600" />
              <h3 className="h-sec">信息来源</h3>
            </div>
            <div className="rounded-xl border border-line bg-paper-2 px-3 py-2.5">
              <SourceList sources={fc.sources} />
            </div>
          </div>

          <p className="mt-5 rounded-xl bg-paper-2 p-3 text-2xs leading-relaxed text-ink-3">
            本站为公开信息整理工具，不构成对企业的评价或推荐。企业制度可能随时调整，且同一企业不同岗位、不同地区差异很大，
            求职或消费决策前请以企业官方说明为准。
          </p>
        </div>
      </aside>
    </div>
  )
}
