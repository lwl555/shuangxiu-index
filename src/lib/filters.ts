import type { Company } from '../types'
import { PATTERN_MAP } from '../data/restPatterns'

export interface FilterState {
  q: string
  industry: string
  pattern: string
  evidence: string
  province: string
  ownership: string
  onlyCompliant: boolean
  sort: 'default' | 'restDays' | 'hours' | 'recent'
}

export const EMPTY_FILTERS: FilterState = {
  q: '',
  industry: '',
  pattern: '',
  evidence: '',
  province: '',
  ownership: '',
  onlyCompliant: false,
  sort: 'default',
}

/**
 * 达标判定口径（v2，2026-09-09 修正）
 * -----------------------------------
 * 修正原因：原口径要求「周休 ≥2 天」，会把一批法律上完全合规的轮休排班误判为不达标。
 * 典型如建设银行福安支行对私网点——员工每周休 1~1.5 天，但日均工时压到 6.5 小时、
 * 周均工时 35.75~39 小时，官方回复明确认定符合国家法律法规规定。
 *
 * 法律真正的硬指标是「工时」而非「休息天数」：
 *   - 《劳动法》第三十八条对休息天数的底线只是「每周至少休息一日」；
 *   - 工时才是核心：第三十六条 + 国务院令 174 号为 40 小时，第三十六条本身的上限为 44 小时；
 *   - 劳部发〔1994〕503 号第五条对综合计算工时制的表述是「与法定标准工作时间
 *     **基本相同**」，并非「不得超过」。
 *
 * 因此本站改为以周均工时为主轴判定，休息天数作为标注属性而非否决项：
 *   周均工时 ≤ 40 小时 且 每周至少休 1 天  → 达标
 *     其中 周休 ≥2 天 记为「标准双休」，周休 1~2 天 记为「轮休等效达标」
 *   40 小时 < 周均工时 ≤ 44 小时          → 基本合规（第三十六条的法定上限）
 *   周均工时 > 44 小时 或 每周休息 < 1 天  → 未达标
 *
 * weeklyRestDays 或 weeklyHours 缺失时，退化为按休息模式（restPattern）判定。
 */
export const HOURS_STANDARD = 40
export const HOURS_CEILING = 44

export function isCompliant(c: Company): boolean {
  const p = PATTERN_MAP[c.restPattern]
  const h = c.weeklyHours
  const d = c.weeklyRestDays
  if (h !== null) {
    if (h <= HOURS_STANDARD && (d === null || d >= 1)) return true
    if (p.compliant === true && d !== null && d >= 2 && h <= HOURS_CEILING) return true
    return false
  }
  // 缺工时数据时退化：休息模式合规 + 每周至少休 2 天
  if (p.compliant === true) return d === null || d >= 2
  return false
}

/** 达标但非标准双休：靠轮休 / 压缩日工时实现等效达标 */
export function isShiftEquivalent(c: Company): boolean {
  return isCompliant(c) && c.weeklyRestDays !== null && c.weeklyRestDays < 2
}

export type Verdict = '达标' | '基本合规' | '改善中' | '未达标' | '数据不足'

export function verdictOf(c: Company): Verdict {
  const p = PATTERN_MAP[c.restPattern]
  const h = c.weeklyHours
  const d = c.weeklyRestDays
  const hasHours = h !== null

  if (hasHours) {
    if (h <= HOURS_STANDARD && (d === null || d >= 1)) return '达标'
    if (h <= HOURS_CEILING && (d === null || d >= 1)) return '基本合规'
    if (d !== null && d < 1) return '未达标'
    return '未达标'
  }
  if (d !== null && d < 1) return '未达标'
  if (p.compliant === true) return d !== null && d >= 2 ? '达标' : '数据不足'
  if (p.compliant === 'partial') return '改善中'
  return '数据不足'
}

export const VERDICT_STYLE: Record<Verdict, { bg: string; fg: string; bd: string }> = {
  达标: { bg: '#f0fdf4', fg: '#166534', bd: '#bbf7d0' },
  基本合规: { bg: '#eff6ff', fg: '#1d4ed8', bd: '#bfdbfe' },
  改善中: { bg: '#fefce8', fg: '#a16207', bd: '#fde68a' },
  未达标: { bg: '#fef2f2', fg: '#991b1b', bd: '#fecaca' },
  数据不足: { bg: '#f4f4f5', fg: '#52525b', bd: '#e4e4e7' },
}

export function applyFilters(list: Company[], f: FilterState): Company[] {
  const kw = f.q.trim().toLowerCase()
  let out = list.filter((c) => {
    if (f.industry && c.industryId !== f.industry) return false
    if (f.pattern && c.restPattern !== f.pattern) return false
    if (f.evidence && c.evidence !== f.evidence) return false
    if (f.province && c.province !== f.province) return false
    if (f.ownership && c.ownership !== f.ownership) return false
    if (f.onlyCompliant && !isCompliant(c)) return false
    if (kw) {
      const hay = [c.name, c.brand ?? '', c.subIndustry, c.city, c.province, c.policy, ...c.products, ...c.productTypes]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })

  if (f.sort === 'restDays') {
    out = [...out].sort((a, b) => (b.weeklyRestDays ?? -1) - (a.weeklyRestDays ?? -1))
  } else if (f.sort === 'hours') {
    out = [...out].sort((a, b) => (a.weeklyHours ?? 999) - (b.weeklyHours ?? 999))
  } else if (f.sort === 'recent') {
    out = [...out].sort((a, b) => (b.since === '—' ? '' : b.since).localeCompare(a.since === '—' ? '' : a.since))
  }
  return out
}
