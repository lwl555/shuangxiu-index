import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PATTERN_MAP, EVIDENCE_META } from '../data/restPatterns'
import { INDUSTRY_MAP } from '../data/industries'
import {
  loadCandidates,
  candidateToCompany,
  loadStatusMap,
  saveStatus,
  resetStatus,
  SOURCE_LABEL,
  type Candidate,
} from '../lib/autoData'
import { loadReviewed, saveReviewed } from '../lib/submit'
import { Tag } from '../components/Badge'

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-line px-3.5 py-3">
      <div className="kicker">{label}</div>
      <div className="num mt-1 text-[22px] font-semibold leading-none">{value}</div>
      {sub && <div className="mt-1 text-2xs leading-snug text-ink-3">{sub}</div>}
    </div>
  )
}

export default function Crawl() {
  const [data, setData] = useState<Awaited<ReturnType<typeof loadCandidates>>>(null)
  const [loading, setLoading] = useState(true)
  const [statusMap, setStatusMap] = useState<Record<string, 'approved' | 'rejected'>>({})
  const [onlyPending, setOnlyPending] = useState(true)
  const [minConf, setMinConf] = useState(0)

  useEffect(() => {
    setStatusMap(loadStatusMap())
    loadCandidates().then((f) => {
      setData(f)
      setLoading(false)
    })
  }, [])

  const list = useMemo(() => {
    const raw = data?.candidates ?? []
    return raw
      .map((c) => ({ ...c, status: (statusMap[c.id] ?? c.status) as Candidate['status'] }))
      .filter((c) => (onlyPending ? c.status === 'pending' : true))
      .filter((c) => c.confidence >= minConf)
      .sort((a, b) => b.confidence - a.confidence)
  }, [data, statusMap, onlyPending, minConf])

  function approve(c: Candidate) {
    const cur = loadReviewed()
    if (!cur.find((x) => x.id === c.id)) {
      saveReviewed([candidateToCompany(c), ...cur])
    }
    saveStatus(c.id, 'approved')
    setStatusMap(loadStatusMap())
  }

  function reject(c: Candidate) {
    saveStatus(c.id, 'rejected')
    setStatusMap(loadStatusMap())
  }

  function clearAll() {
    resetStatus()
    setStatusMap({})
  }

  if (loading) {
    return <div className="py-16 text-center text-[13px] text-ink-3">正在读取候选池…</div>
  }

  if (!data) {
    return (
      <div>
        <div className="border-b border-line pb-5">
          <h1 className="text-[22px] font-semibold tracking-tight">自动采集</h1>
        </div>
        <div className="mt-8 border border-dashed border-line-2 p-8">
          <p className="text-[14px] font-medium">候选池还是空的</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            需要先跑一次采集脚本（本地或 GitHub Actions），它会生成{' '}
            <code className="bg-paper-3 px-1 py-0.5 text-[12px]">public/data/candidates.json</code>。
          </p>
          <pre className="mt-3 overflow-x-auto border border-line bg-paper-2 p-3 text-[12px] leading-relaxed">
            {`npm run crawl           # 完整运行（含 AI 提取）
npm run crawl:noai     # 只做规则提取，不调用 AI`}
          </pre>
          <p className="mt-3 text-2xs leading-relaxed text-ink-3">
            每天自动执行：仓库已配置 GitHub Actions（.github/workflows/daily-crawl.yml），
            默认每天北京时间 06:00 跑一次并自动提交结果。
          </p>
        </div>
      </div>
    )
  }

  const s = data.stats
  const pending = list.filter((c) => c.status === 'pending').length

  return (
    <div>
      <div className="border-b border-line pb-5">
        <h1 className="text-[22px] font-semibold tracking-tight">自动采集</h1>
        <p className="mt-1.5 max-w-[760px] text-[13px] leading-relaxed text-ink-2">
          每天自动从多个站点批量检索企业工时制度信息，经关键词初筛与 AI 结构化提取后进入候选池。
          <strong className="font-semibold">候选条目不会直接上线</strong>
          ——需要你逐条确认后才会进入企业库，避免自动抓取污染数据。
        </p>
      </div>

      <section className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="原始抓取" value={s.rawCollected} sub="本次命中的搜索结果" />
        <Stat label="初筛通过" value={s.afterFilter} sub="关键词相关性过滤后" />
        <Stat label="AI 提取" value={s.extracted} sub={s.aiEnabled ? '已启用 AI 结构化' : '规则提取（未启用 AI）'} />
        <Stat label="候选条目" value={s.candidates} sub="去重并过滤已有企业后" />
        <Stat label="待审核" value={pending} sub="当前筛选条件下" />
      </section>

      <section className="mt-4 border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="kicker">本次运行</div>
          <div className="flex flex-wrap items-center gap-2 text-2xs text-ink-3">
            <span>更新于 {new Date(data.updatedAt).toLocaleString('zh-CN')}</span>
            <span>·</span>
            <span>
              数据源：{s.sources.map((x) => SOURCE_LABEL[x] || x).join('、') || '—'}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer select-none items-center gap-1.5 border border-line-2 px-2 py-[5px] text-[12px] text-ink-2 hover:border-ink">
            <input
              type="checkbox"
              className="h-3 w-3 accent-[#16171a]"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />
            只看待审核
          </label>
          <select
            className="sel"
            value={minConf}
            onChange={(e) => setMinConf(Number(e.target.value))}
          >
            <option value={0}>全部置信度</option>
            <option value={60}>≥60</option>
            <option value={70}>≥70</option>
            <option value={80}>≥80</option>
          </select>
          <button onClick={clearAll} className="btn-ghost h-[30px] py-0">
            重置审核记录
          </button>
          <span className="num ml-auto text-[12px] text-ink-3">{list.length} 条</span>
        </div>
      </section>

      {list.length === 0 ? (
        <div className="mt-8 border border-dashed border-line-2 py-16 text-center">
          <p className="text-[14px] text-ink-2">没有符合条件的候选</p>
          <p className="mt-1 text-2xs text-ink-3">试试取消「只看待审核」或降低置信度门槛</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {list.map((c) => {
            const p = PATTERN_MAP[c.restPattern] ?? PATTERN_MAP.standard
            const ev = EVIDENCE_META[c.evidence] ?? EVIDENCE_META.C
            const ind = INDUSTRY_MAP[c.industryId]
            return (
              <article key={c.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-tight tracking-tight">{c.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-3">
                      <span>{ind?.name ?? c.industryId}{c.subIndustry ? ` · ${c.subIndustry}` : ''}</span>
                      <span>
                        {c.province}
                        {c.city && c.city !== c.province ? ` ${c.city}` : ''}
                      </span>
                      <span>{c.ownership}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Tag color={p.color} bd={p.color + '55'}>
                      {p.name}
                    </Tag>
                    <Tag color={ev.color} bd={ev.color + '55'}>
                      {c.evidence} 级
                    </Tag>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 divide-x divide-line border border-line bg-paper-2">
                  <div className="px-3 py-2">
                    <div className="kicker">周均休息</div>
                    <div className="num mt-0.5 text-[16px] font-semibold leading-none">
                      {c.weeklyRestDays ?? '—'}
                      <span className="ml-0.5 text-2xs font-normal text-ink-3">天</span>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="kicker">周均工时</div>
                    <div className="num mt-0.5 text-[16px] font-semibold leading-none">
                      {c.weeklyHours ?? '—'}
                      <span className="ml-0.5 text-2xs font-normal text-ink-3">小时</span>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="kicker">置信度</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="num text-[16px] font-semibold leading-none">{c.confidence}</span>
                      <span className="h-[6px] w-10 bg-paper-3">
                        <span
                          className="block h-full"
                          style={{
                            width: `${c.confidence}%`,
                            background: c.confidence >= 75 ? '#166534' : c.confidence >= 60 ? '#a16207' : '#991b1b',
                          }}
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {c.products.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.products.slice(0, 6).map((x) => (
                      <Tag key={x} bg="#fafafa">
                        {x}
                      </Tag>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{c.policy}</p>
                {c.snippet && (
                  <p className="mt-2 border-l-2 border-line-2 pl-2.5 text-[12px] leading-relaxed text-ink-3">
                    {c.snippet.slice(0, 160)}
                    {c.snippet.length > 160 ? '…' : ''}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-2xs text-ink-3 underline decoration-line-2 underline-offset-2 hover:text-ink hover:decoration-ink"
                    title={c.sourceTitle}
                  >
                    {c.sourceSite || '来源'} · {c.capturedAt}
                  </a>
                  <div className="flex gap-2">
                    {c.status === 'approved' ? (
                      <span className="text-2xs" style={{ color: '#166534' }}>
                        已上线
                      </span>
                    ) : c.status === 'rejected' ? (
                      <span className="text-2xs text-ink-3">已忽略</span>
                    ) : (
                      <>
                        <button
                          onClick={() => approve(c)}
                          className="border border-line-2 px-2 py-[3px] text-2xs text-ink-2 hover:border-ink hover:text-ink"
                        >
                          通过并上线
                        </button>
                        <button
                          onClick={() => reject(c)}
                          className="border border-line-2 px-2 py-[3px] text-2xs text-ink-3 hover:border-ink hover:text-ink"
                        >
                          忽略
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <section className="mt-8 border border-line bg-paper-2 p-4">
        <div className="kicker">它是怎么跑的</div>
        <div className="mt-2 space-y-2 text-[12.5px] leading-[1.8] text-ink-2">
          <p>
            <strong className="font-semibold">1. 批量检索</strong>：围绕 12 组关键词在 360 搜索、必应、
            政府公示站等源批量抓取，单日原始结果通常 150—200 条。
          </p>
          <p>
            <strong className="font-semibold">2. 规则初筛</strong>：按「双休 / 综合计算工时 / 轮休 /
            四班三运转」等强信号词打分，低于阈值的丢弃，并过滤招聘、词典、百科类噪声。
          </p>
          <p>
            <strong className="font-semibold">3. AI 结构化</strong>：把标题与摘要交给模型，
            提取企业名、行业、产品、周休天数、周均工时、休息模式与置信度；对摘要过短的条目会先补抓详情页正文。
          </p>
          <p>
            <strong className="font-semibold">4. 入库前拦截</strong>：与已收录企业去重，
            置信度低于 55 的直接丢弃，剩下的进候选池等人工确认。
          </p>
        </div>
        <p className="mt-3 border-t border-line pt-2 text-2xs leading-relaxed text-ink-3">
          审核通过的企业会加入本机企业库并标注来源（仅本机可见）。要让所有人看到，
          需要把条目合并进 <code className="bg-paper-3 px-1">src/data/companies.ts</code> 后重新部署。
        </p>
        <Link to="/library" className="mt-2 inline-block text-2xs text-ink underline decoration-line-2">
          去企业库查看已上线的条目 →
        </Link>
      </section>
    </div>
  )
}
