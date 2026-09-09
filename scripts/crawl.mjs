#!/usr/bin/env node
/**
 * 双休企业索引 · 自动采集脚本
 * ===========================
 * 每天从多个数据源批量抓取「企业工时制度」相关信息，经关键词初筛 + AI 结构化提取后
 * 写入候选池 JSON。候选条目不会直接上线，需经审核（网站「自动采集」页 或 人工合并主数据）。
 *
 * 用法：
 *   node scripts/crawl.mjs                 # 完整运行（含 AI 提取）
 *   CRAWL_NO_AI=1 node scripts/crawl.mjs   # 只做规则提取，不调用 AI（省成本、可离线验证）
 *   CRAWL_LIMIT=5 node scripts/crawl.mjs   # 每个搜索词最多取 5 条结果
 *
 * 环境变量：
 *   CRAWL_AI_ENDPOINT   AI 接口地址，默认走 Agnes 代理（OpenAI 兼容 /v1/chat/completions）
 *   CRAWL_AI_KEY        AI 接口密钥，默认使用 Agnes 代理的公开 anon key
 *   CRAWL_AI_MODEL      模型名，默认 agnes-2.0-flash
 *   CRAWL_SOURCES       逗号分隔，限定数据源，如 bing,baidu,gov
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/data')

// ───────────────────────────── 配置 ─────────────────────────────

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

const AI_ENDPOINT =
  process.env.CRAWL_AI_ENDPOINT ||
  'https://wcnssyiqitugqfmcbdhe.functions.supabase.co/agnes-proxy/v1/chat/completions'
const AI_KEY =
  process.env.CRAWL_AI_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbnNzeWlxaXR1Z3FmbWNiZGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDEyNzUsImV4cCI6MjA5ODk3NzI3NX0.9EfbEr7BQhZtbOwHJ3IrkOy16kcaxlmzuJuV0A2Z8Eg'
const AI_MODEL = process.env.CRAWL_AI_MODEL || 'agnes-2.0-flash'

// 命令行开关（跨平台，避免依赖 cross-env）
const ARGV = process.argv.slice(2)
if (ARGV.includes('--no-ai')) process.env.CRAWL_NO_AI = '1'
if (ARGV.includes('--no-detail')) process.env.CRAWL_NO_DETAIL = '1'
const NO_AI = process.env.CRAWL_NO_AI === '1'
const LIMIT = Number(process.env.CRAWL_LIMIT || 8)

/**
 * 搜索词：围绕「工时制度」发散。
 * 注意：不要用「公司」这类泛词开头，否则搜索引擎会返回工商查询站。
 * 优先使用能出现在新闻标题里的具体表述。
 */
const QUERIES = [
  '全面落实双休',
  '取消大小周 双休',
  '综合计算工时工作制 公示',
  '不定时工作制 批复 企业',
  '四班三运转 综合计算工时',
  '上四休三 不降薪',
  '每周四天半工作制',
  '强制下班 不准加班 企业',
  '周末加班 审批 制度 企业',
  '弹性排班 轮休 网点员工',
  '反内卷 企业 取消加班',
  '企业 涨薪 双休 员工',
]

/** 政府/官方公示站：这些站点无反爬、信息权威，是最有价值的数据源 */
const GOV_SITES = [
  // 各地人社局会公示特殊工时制审批结果，把已知的列表页 URL 加到这里即可
  // { name: '某某市人社局', url: 'https://...', keywords: ['综合计算工时', '不定时工作制'] },
]

/** 通过搜索引擎发现政府公示页 */
const GOV_DISCOVERY_QUERIES = [
  'site:gov.cn 综合计算工时工作制 公示',
  'site:gov.cn 不定时工作制 审批 公示',
  'site:gov.cn 特殊工时 公示 企业',
]

/** 关键词：命中才认为这条结果与「工时制度」相关 */
const CORE_KEYWORDS = [
  '双休', '单休', '大小周', '上四休三', '四天工作制', '四天半',
  '综合计算工时', '不定时工作制', '特殊工时', '轮休', '弹性排班', '调休',
  '加班审批', '强制下班', '不准加班', '取消大小周', '反内卷', '995',
]
/** 强信号：命中说明很可能包含具体企业 + 具体制度 */
const STRONG_KEYWORDS = [
  '综合计算工时工作制', '不定时工作制', '全面落实双休', '取消大小周',
  '上四休三', '四天半工作制', '四班三运转', '四班三倒', '强制下班',
  '周末双休', '弹性排班',
]
/** 噪声：命中则丢弃 */
const NOISE = ['招聘', '求职', '简历', '考试', '培训', '公务员', '事业单位招', '题库']

const MEDIA_TRUSTED = [
  '人民网', '新华网', '央视', '经济日报', '光明网', '中国新闻网', '澎湃', '界面新闻',
  '第一财经', '财新', '证券时报', '中国经营报', '经济观察报', '工人日报', '中工网',
  '南方周末', '南方都市报', '新京报', '北京青年报', '每日经济新闻', '21世纪经济报道',
]

// ───────────────────────────── 工具 ─────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url, timeout = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      redirect: 'follow',
      signal: ctrl.signal,
    })
    if (!res.ok) return { ok: false, status: res.status, text: '' }
    const text = await res.text()
    return { ok: true, status: res.status, text }
  } catch (e) {
    return { ok: false, status: 0, text: '', error: String(e.message || e) }
  } finally {
    clearTimeout(timer)
  }
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeBingUrl(u) {
  if (!u) return ''
  if (u.startsWith('http')) return u
  return ''
}

// ───────────────────────── 搜索引擎解析 ─────────────────────────

function parseBing(html, limit) {
  const out = []
  const blocks = html.split(/<li class="b_algo"/).slice(1)
  for (const b of blocks) {
    if (out.length >= limit) break
    const m = b.match(/<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!m) continue
    const url = decodeBingUrl(m[1])
    const title = stripTags(m[2])
    const sm = b.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    const snippet = sm ? stripTags(sm[1]) : ''
    if (url && title) out.push({ title, url, snippet })
  }
  return out
}

function parseBaidu(html, limit) {
  const out = []
  const blocks = html.split(/<div[^>]+class="result[^"]*"/).slice(1)
  for (const b of blocks) {
    if (out.length >= limit) break
    const m = b.match(/<h3[^>]*class="[^"]*t[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
    if (!m) continue
    let url = m[1]
    const title = stripTags(m[2])
    const sm = b.match(/class="[^"]*(?:c-abstract|content-right_8Zs40)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span)>/i)
    const snippet = sm ? stripTags(sm[1]) : ''
    if (url && title) out.push({ title, url: url.startsWith('http') ? url : '', snippet })
  }
  return out
}

/** 通用解析：政府/新闻站点的列表页，抓所有链接 + 标题 */
function parseGenericLinks(html, limit) {
  const out = []
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{6,120}?)<\/a>/gi
  let m
  while ((m = re.exec(html)) && out.length < limit * 4) {
    const title = stripTags(m[2])
    const url = m[1]
    if (!title || !url) continue
    if (!CORE_KEYWORDS.some((k) => title.includes(k))) continue
    out.push({ title, url: url.startsWith('http') ? url : new URL(url, 'https://example.com').href, snippet: '' })
    if (out.length >= limit) break
  }
  return out
}

/**
 * 通用标题解析器：提取 h2/h3 内的结果链接，并在其后一定范围内寻找摘要。
 * 对 360 搜索、百度、必应等多种结果页都适用，鲁棒性优于针对单一站点的正则。
 */
function parseByHeadings(html, limit) {
  const out = []
  const re = /<h[23][^>]*>\s*<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(html)) && out.length < limit) {
    const title = stripTags(m[2])
    const url = m[1]
    const tail = html.slice(m.index, m.index + 3000)
    const dm = tail.match(
      /class="[^"]*(?:res-desc|res-rich|c-abstract|content-right|b_lineclamp|summary)[^"]*"[^>]*>([\s\S]{0,400}?)</,
    )
    const snippet = dm ? stripTags(dm[1]) : ''
    // 丢掉词典、百科、翻译类噪声
    if (title && url && !/百度百科|汉语|词典|翻译|金山词霸|汉典|文库|地图/.test(title)) {
      out.push({ title, url, snippet })
    }
  }
  return out
}

/** 抓取详情页正文，用于补全摘要（政府公示页尤其有用） */
async function fetchDetailText(url, max = 2000) {
  const r = await fetchText(url, 12000)
  if (!r.ok) return ''
  const body = r.text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const main =
    (body.match(/<(?:article|div)[^>]*(?:class|id)="[^"]*(?:content|article|main|detail|TRS_Editor|zoom)[^"]*"[^>]*>([\s\S]{0,8000}?)<\/(?:article|div)>/i) ||
      body.match(/<body[^>]*>([\s\S]{0,8000}?)<\/body>/i) || ['', body])[1]
  return stripTags(main).slice(0, max)
}

function cleanCdata(s) {
  return stripTags(String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '')).trim()
}

/** RSS 解析：结构化、无反爬，是首选数据源 */
function parseRss(xml, limit) {
  const out = []
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  for (const m of items) {
    if (out.length >= limit) break
    const title = cleanCdata((m[1].match(/<title>([\s\S]*?)<\/title>/) || [])[1])
    const url = ((m[1].match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim()
    const snippet = cleanCdata((m[1].match(/<description>([\s\S]*?)<\/description>/) || [])[1])
    if (title && url.startsWith('http')) out.push({ title, url, snippet })
  }
  return out
}

/**
 * 数据源优先级：
 *   1. bingRss   —— 必应搜索 RSS，中文可用、稳定、无反爬（实测首选）
 *   2. gnews     —— Google 新闻 RSS，海外环境可用，境内网络可能不通
 *   3. baidu     —— 百度网页搜索 HTML，反爬较强，失败会自动跳过
 *   4. bing      —— 必应网页搜索 HTML，中文识别不稳，作为兜底
 */
const ENGINES = {
  // 360 搜索：实测中文短语理解最好、反爬最弱，作为首选
  so360: {
    name: '360 搜索',
    build: (q) => `https://www.so.com/s?q=${encodeURIComponent(q)}`,
    parse: parseByHeadings,
  },
  bingRss: {
    name: '必应搜索',
    build: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}&format=rss`,
    parse: parseRss,
  },
  baidu: {
    name: '百度',
    build: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}&rn=20`,
    parse: parseByHeadings,
  },
  gnews: {
    name: 'Google 新闻',
    build: (q) =>
      `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`,
    parse: parseRss,
  },
  bing: {
    name: '必应网页',
    build: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=zh-CN&count=20`,
    parse: parseBing,
  },
}

/** 默认数据源：360 + 必应 RSS + 政府公示页 */
const DEFAULT_SOURCES = ['so360', 'bingRss', 'gov']

// ───────────────────────────── 规则初筛 ─────────────────────────────

function quickScore(item) {
  const text = `${item.title} ${item.snippet}`
  let score = 0
  const strong = STRONG_KEYWORDS.filter((k) => text.includes(k))
  score += strong.length * 25
  const core = CORE_KEYWORDS.filter((k) => text.includes(k))
  score += Math.min(core.length, 4) * 6
  if (/\d+(\.\d+)?\s*小时/.test(text)) score += 12
  if (/每周|周均|周休/.test(text)) score += 10
  if (NOISE.some((k) => text.includes(k))) score -= 40
  return Math.max(0, Math.min(100, score))
}

function guessEvidence(url, title) {
  if (/\.gov\.cn/i.test(url)) return 'A'
  if (MEDIA_TRUSTED.some((m) => title.includes(m) || url.includes(m))) return 'B'
  return 'C'
}

// ───────────────────────────── AI 提取 ─────────────────────────────

const EXTRACT_SYSTEM = `你是中国企业工时制度信息的结构化提取助手。
用户会给你若干条来自网页搜索的标题与摘要，你需要判断其中是否包含"具体企业 + 具体工时/休息制度"的信息。

只提取能明确指向某家企业的条目；政府文件、法律法规、泛泛而谈的讨论一律丢弃。
严格输出 JSON 数组，不要任何解释文字、不要 markdown 代码块。每个元素格式：
{
  "name": "企业全称",
  "industryId": 从 auto|tech3c|appliance|internet|food|retail|home|manufacturing|pharma|finance|edu|logistics|energy|culture|daily|telecom 中选一个最贴近的，无法判断填 other,
  "subIndustry": "细分领域，如 整车制造 / 银行营业网点",
  "products": "主要产品或业务线，逗号分隔，没有则空字符串",
  "productTypes": "产品类型标签，逗号分隔，没有则空字符串",
  "province": "省份，未知留空",
  "city": "城市，未知留空",
  "ownership": 央企/国企|民营企业|外资企业|合资企业|上市公司|其他 之一,
  "restPattern": standard|shift|flex|short|restrict|bigsmall|single 之一,
  "weeklyRestDays": 数字或 null,
  "weeklyHours": 数字或 null,
  "since": "生效时间如 2026-01，未知填 -",
  "scope": "覆盖范围，如 全员 / 总部职能岗",
  "policy": "客观描述该企业的具体休息制度，不超过 120 字，不要评价、不要臆测",
  "confidence": 0-100 的整数，表示你对该条目真实可靠的信心
}
restPattern 判定：standard=周六日固定休；shift=轮休/调休/综合计算工时制；flex=弹性或混合办公；short=四天/四天半等缩短工时；restrict=仅压降加班（强制下班、加班审批制）；bigsmall=大小周；single=单休。
若某条信息不足以提取，不要出现在输出里。`

async function aiExtract(items, attempt = 0) {
  if (!items.length) return []
  const payload = items
    .map((it, i) => `[${i}] 标题：${it.title}\n来源：${it.url}\n摘要：${(it.snippet || '').slice(0, 400)}`)
    .join('\n\n')

  const body = {
    model: AI_MODEL,
    temperature: 0.1,
    messages: [
      { role: 'system', content: EXTRACT_SYSTEM },
      { role: 'user', content: `请从以下 ${items.length} 条搜索结果中提取企业工时制度信息：\n\n${payload}` },
    ],
  }

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 120000)
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_KEY}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      // 429 / 5xx：指数退避重试，Agnes 代理有速率限制
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        const wait = [5000, 12000, 25000][attempt]
        console.log(`  [AI] HTTP ${res.status}，${wait / 1000}s 后重试（第 ${attempt + 1} 次）`)
        await sleep(wait)
        return aiExtract(items, attempt + 1)
      }
      throw new Error(`AI HTTP ${res.status}`)
    }
    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content || ''
    const m = content.match(/\[[\s\S]*\]/)
    if (!m) return []
    const arr = JSON.parse(m[0])
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    console.error(`  [AI] 提取失败：${e.message}`)
    return []
  }
}

/** 无 AI 时的降级：只用规则抽取企业名 */
function ruleExtract(item) {
  const text = `${item.title} ${item.snippet || ''}`
  const m =
    text.match(/([\u4e00-\u9fa5A-Za-z0-9（）()·]{2,20}(?:有限公司|股份有限公司|集团|科技|银行|汽车|电子|传媒))/g) || []
  const name = m[0]?.trim()
  if (!name) return null
  return {
    name,
    industryId: 'other',
    subIndustry: '',
    products: '',
    productTypes: '',
    province: '',
    city: '',
    ownership: '其他',
    restPattern: STRONG_KEYWORDS.some((k) => /综合计算工时|轮休|轮班|排班/.test(k) && text.includes(k))
      ? 'shift'
      : 'standard',
    weeklyRestDays: null,
    weeklyHours: null,
    since: '-',
    scope: '',
    policy: text.slice(0, 110),
    confidence: 50,
  }
}

// ───────────────────────────── 主流程 ─────────────────────────────

function loadExistingNames() {
  const p = resolve(ROOT, 'src/data/companies.ts')
  if (!existsSync(p)) return []
  const src = readFileSync(p, 'utf8')
  return [...src.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])
}

function loadPrevCandidates() {
  const p = resolve(OUT_DIR, 'candidates.json')
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf8')).candidates || []
  } catch {
    return []
  }
}

async function run() {
  const startedAt = new Date().toISOString()
  console.log(`[crawl] 开始于 ${startedAt}`)
  const onlySources = process.env.CRAWL_SOURCES
    ? process.env.CRAWL_SOURCES.split(',').map((s) => s.trim())
    : DEFAULT_SOURCES
  const useEngine = (k) => onlySources.includes(k)

  const raw = []

  // 1) 搜索引擎
  for (const [key, eng] of Object.entries(ENGINES)) {
    if (!useEngine(key)) continue
    console.log(`[${eng.name}] 开始抓取 ${QUERIES.length} 个关键词`)
    for (const q of QUERIES) {
      const url = eng.build(q)
      const r = await fetchText(url)
      if (!r.ok) {
        console.log(`  × "${q}" 失败 (${r.status || r.error})`)
        await sleep(1200)
        continue
      }
      const items = eng.parse(r.text, LIMIT)
      console.log(`  √ "${q}" → ${items.length} 条`)
      items.forEach((it) => raw.push({ ...it, site: eng.name, query: q }))
      await sleep(1000 + Math.random() * 1200)
    }
  }

  // 2) 政府公示页发现
  if (useEngine('gov')) {
    const eng = ENGINES.so360
    for (const q of GOV_DISCOVERY_QUERIES) {
      const r = await fetchText(eng.build(q))
      if (r.ok) {
        const items = eng.parse(r.text, LIMIT)
        console.log(`[gov] "${q}" → ${items.length} 条`)
        items.forEach((it) => raw.push({ ...it, site: '政府公示(发现)', query: q }))
      }
      await sleep(1200)
    }
    for (const g of GOV_SITES) {
      const r = await fetchText(g.url)
      if (!r.ok) continue
      const items = parseGenericLinks(r.text, LIMIT)
      console.log(`[gov] ${g.name} → ${items.length} 条`)
      items.forEach((it) => raw.push({ ...it, site: g.name, query: g.url }))
      await sleep(1000)
    }
  }

  // 3) 去重（URL）
  const seen = new Set()
  const unique = raw.filter((it) => {
    if (!it.url || seen.has(it.url)) return false
    seen.add(it.url)
    return true
  })
  console.log(`[crawl] 原始 ${raw.length} 条，URL 去重后 ${unique.length} 条`)

  // 4) 规则初筛
  const scored = unique
    .map((it) => ({ ...it, score: quickScore(it) }))
    .filter((it) => it.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
  console.log(`[crawl] 初筛通过 ${scored.length} 条（阈值 25）`)

  // 4.5 详情补全：抓正文填补缺失摘要，显著提升 AI 提取质量（政府公示页尤其有效）
  if (process.env.CRAWL_NO_DETAIL !== '1') {
    const top = scored.slice(0, Number(process.env.CRAWL_DETAIL_TOP || 16))
    console.log(`[crawl] 补全详情正文（最多 ${top.length} 条）`)
    for (const it of top) {
      if ((it.snippet || '').length >= 150) continue
      const body = await fetchDetailText(it.url)
      if (body) it.snippet = body.slice(0, 600)
      await sleep(500 + Math.random() * 700)
    }
  }

  // 5) AI 提取（分批，每批 8 条）
  const extracted = []
  if (NO_AI) {
    console.log('[crawl] CRAWL_NO_AI=1，跳过 AI，仅规则提取')
    for (const it of scored) {
      const e = ruleExtract(it)
      if (e) extracted.push({ ...e, _src: it })
    }
  } else {
    // 只把分数最高的前 N 条送 AI：Agnes 免费代理有速率限制，控制调用量
    const aiTop = scored.slice(0, Number(process.env.CRAWL_AI_TOP || 24))
    const BATCH = Number(process.env.CRAWL_AI_BATCH || 6)
    for (let i = 0; i < aiTop.length; i += BATCH) {
      const batch = aiTop.slice(i, i + BATCH)
      console.log(`[AI] 处理第 ${Math.floor(i / BATCH) + 1} 批（${batch.length} 条）`)
      const res = await aiExtract(batch)
      res.forEach((r, j) => extracted.push({ ...r, _src: batch[j] || batch[0] }))
      await sleep(Number(process.env.CRAWL_AI_GAP || 5000))
    }
  }

  // 兜底：AI 整轮失败（如限流）时回落到规则提取，保证每日仍有候选产出
  if (!NO_AI && extracted.length === 0) {
    console.log('[crawl] AI 提取为空（可能限流），回落规则提取兜底')
    for (const it of scored) {
      const e = ruleExtract(it)
      if (e) extracted.push({ ...e, _src: it })
    }
  }

  // 6) 组装候选
  const existingNames = loadExistingNames()
  const prev = loadPrevCandidates()
  const prevByKey = new Map(prev.map((p) => [`${p.name}|${p.sourceUrl}`, p]))
  const now = new Date().toISOString().slice(0, 10)

  const candidates = []
  const skipped = { noName: 0, alreadyExists: 0, lowConfidence: 0 }
  for (const e of extracted) {
    if (!e.name || e.name.length < 3) {
      skipped.noName += 1
      continue
    }
    if (existingNames.some((n) => n === e.name || n.includes(e.name) || e.name.includes(n))) {
      skipped.alreadyExists += 1
      continue
    }
    const src = e._src || {}
    const url = src.url || ''
    const key = `${e.name}|${url}`
    const prevItem = prevByKey.get(key)

    const ev = guessEvidence(url, src.title || '')
    let conf = Number(e.confidence) || 50
    if (ev === 'A') conf = Math.min(100, conf + 20)
    if (ev === 'C') conf = Math.max(0, conf - 10)
    if (e.weeklyHours !== null && e.weeklyHours !== undefined) conf = Math.min(100, conf + 10)
    // 无 AI 时规则提取本身置信度低，放宽门槛以便验证链路；有 AI 时从严
    const minConf = NO_AI ? 35 : 55
    if (conf < minConf) {
      skipped.lowConfidence += 1
      continue
    }

    candidates.push({
      id: `auto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: e.name,
      industryId: e.industryId || 'other',
      subIndustry: e.subIndustry || '',
      products: (e.products || '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
      productTypes: (e.productTypes || '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
      province: e.province || '',
      city: e.city || '',
      ownership: e.ownership || '其他',
      restPattern: e.restPattern || 'standard',
      weeklyRestDays: e.weeklyRestDays ?? null,
      weeklyHours: e.weeklyHours ?? null,
      since: e.since || '-',
      scope: e.scope || '',
      policy: e.policy || '',
      confidence: conf,
      evidence: ev,
      sourceUrl: url,
      sourceTitle: src.title || '',
      sourceSite: src.site || '',
      snippet: (src.snippet || '').slice(0, 300),
      capturedAt: now,
      status: prevItem?.status || 'pending',
    })
  }

  // 同名去重，保留置信度高的
  const byName = new Map()
  for (const c of candidates) {
    const cur = byName.get(c.name)
    if (!cur || c.confidence > cur.confidence) byName.set(c.name, c)
  }
  const finalCandidates = [...byName.values()].sort((a, b) => b.confidence - a.confidence).slice(0, 80)

  // 保留历史中已被人工处理的条目状态
  for (const p of prev) {
    if (p.status && p.status !== 'pending' && !finalCandidates.find((c) => c.name === p.name)) {
      finalCandidates.push(p)
    }
  }

  console.log(`[crawl] 丢弃统计：${JSON.stringify(skipped)}`)

  mkdirSync(OUT_DIR, { recursive: true })
  const output = {
    updatedAt: new Date().toISOString(),
    stats: {
      rawCollected: raw.length,
      afterDedupe: unique.length,
      afterFilter: scored.length,
      extracted: extracted.length,
      candidates: finalCandidates.length,
      aiEnabled: !NO_AI,
      sources: Object.keys(ENGINES).filter(useEngine).concat(useEngine('gov') ? ['gov'] : []),
    },
    candidates: finalCandidates,
  }
  writeFileSync(resolve(OUT_DIR, 'candidates.json'), JSON.stringify(output, null, 2), 'utf8')
  console.log(`[crawl] 完成，写入 ${finalCandidates.length} 条候选 → public/data/candidates.json`)
  console.log(`[crawl] 统计：${JSON.stringify(output.stats)}`)
}

run().catch((e) => {
  console.error('[crawl] 运行失败：', e)
  process.exit(1)
})
