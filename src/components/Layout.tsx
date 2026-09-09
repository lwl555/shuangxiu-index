import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { loadReviewed } from '../lib/submit'
import Icon from './Icon'

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const total = COMPANIES.length + loadReviewed().length

  return (
    <header className="sticky top-0 z-30 border-b border-rose-100 bg-white/90 backdrop-blur-md">
      <div className="wrap flex h-[60px] items-center gap-4">
        <NavLink to="/" className="no-underline">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cta text-white shadow-md">
              <Icon name="briefcase" className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-tight tracking-tight text-ink">双休企业索引</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3 sm:inline">Shuangxiu Index</span>
            </div>
          </div>
        </NavLink>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                'no-underline rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ' +
                (isActive
                  ? 'bg-rose-50 text-rose-600 shadow-sm'
                  : 'text-ink-2 hover:bg-gray-50 hover:text-ink')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
            收录 <span className="num font-bold">{total}</span> 家
          </div>
          <div className="text-2xs text-ink-3">更新 {LAST_UPDATED}</div>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-line-2 text-ink-2 lg:hidden"
          aria-label="菜单"
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-white px-5 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  'no-underline rounded-xl px-3 py-2 text-[14px] font-medium transition-colors ' +
                  (isActive ? 'bg-rose-50 text-rose-600' : 'text-ink-2 hover:bg-gray-50')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
            收录 <span className="num font-bold">{total}</span> 家 · 更新 {LAST_UPDATED}
          </div>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-gradient-to-b from-paper-2 to-white">
      <div className="wrap py-10 text-[12px] leading-relaxed text-ink-3">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <Icon name="heart" className="h-4 w-4" />
          </span>
          <span className="font-semibold text-ink">双休企业索引</span>
        </div>
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
