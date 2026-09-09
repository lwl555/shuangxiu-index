import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { INDUSTRIES, INDUSTRY_MAP } from '../data/industries'
import { REST_PATTERNS, PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { isCompliant, verdictOf, type Verdict } from '../lib/filters'
import { loadReviewed } from '../lib/submit'
import CompanyCard from '../components/CompanyCard'
import { Tag } from '../components/Badge'

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="border border-line px-3.5 py-3">
      <div className="kicker">{label}</div>
      <div className="num mt-1 text-[26px] font-semibold leading-none" style={{ color: accent ?? '#16171a' }}>
        {value}
      </div>
      {sub && <div className="mt-1 text-2xs leading-snug text-ink-3">{sub}</div>}
    </div>
  )
}

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="w-[104px] shrink-0 truncate text-[12px] text-ink-2">{label}</span>
      <span className="h-[14px] flex-1 bg-paper-3">
        <span className="block h-full" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="num w-8 shrink-0 text-right text-[12px] text-ink-3">{count}</span>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const [recentOnly, setRecentOnly] = useState(false)

  const all = useMemo(() => [...loadReviewed(), ...COMPANIES], [])
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

  return (
    <div>
      {/* 头部 */}
      <section className="border-b border-line pb-6">
        <div className="kicker">双休 / 轮休 / 弹性工时 · 中国企业公开信息索引</div>
        <h1 className="mt-2 max-w-[760px] text-[26px] font-semibold leading-[1.25] tracking-tight">
          收录中国境内公开可查的执行双休、轮休、弹性或缩短工时制度的企业，
          按行业与产品类型分类，每条都附来源。
        </h1>
        <p className="mt-3 max-w-[760px] text-[13.5px] leading-relaxed text-ink-2">
          「双休」并不等于周六、周日必须同时休。按《劳动法》第三十九条与劳部发〔1994〕503 号，
          经审批实行<strong className="font-semibold">综合计算工时制</strong>的企业可以集中工作、集中休息、轮休轮调——
          只要周期内平均周工时不超过法定标准、休息权得到保障，同样是合规的双休。本站据此判定，
          而不是只看日历上的周六周日。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/library" className="btn no-underline">
            浏览企业库
          </Link>
          <Link to="/policy" className="btn-ghost no-underline">
            判定标准与法律依据
          </Link>
          <Link to="/submit" className="btn-ghost no-underline">
            提交线索
          </Link>
        </div>
      </section>

      {/* 判定口径 */}
      <section className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-paper p-4">
          <div className="kicker">判定口径</div>
          <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-2">
            <div className="flex items-baseline gap-2">
              <span className="num font-semibold text-ink">1</span>
              <span>周均工时 ≤ 40 小时</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="num font-semibold text-ink">2</span>
              <span>每周至少休息 1 天</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="num font-semibold text-ink">3</span>
              <span>轮休 / 调休按周期折算</span>
            </div>
          </div>
          <p className="mt-2.5 border-t border-line pt-2 text-2xs leading-relaxed text-ink-3">
            以<strong className="font-semibold">工时为判定主轴</strong>
            ——每周休满 2 天记「标准双休」，靠轮休压缩日工时达标者记「轮休等效」。
          </p>
        </div>
        <Stat label="收录企业" value={all.length} sub={`主库 ${COMPANIES.length} · 社区 ${all.length - COMPANIES.length}`} />
        <Stat label="判定达标" value={stats.verdicts['达标']} accent="#166534" sub="周均工时 ≤40 小时" />
        <Stat label="基本合规" value={stats.verdicts['基本合规']} accent="#1d4ed8" sub="40—44 小时（法定上限内）" />
        <Stat label="改善中" value={stats.verdicts['改善中']} accent="#a16207" sub="有加班管控但工时未公开" />
      </section>

      {/* 分布 */}
      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="h-sec">按休息模式分布</h2>
            <Link to="/policy" className="text-2xs text-ink-3 no-underline hover:text-ink">
              模式定义 →
            </Link>
          </div>
          <div className="space-y-2">
            {stats.byPattern.map(({ p, n }) => (
              <Bar key={p.id} label={p.name} count={n} total={all.length} color={p.color} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
            {REST_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => nav(`/library?pattern=${p.id}`)}
                className="tag cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: p.color, borderColor: p.color + '55' }}
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="h-sec">按行业分布</h2>
            <button
              onClick={() => nav('/industry')}
              className="text-2xs text-ink-3 underline decoration-line-2 hover:text-ink"
            >
              行业对照 →
            </button>
          </div>
          <div className="space-y-2">
            {stats.byIndustry
              .filter((x) => x.n > 0)
              .map(({ i, n }) => (
                <button
                  key={i.id}
                  onClick={() => nav(`/library?industry=${i.id}`)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="w-[104px] shrink-0 truncate text-[12px] text-ink-2">{i.name}</span>
                  <span className="h-[14px] flex-1 bg-paper-3">
                    <span className="block h-full bg-ink" style={{ width: `${(n / all.length) * 100}%` }} />
                  </span>
                  <span className="num w-8 shrink-0 text-right text-[12px] text-ink-3">{n}</span>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* 证据等级 */}
      <section className="mt-8">
        <h2 className="h-sec mb-3">证据等级说明</h2>
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {(['A', 'B', 'C'] as const).map((k) => {
            const m = EVIDENCE_META[k]
            return (
              <div key={k} className="bg-paper p-4">
                <div className="flex items-center justify-between">
                  <Tag color={m.color} bd={m.color + '55'}>
                    {m.label}
                  </Tag>
                  <span className="num text-[20px] font-semibold" style={{ color: m.color }}>
                    {stats.evidence[k]}
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{m.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 最近动态 */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="h-sec">最近生效的制度</h2>
          <button
            onClick={() => setRecentOnly((v) => !v)}
            className="text-2xs text-ink-3 underline decoration-line-2 hover:text-ink"
          >
            {recentOnly ? '收起' : '展开全部'}
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {(recentOnly ? all.filter((c) => c.since !== '—') : stats.recent).map((c) => (
            <CompanyCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      <section className="mt-8 border border-line bg-paper-2 p-4">
        <div className="kicker">关于数据</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
          本站不收录无从溯源的企业名称，也不对未公开工时的企业做推测——缺失的字段一律显示为「—」。
          企业制度随时可能调整，且同一企业不同岗位、不同地区差异很大（例如总部职能岗标准双休、门店一线排班轮休）。
          当前版本更新于 {LAST_UPDATED}，共覆盖 {Object.keys(INDUSTRY_MAP).length} 个行业分类。
        </p>
      </section>
    </div>
  )
}
