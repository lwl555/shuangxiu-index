import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { INDUSTRIES, INDUSTRY_MAP } from '../data/industries'
import { REST_PATTERNS, PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { isCompliant, verdictOf, type Verdict } from '../lib/filters'
import { loadReviewed } from '../lib/submit'
import CompanyCard from '../components/CompanyCard'
import CompanyDetail from '../components/CompanyDetail'
import { Tag } from '../components/Badge'
import Icon from '../components/Icon'

function Stat({ label, value, sub, accent, icon }: { label: string; value: string | number; sub?: string; accent: string; icon: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: accent + '12', color: accent }}>
        <Icon name={icon as any} className="h-5 w-5" />
      </div>
      <div className="kicker">{label}</div>
      <div className="num mt-2 text-[32px] font-bold leading-none tracking-tight" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs font-medium leading-snug text-ink-3">{sub}</div>}
    </div>
  )
}

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="w-[104px] shrink-0 truncate text-[12px] font-medium text-ink-2">{label}</span>
      <span className="h-[10px] flex-1 overflow-hidden rounded-full bg-paper-3">
        <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="num w-8 shrink-0 text-right text-[12px] font-semibold text-ink-3">{count}</span>
    </div>
  )
}

function RuleCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/70 p-3 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
        {num}
      </div>
      <div>
        <div className="text-sm font-bold text-ink">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-ink-3">{desc}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const [recentOnly, setRecentOnly] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const all = useMemo(() => [...loadReviewed(), ...COMPANIES], [])
  const openCompany = openId ? all.find((c) => c.id === openId) ?? null : null
  const stats = useMemo(() => {
    const verdicts: Record<Verdict, number> = { 达标: 0, 基本合规: 0, 改善中: 0, 未达标: 0, 数据不足: 0 }
    all.forEach((c) => (verdicts[verdictOf(c)] += 1))
    const byPattern = REST_PATTERNS.map((p) => ({ p, n: all.filter((c) => c.restPattern === p.id).length }))
    const byIndustry = INDUSTRIES.map((i) => ({ i, n: all.filter((c) => c.industryId === i.id).length })).sort(
      (a, b) => b.n - a.n,
    )
    const evidence = { A: 0, B: 0, C: 0 } as Record<'A' | 'B' | 'C', number>
    all.forEach((c) => (evidence[c.evidence] += 1))
    const recent = [...all]
      .filter((c) => c.since !== '—')
      .sort((a, b) => b.since.localeCompare(a.since))
      .slice(0, 6)
    return { verdicts, byPattern, byIndustry, evidence, recent }
  }, [all])

  const compliantCount = stats.verdicts['达标'] + stats.verdicts['基本合规']

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-hero p-6 sm:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative">
          <div className="kicker text-rose-600">双休 / 轮休 / 弹性工时 · 中国企业公开信息索引</div>
          <h1 className="mt-3 max-w-[840px] text-[28px] font-extrabold leading-[1.2] tracking-tight text-ink sm:text-[34px]">
            周六到底能不能准时下班？<br />
            我们替你把<span className="gradient-text">「真双休」</span>的企业挑出来了。
          </h1>
          <p className="mt-4 max-w-[720px] text-[14.5px] leading-relaxed text-ink-2">
            「双休」不等于周六周日必须同时休。按《劳动法》第三十九条与劳部发〔1994〕503 号，
            经审批实行<strong className="font-semibold text-ink">综合计算工时制</strong>的企业可以集中工作、集中休息、轮休轮调——
            只要周期内平均周工时不超过法定标准、休息权得到保障，同样算数。本站据此判定，
            每条都附来源，不为任何一家背书。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/library" className="btn no-underline">
              <Icon name="search" className="mr-1.5 h-4 w-4" />
              看看哪些公司不加班
            </Link>
            <Link to="/policy" className="btn-ghost no-underline">
              <Icon name="shield" className="mr-1.5 h-4 w-4" />
              凭什么这么判
            </Link>
            <Link to="/submit" className="btn-ghost no-underline">
              <Icon name="zap" className="mr-1.5 h-4 w-4" />
              爆料你司制度
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="收录企业"
          value={all.length}
          sub={`主库 ${COMPANIES.length} 家 · 社区 ${all.length - COMPANIES.length} 家`}
          accent="#be123c"
          icon="building"
        />
        <Stat label="判定达标" value={stats.verdicts['达标']} sub="周均工时 ≤40 小时" accent="#059669" icon="check" />
        <Stat label="基本合规" value={stats.verdicts['基本合规']} sub="40—44 小时（法定上限内）" accent="#2563eb" icon="shield" />
        <Stat label="纳入等效双休" value={compliantCount} sub="达标 + 基本合规合计" accent="#7c3aed" icon="users" />
      </section>

      {/* 判定口径 + 模式 */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Icon name="shield" className="h-5 w-5 text-rose-600" />
            <div className="h-sec">判定口径</div>
          </div>
          <div className="mt-4 space-y-3">
            <RuleCard num="1" title="周均工时 ≤ 40 小时" desc="《劳动法》第三十六条基准线" />
            <RuleCard num="2" title="每周至少休息 1 天" desc="第三十八条法定底线" />
            <RuleCard num="3" title="轮休 / 调休按周期折算" desc="综合计算工时制等效处理" />
          </div>
          <p className="mt-4 rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-ink-3 backdrop-blur-sm">
            以<strong className="font-semibold text-ink">工时</strong>为判定主轴——每周休满 2 天记「标准双休」，靠轮休压缩日工时达标者记「轮休等效」。
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-sec">按休息模式分布</div>
            <Link to="/policy" className="text-2xs font-semibold text-rose-600 no-underline hover:text-rose-700">
              模式定义 →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.byPattern.map(({ p, n }) => (
              <Bar key={p.id} label={p.name} count={n} total={all.length} color={p.color} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {REST_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => nav(`/library?pattern=${p.id}`)}
                className="pill cursor-pointer border border-transparent hover:bg-rose-50"
                style={{ color: p.color, background: p.color + '10' }}
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 行业分布 + 证据等级 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-sec">按行业分布</div>
            <button
              onClick={() => nav('/industry')}
              className="text-2xs font-semibold text-rose-600 underline decoration-rose-200 underline-offset-2 hover:text-rose-700"
            >
              行业对照 →
            </button>
          </div>
          <div className="space-y-3">
            {stats.byIndustry
              .filter((x) => x.n > 0)
              .slice(0, 12)
              .map(({ i, n }) => (
                <button
                  key={i.id}
                  onClick={() => nav(`/library?industry=${i.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-rose-50/50"
                >
                  <span className="w-[100px] shrink-0 truncate text-[12px] font-medium text-ink-2">{i.name}</span>
                  <span className="h-[10px] flex-1 overflow-hidden rounded-full bg-paper-3">
                    <span className="block h-full rounded-full bg-cta" style={{ width: `${(n / all.length) * 100}%` }} />
                  </span>
                  <span className="num w-8 shrink-0 text-right text-[12px] font-semibold text-ink-3">{n}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 h-sec">证据等级说明</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['A', 'B', 'C'] as const).map((k) => {
              const m = EVIDENCE_META[k]
              return (
                <div key={k} className="rounded-xl border border-line bg-paper-2 p-4 transition-colors hover:border-rose-200">
                  <div className="flex items-center justify-between">
                    <Tag color={m.color} bd={m.color + '40'} bg="#fff">
                      {m.label}
                    </Tag>
                    <span className="num text-[22px] font-bold" style={{ color: m.color }}>
                      {stats.evidence[k]}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-3">{m.desc}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">
            <strong>提示：</strong>证据等级 A 为官方/权威媒体；B 为交叉公开信息；C 为网友口碑待核实。C 级条目仅供参考，不做达标背书。
          </div>
        </div>
      </section>

      {/* 最近动态 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-sec">最近生效的制度</div>
          <button
            onClick={() => setRecentOnly((v) => !v)}
            className="text-2xs font-semibold text-rose-600 underline decoration-rose-200 underline-offset-2 hover:text-rose-700"
          >
            {recentOnly ? '收起' : '展开全部'}
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {(recentOnly ? all.filter((c) => c.since !== '—') : stats.recent).map((c) => (
            <CompanyCard key={c.id} c={c} onOpen={() => setOpenId(c.id)} />
          ))}
        </div>
      </section>

      {/* 关于数据 */}
      <section className="rounded-2xl border border-line bg-gradient-to-br from-paper-2 to-white p-5">
        <div className="flex items-center gap-2">
          <Icon name="info" className="h-5 w-5 text-rose-600" />
          <div className="h-sec">关于数据</div>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
          本站不收录无从溯源的企业名称，也不对未公开工时的企业做推测——缺失的字段一律显示为「—」。
          企业制度随时可能调整，且同一企业不同岗位、不同地区差异很大（例如总部职能岗标准双休、门店一线排班轮休）。
          当前版本更新于 {LAST_UPDATED}，共覆盖 {Object.keys(INDUSTRY_MAP).length} 个行业分类。
        </p>
      </section>

      {openCompany && <CompanyDetail c={openCompany} onClose={() => setOpenId(null)} />}
    </div>
  )
}
