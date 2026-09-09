import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COMPANIES } from '../data/companies'
import { INDUSTRIES } from '../data/industries'
import { REST_PATTERNS, PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { applyFilters, isCompliant, verdictOf, VERDICT_STYLE, EMPTY_FILTERS, type FilterState } from '../lib/filters'
import { loadReviewed } from '../lib/submit'
import CompanyCard from '../components/CompanyCard'
import { Tag } from '../components/Badge'
const OWNERSHIPS = ['央企/国企', '民营企业', '外资企业', '合资企业', '上市公司', '其他']

export default function Library() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'card' | 'table'>('card')

  const filters: FilterState = {
    ...EMPTY_FILTERS,
    q: params.get('q') ?? '',
    industry: params.get('industry') ?? '',
    pattern: params.get('pattern') ?? '',
    evidence: params.get('evidence') ?? '',
    province: params.get('province') ?? '',
    ownership: params.get('ownership') ?? '',
    onlyCompliant: params.get('ok') === '1',
    sort: (params.get('sort') as FilterState['sort']) || 'default',
  }

  const set = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch }
    const p = new URLSearchParams()
    if (next.q) p.set('q', next.q)
    if (next.industry) p.set('industry', next.industry)
    if (next.pattern) p.set('pattern', next.pattern)
    if (next.evidence) p.set('evidence', next.evidence)
    if (next.province) p.set('province', next.province)
    if (next.ownership) p.set('ownership', next.ownership)
    if (next.onlyCompliant) p.set('ok', '1')
    if (next.sort !== 'default') p.set('sort', next.sort)
    setParams(p, { replace: true })
  }

  const all = useMemo(() => [...loadReviewed(), ...COMPANIES], [])
  const provinces = useMemo(() => Array.from(new Set(all.map((c) => c.province))).sort(), [all])
  const results = useMemo(() => applyFilters(all, filters), [all, filters])

  const activeCount =
    Number(!!filters.q) +
    Number(!!filters.industry) +
    Number(!!filters.pattern) +
    Number(!!filters.evidence) +
    Number(!!filters.province) +
    Number(!!filters.ownership) +
    Number(filters.onlyCompliant)

  return (
    <div>
      <div className="border-b border-line pb-4">
        <h1 className="text-[22px] font-semibold tracking-tight">企业库</h1>
        <p className="mt-1.5 max-w-[720px] text-[13px] leading-relaxed text-ink-2">
          支持按行业、休息模式、产品关键词、地区筛选。搜索会同时匹配企业名称、产品、产品类型与制度描述。
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="sticky top-[52px] z-20 -mx-5 mt-0 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="field h-[30px] w-full sm:w-[240px]"
            placeholder="搜索企业 / 产品 / 行业关键词"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
          />
          <select className="sel" value={filters.industry} onChange={(e) => set({ industry: e.target.value })}>
            <option value="">全部行业</option>
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select className="sel" value={filters.pattern} onChange={(e) => set({ pattern: e.target.value })}>
            <option value="">全部休息模式</option>
            {REST_PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="sel" value={filters.evidence} onChange={(e) => set({ evidence: e.target.value })}>
            <option value="">全部证据等级</option>
            {(['A', 'B', 'C'] as const).map((k) => (
              <option key={k} value={k}>
                {EVIDENCE_META[k].label}
              </option>
            ))}
          </select>
          <select className="sel" value={filters.province} onChange={(e) => set({ province: e.target.value })}>
            <option value="">全部地区</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select className="sel" value={filters.ownership} onChange={(e) => set({ ownership: e.target.value })}>
            <option value="">全部性质</option>
            {OWNERSHIPS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            className="sel"
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as FilterState['sort'] })}
          >
            <option value="default">默认排序</option>
            <option value="restDays">按周休天数</option>
            <option value="hours">按周工时</option>
            <option value="recent">按生效时间</option>
          </select>

          <label className="flex cursor-pointer select-none items-center gap-1.5 border border-line-2 px-2 py-[5px] text-[12px] text-ink-2 hover:border-ink">
            <input
              type="checkbox"
              className="h-3 w-3 accent-[#16171a]"
              checked={filters.onlyCompliant}
              onChange={(e) => set({ onlyCompliant: e.target.checked })}
            />
            仅看判定达标
          </label>

          {activeCount > 0 && (
            <button onClick={() => set(EMPTY_FILTERS)} className="btn-ghost h-[30px] py-0">
              清空 {activeCount} 项
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="num text-[12px] text-ink-3">
              {results.length} / {all.length}
            </span>
            <div className="flex border border-line-2">
              <button
                onClick={() => setView('card')}
                className={`px-2 py-[5px] text-[12px] ${view === 'card' ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'}`}
              >
                卡片
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-2 py-[5px] text-[12px] ${view === 'table' ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'}`}
              >
                表格
              </button>
            </div>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-10 border border-dashed border-line-2 py-16 text-center">
          <p className="text-[14px] text-ink-2">没有匹配的企业</p>
          <p className="mt-1 text-2xs text-ink-3">试试放宽筛选条件，或换一个关键词</p>
        </div>
      ) : view === 'card' ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {results.map((c) => (
            <CompanyCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="scroll-thin mt-4 overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="whitespace-nowrap">企业</th>
                <th className="whitespace-nowrap">行业 / 细分</th>
                <th>主要产品</th>
                <th className="whitespace-nowrap">休息模式</th>
                <th className="whitespace-nowrap">周休</th>
                <th className="whitespace-nowrap">周工时</th>
                <th className="whitespace-nowrap">判定</th>
                <th className="whitespace-nowrap">证据</th>
                <th className="whitespace-nowrap">地区</th>
                <th className="whitespace-nowrap">生效</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => {
                const p = PATTERN_MAP[c.restPattern]
                const v = verdictOf(c)
                const vs = VERDICT_STYLE[v]
                return (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap font-medium">{c.name}</td>
                    <td className="whitespace-nowrap text-ink-3">
                      {INDUSTRIES.find((i) => i.id === c.industryId)?.name ?? c.industryId}
                      <span className="text-ink-3"> · {c.subIndustry}</span>
                    </td>
                    <td className="max-w-[260px]">
                      <span className="text-ink-2">{c.products.slice(0, 4).join('、')}</span>
                      {c.products.length > 4 && <span className="text-ink-3"> 等 {c.products.length} 项</span>}
                    </td>
                    <td className="whitespace-nowrap">
                      <span style={{ color: p.color }}>{p.name}</span>
                    </td>
                    <td className="num whitespace-nowrap">{c.weeklyRestDays ?? '—'}</td>
                    <td className="num whitespace-nowrap">{c.weeklyHours ?? '—'}</td>
                    <td className="whitespace-nowrap">
                      <span
                        className="tag"
                        style={{ color: vs.fg, background: vs.bg, borderColor: vs.bd }}
                      >
                        {v}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <Tag color={EVIDENCE_META[c.evidence].color} bd={EVIDENCE_META[c.evidence].color + '55'}>
                        {c.evidence}
                      </Tag>
                    </td>
                    <td className="whitespace-nowrap text-ink-3">{c.province}</td>
                    <td className="num whitespace-nowrap text-ink-3">{c.since}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-5 text-2xs leading-relaxed text-ink-3">
        判定说明：「达标」= 周均休息 ≥2 天且周均工时 ≤40 小时（轮休 / 调休按综合计算工时制周期等效计算）；
        「改善中」= 有明确加班管控措施但休息天数未公开；「数据不足」= 缺失关键数值，不做推测。
        当前共 {all.filter(isCompliant).length} 家判定达标。
      </p>
    </div>
  )
}
