import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { loadReviewed } from '../lib/submit'

const NAV = [
  { to: '/', label: '总览', end: true },
  { to: '/library', label: '企业库' },
  { to: '/policy', label: '政策与判定' },
  { to: '/industry', label: '行业对照' },
  { to: '/submit', label: '提交线索' },
  { to: '/crawl', label: '自动爬取' },
  { to: '/about', label: '关于' },
]

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="wrap flex h-[52px] items-center gap-6">
        <NavLink to="/" className="no-underline">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-tight">双休企业索引</span>
            <span className="hidden text-2xs text-ink-3 sm:inline">SHUANGXIU INDEX</span>
          </div>
        </NavLink>
        <nav className="flex flex-1 items-center gap-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                'no-underline border-b-2 px-2.5 py-1 text-[13px] transition-colors ' +
                (isActive ? 'border-ink text-ink font-medium' : 'border-transparent text-ink-3 hover:text-ink')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden text-2xs text-ink-3 md:block">
          收录 <span className="num font-semibold text-ink">{COMPANIES.length + loadReviewed().length}</span> 家 · 更新 {LAST_UPDATED}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-paper-2">
      <div className="wrap py-8 text-[12px] leading-relaxed text-ink-3">
        <p className="mb-2">
          本站为公开信息整理工具，不构成任何形式的评价、评级或投资建议。所有条目均标注信息来源与证据等级，
          企业制度可能随时调整，且同一企业不同岗位、不同地区可能存在差异。求职或消费决策前请以企业官方说明为准。
        </p>
        <p>
          数据更新 {LAST_UPDATED} · 如发现信息有误请通过「提交线索」页面说明，附来源链接者优先处理。
        </p>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-7">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
