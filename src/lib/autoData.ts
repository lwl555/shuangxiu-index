import type { Company, RestPatternId, EvidenceLevel } from '../types'

export interface Candidate {
  id: string
  name: string
  industryId: string
  subIndustry: string
  products: string[]
  productTypes: string[]
  province: string
  city: string
  ownership: string
  restPattern: RestPatternId
  weeklyRestDays: number | null
  weeklyHours: number | null
  since: string
  scope: string
  policy: string
  confidence: number
  evidence: EvidenceLevel
  sourceUrl: string
  sourceTitle: string
  sourceSite: string
  snippet: string
  capturedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface CandidatesFile {
  updatedAt: string
  stats: {
    rawCollected: number
    afterDedupe: number
    afterFilter: number
    extracted: number
    candidates: number
    aiEnabled: boolean
    sources: string[]
  }
  candidates: Candidate[]
}

const DATA_URL = `${import.meta.env.BASE_URL}data/candidates.json`

export async function loadCandidates(): Promise<CandidatesFile | null> {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as CandidatesFile
    if (!json || !Array.isArray(json.candidates)) return null
    return json
  } catch {
    return null
  }
}

export function candidateToCompany(c: Candidate): Company {
  return {
    id: c.id,
    name: c.name,
    industryId: c.industryId || 'other',
    subIndustry: c.subIndustry || '未分类',
    products: c.products ?? [],
    productTypes: c.productTypes ?? [],
    province: c.province || '—',
    city: c.city || '—',
    ownership: (c.ownership || '其他') as Company['ownership'],
    restPattern: c.restPattern,
    weeklyRestDays: c.weeklyRestDays ?? null,
    weeklyHours: c.weeklyHours ?? null,
    since: c.since || '—',
    scope: c.scope || '未说明',
    policy: c.policy,
    note: `由自动采集发现（${c.sourceSite || '未知来源'}），置信度 ${c.confidence}，审核后上线`,
    evidence: c.evidence,
    sources: c.sourceUrl
      ? [{ title: c.sourceTitle || '自动采集来源', url: c.sourceUrl, date: c.capturedAt, publisher: c.sourceSite }]
      : [],
  }
}

const STATUS_KEY = 'shuangxiu_candidate_status_v1'
type StatusMap = Record<string, 'approved' | 'rejected'>

export function loadStatusMap(): StatusMap {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) ?? '{}') as StatusMap
  } catch {
    return {}
  }
}

export function saveStatus(id: string, status: 'approved' | 'rejected'): void {
  const m = loadStatusMap()
  m[id] = status
  localStorage.setItem(STATUS_KEY, JSON.stringify(m))
}

export function resetStatus(): void {
  localStorage.removeItem(STATUS_KEY)
}

export const SOURCE_LABEL: Record<string, string> = {
  so360: '360 搜索',
  bingRss: '必应搜索',
  baidu: '百度',
  gnews: 'Google 新闻',
  bing: '必应网页',
  gov: '政府公示站',
}
