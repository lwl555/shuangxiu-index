import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COMPANIES } from '../data/companies'
import { INDUSTRIES } from '../data/industries'
import { REST_PATTERNS, PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { applyFilters, isCompliant, verdictOf, VERDICT_STYLE, EMPTY_FILTERS, type FilterState } from '../lib/filters'
import { loadReviewed } from '../lib/submit'
import CompanyCard from '../components/CompanyCard'
import CompanyDetail from '../components/CompanyDetail'
import { Tag } from '../components/Badge'
import Icon from '../components/Icon'
const OWNERSHIPS = ['央企/国企', '民营企业', '外资企业', '合资企业', '上市公司', '其他']

export default function Library() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'card' | 'table'>('card')
  const [openId, setOpenId] = useState<string | null>(null)
  const [visible, setVisible] = useState(60)

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
    setVisible(60)
  }

  const all = useMemo(() => [...loadReviewed(), ...COMPANIES], [])
  const openCompany = openId ? all.find((c) => c.id === openId) ?? null : null
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
      <div className="rounded-2xl border border-rose-100 bg-hero p-6">
        <div className="kicker text-rose-600">LIBRARY</div>
        <h1 className="mt-2 text-[24px] font-extrabold tracking-tight text-ink">企业库</h1>
        <p className="mt-2 max-w-[720px] text-[14px] leading-relaxed text-ink-2">
          {all.length} 家企业，按行业、产品、休息模式、地区随便挑。搜公司名、产品名、甚至「扫地机器人」都能命中。
          挑到合适的，点开看它的档案、工厂分布和制度要点。
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="sticky top-[60px] z-20 -mx-5 mt-6 border-b border-line bg-white/95 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[260px]">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              className="field h-[34px] w-full pl-9"
              placeholder="搜索企业 / 产品 / 行业关键词"
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
            />
          </div>
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

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-line-2 bg-white px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-rose-200 hover:text-ink">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-rose-500"
              checked={filters.onlyCompliant}
              onChange={(e) => set({ onlyCompliant: e.target.checked })}
            />
            仅看判定达标
          </label>

          {activeCount > 0 && (
            <button onClick={() => set(EMPTY_FILTERS)} className="btn-ghost h-[34px] py-0 text-xs">
              清空 {activeCount} 项
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
              {results.length} / {all.length}
            </span>
            <div className="flex overflow-hidden rounded-full border border-line-2 bg-white p-0.5">
              <button
                onClick={() => setView('card')}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${view === 'card' ? 'bg-cta text-white shadow-sm' : 'text-ink-3 hover:text-ink'}`}
              >
                卡片
              </button>
              <button
                onClick={() => setView('table')}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${view === 'table' ? 'bg-cta text-white shadow-sm' : 'text-ink-3 hover:text-ink'}`}
              >
                表格
              </button>
            </div>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-2 bg-paper-2 py-16 text-center">
          <Icon name="search" className="mx-auto h-10 w-10 text-ink-3" />
          <p className="mt-3 text-[15px] font-semibold text-ink-2">没有匹配的企业</p>
          <p className="mt-1 text-2xs text-ink-3">试试放宽筛选条件，或换一个关键词</p>
        </div>
      ) : view === 'card' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {results.slice(0, visible).map((c) => (
            <CompanyCard key={c.id} c={c} onOpen={() => setOpenId(c.id)} />
          ))}
        </div>
      ) : null}

      {view === 'card' && results.length > visible && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="btn" onClick={() => setVisible((v) => v + 60)}>
            加载更多（剩余 {results.length - visible} 家）
          </button>
          {visible > 60 && (
            <button className="btn-ghost" onClick={() => setVisible(60)}>
              收起
            </button>
          )}
        </div>
      )}

      {view === 'card' && results.length > 0 && (
        <p className="mt-4 text-center text-2xs text-ink-3">
          已显示 {Math.min(visible, results.length)} / {results.length} 家 · 卡片视图分页加载，切换「表格」可一览全部
        </p>
      )}

      {view !== 'card' ? (
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
      ) : null}

      <div className="mt-5 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="flex items-center gap-2">
          <Icon name="info" className="h-4 w-4 text-rose-600" />
          <span className="text-xs font-semibold text-ink">判定说明</span>
        </div>
        <p className="mt-1 text-2xs leading-relaxed text-ink-3">
          「达标」= 周均休息 ≥2 天且周均工时 ≤40 小时（轮休 / 调休按综合计算工时制周期等效计算）；
          「改善中」= 有明确加班管控措施但休息天数未公开；「数据不足」= 缺失关键数值，不做推测。
          当前共 <span className="num font-semibold text-rose-600">{all.filter(isCompliant).length}</span> 家判定达标。
        </p>
      </div>

      {openCompany && <CompanyDetail c={openCompany} onClose={() => setOpenId(null)} />}
    </div>
  )
}
