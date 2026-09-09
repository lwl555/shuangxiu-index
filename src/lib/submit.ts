import type { Company, RestPatternId, EvidenceLevel } from '../types'

export interface Submission {
  id: string
  name: string
  industryId: string
  subIndustry: string
  products: string
  productTypes: string
  province: string
  city: string
  ownership: string
  restPattern: RestPatternId
  weeklyRestDays: string
  weeklyHours: string
  since: string
  scope: string
  policy: string
  sourceUrl: string
  sourceTitle: string
  contact: string
  createdAt: string
  status: 'pending'
}

const KEY = 'shuangxiu_submissions_v1'
const REVIEWED_KEY = 'shuangxiu_reviewed_v1'

export function loadSubmissions(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Submission[]
  } catch {
    return []
  }
}

export function saveSubmission(s: Submission): void {
  const all = loadSubmissions()
  all.unshift(s)
  localStorage.setItem(KEY, JSON.stringify(all))
}

/** 已上线企业（来自主数据）+ 本地审核通过的企业 */
export function loadReviewed(): Company[] {
  try {
    return JSON.parse(localStorage.getItem(REVIEWED_KEY) ?? '[]') as Company[]
  } catch {
    return []
  }
}

export function saveReviewed(list: Company[]): void {
  localStorage.setItem(REVIEWED_KEY, JSON.stringify(list))
}

export function submissionToCompany(s: Submission): Company {
  return {
    id: `sub-${s.id}`,
    name: s.name,
    industryId: s.industryId,
    subIndustry: s.subIndustry || '未分类',
    products: s.products.split(/[,，、;；]/).map((x) => x.trim()).filter(Boolean),
    productTypes: s.productTypes.split(/[,，、;；]/).map((x) => x.trim()).filter(Boolean),
    province: s.province || '—',
    city: s.city || '—',
    ownership: (s.ownership || '其他') as Company['ownership'],
    restPattern: s.restPattern,
    weeklyRestDays: s.weeklyRestDays ? Number(s.weeklyRestDays) : null,
    weeklyHours: s.weeklyHours ? Number(s.weeklyHours) : null,
    since: s.since || '—',
    scope: s.scope || '未说明',
    policy: s.policy,
    note: '由社区提交，待进一步核实',
    evidence: 'C' as EvidenceLevel,
    sources: s.sourceUrl
      ? [{ title: s.sourceTitle || '社区提交来源', url: s.sourceUrl, date: s.createdAt.slice(0, 10) }]
      : [],
  }
}

export function exportSubmissionsJson(): string {
  return JSON.stringify(loadSubmissions(), null, 2)
}

/**
 * 远程提交适配器
 * --------------
 * 默认只写本地 localStorage（零后端、零成本）。
 * 若要接入真实后端（例如 Supabase Edge Function），把 VITE_SUBMIT_ENDPOINT
 * 配到 .env 即可，函数会自动改为 POST 提交，失败时回落到本地。
 */
export async function submitRemote(s: Submission): Promise<{ ok: boolean; via: string; error?: string }> {
  const endpoint = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUBMIT_ENDPOINT
  if (!endpoint) {
    saveSubmission(s)
    return { ok: true, via: 'local' }
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { ok: true, via: 'remote' }
  } catch (e) {
    saveSubmission(s)
    return { ok: true, via: 'local-fallback', error: String(e) }
  }
}
