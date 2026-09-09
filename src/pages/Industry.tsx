import { BENCHMARKS } from '../data/benchmarks'
import { INDUSTRIES, INDUSTRY_MAP } from '../data/industries'
import { COMPANIES } from '../data/companies'
import { PATTERN_MAP } from '../data/restPatterns'
import { verdictOf, VERDICT_STYLE } from '../lib/filters'
import { loadReviewed } from '../lib/submit'
import { Tag } from '../components/Badge'
import { Link } from 'react-router-dom'

const TREND_STYLE: Record<string, { c: string; bg: string }> = {
  改善: { c: '#166534', bg: '#f0fdf4' },
  持平: { c: '#52525b', bg: '#f4f4f5' },
  恶化: { c: '#991b1b', bg: '#fef2f2' },
  不明: { c: '#52525b', bg: '#f4f4f5' },
}

export default function Industry() {
  const all = [...loadReviewed(), ...COMPANIES]
  const covered = new Set(all.map((c) => c.industryId))

  return (
    <div>
      <div className="border-b border-line pb-5">
        <h1 className="text-[22px] font-semibold tracking-tight">行业对照</h1>
        <p className="mt-1.5 max-w-[760px] text-[13px] leading-relaxed text-ink-2">
          哪些行业在改善、哪些还在卷？这一页只摆行业层面的公开数据和趋势，不点名、不排名。
          想知道某家公司到底加不加班，去
          <Link to="/library" className="mx-0.5 text-ink">
            企业库
          </Link>
          点它的名字。
        </p>
      </div>

      <div className="mt-6 space-y-px border border-line bg-line">
        {BENCHMARKS.map((b) => {
          const ind = INDUSTRY_MAP[b.industryId]
          if (!ind) return null
          const list = all.filter((c) => c.industryId === b.industryId)
          const ok = list.filter((c) => verdictOf(c) === '达标').length
          const ts = TREND_STYLE[b.trend]
          return (
            <section key={b.industryId} className="bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[16px] font-semibold tracking-tight">{ind.name}</h2>
                    <Tag color={ts.c} bg={ts.bg} bd={ts.c + '33'}>
                      趋势：{b.trend}
                    </Tag>
                  </div>
                  <p className="mt-1 text-2xs text-ink-3">{ind.desc}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="kicker">月均加班</div>
                    <div className="num mt-0.5 text-[15px] font-semibold">
                      {b.monthlyOtHours ? `${b.monthlyOtHours[0]}—${b.monthlyOtHours[1]}` : '—'}
                      <span className="ml-0.5 text-2xs font-normal text-ink-3">小时</span>
                    </div>
                  </div>
                  <div>
                    <div className="kicker">本站收录</div>
                    <div className="num mt-0.5 text-[15px] font-semibold">
                      {list.length}
                      <span className="ml-0.5 text-2xs font-normal text-ink-3">家</span>
                    </div>
                  </div>
                  <div>
                    <div className="kicker">判定达标</div>
                    <div className="num mt-0.5 text-[15px] font-semibold" style={{ color: '#166534' }}>
                      {ok}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[13px] leading-[1.8] text-ink-2">{b.status}</p>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="kicker mb-1.5">主要驱动因素</div>
                  <ul className="space-y-1">
                    {b.drivers.map((d, i) => (
                      <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-3">
                        <span className="num shrink-0 text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="kicker mb-1.5">数据来源</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {b.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-2xs text-ink-3 underline decoration-line-2 underline-offset-2 hover:text-ink hover:decoration-ink"
                      >
                        {s.publisher ?? '来源'} · {s.date}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {list.length > 0 && (
                <div className="mt-3 border-t border-line pt-3">
                  <div className="kicker mb-2">本行业收录</div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((c) => {
                      const v = verdictOf(c)
                      const vs = VERDICT_STYLE[v]
                      return (
                        <Link
                          key={c.id}
                          to={`/library?q=${encodeURIComponent(c.name)}`}
                          className="tag no-underline transition-opacity hover:opacity-70"
                          style={{ color: vs.fg, background: vs.bg, borderColor: vs.bd }}
                          title={`${c.name} · ${PATTERN_MAP[c.restPattern].name} · ${v}`}
                        >
                          {c.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <section className="mt-8">
        <h2 className="h-sec mb-3">尚未收录数据的行业</h2>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.filter((i) => !covered.has(i.id) || !BENCHMARKS.find((b) => b.industryId === i.id)).map((i) => (
            <Tag key={i.id} bg="#fafafa">
              {i.name}
            </Tag>
          ))}
        </div>
        <p className="mt-3 text-2xs leading-relaxed text-ink-3">
          这些行业目前缺少可信的公开统计或企业线索。如果你手上有一手信息（公司制度文件、官方公告、招聘信息截图），
          欢迎通过提交线索页补充，附来源链接的条目会优先处理。
        </p>
      </section>
    </div>
  )
}
