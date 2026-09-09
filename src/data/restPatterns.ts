import type { RestPatternId } from '../types'

export interface RestPatternMeta {
  id: RestPatternId
  name: string
  short: string
  /** 是否满足「周休 ≥2 天且周均工时 ≤40 小时」的判定口径 */
  compliant: boolean | 'partial'
  legalBasis: string
  desc: string
  color: string
}

export const REST_PATTERNS: RestPatternMeta[] = [
  {
    id: 'standard',
    name: '标准双休',
    short: '周六日固定休',
    compliant: true,
    legalBasis: '《国务院关于职工工作时间的规定》第三条：职工每日工作 8 小时、每周工作 40 小时',
    desc: '周六、周日固定为休息日，每日 8 小时、每周 40 小时。最常见的合规形态。',
    color: '#166534',
  },
  {
    id: 'shift',
    name: '轮休 / 调休',
    short: '综合计算工时',
    compliant: true,
    legalBasis:
      '《劳动法》第三十九条 + 劳部发〔1994〕503 号《关于企业实行不定时工作制和综合计算工时工作制的审批办法》第六条',
    desc: '不固定在周六周日休息，而是以周/月/季/年为周期综合计算工时，采取集中工作、集中休息、轮休轮调。只要周期内平均周工时不超过法定标准且保证休息权，即属合法「双休」——这是很多人误以为不合规的部分。',
    color: '#1d4ed8',
  },
  {
    id: 'flex',
    name: '弹性 / 混合办公',
    short: '远程 + 到岗',
    compliant: true,
    legalBasis: '《劳动法》第三十六条、第三十八条',
    desc: '每周固定天数可自行选择办公地点，工时总量不变。休息天数仍为每周 2 天。',
    color: '#7c3aed',
  },
  {
    id: 'short',
    name: '缩短工时',
    short: '四天半 / 四天',
    compliant: true,
    legalBasis: '企业自主优于法定标准的福利性安排，法律不禁止',
    desc: '每周工作 4 天或 4.5 天，周均工时低于 40 小时。需注意是否伴随降薪——不降薪才算真正的工时改善。',
    color: '#0f766e',
  },
  {
    id: 'restrict',
    name: '加班管控',
    short: '限加班 / 强制下班',
    compliant: 'partial',
    legalBasis: '《劳动法》第四十一条：延长工时每月不超过 36 小时，需与工会和劳动者协商',
    desc: '通过强制下班、关闭食堂、加班审批制、周末禁会等手段压降加班。方向正确，但是否真正做到每周休满 2 天需看具体岗位，本站标注为「改善中」。',
    color: '#a16207',
  },
  {
    id: 'bigsmall',
    name: '大小周',
    short: '单双休交替',
    compliant: false,
    legalBasis: '《劳动法》第三十八条：用人单位应当保证劳动者每周至少休息一日',
    desc: '单周休 1 天、双周休 2 天，平均每周休 1.5 天。法律上仅踩住「每周至少休息一日」的底线，周均工时通常超过 40 小时，不属于完整双休。',
    color: '#b45309',
  },
  {
    id: 'single',
    name: '单休',
    short: '每周休 1 天',
    compliant: false,
    legalBasis: '《劳动法》第三十八条（法定最低要求）',
    desc: '每周仅休息 1 天。若同时做到每日不超过 8 小时、每周不超过 40 小时，则合法但不属于双休；若周工时超过 40 小时且未支付加班费，则涉嫌违法。',
    color: '#7f1d1d',
  },
]

export const PATTERN_MAP: Record<RestPatternId, RestPatternMeta> = Object.fromEntries(
  REST_PATTERNS.map((p) => [p.id, p]),
) as Record<RestPatternId, RestPatternMeta>

export const EVIDENCE_META: Record<'A' | 'B' | 'C', { label: string; desc: string; color: string }> = {
  A: {
    label: 'A · 官方 / 权威媒体',
    desc: '企业官方公告、官方媒体或主流财经媒体报道，可直接溯源',
    color: '#166534',
  },
  B: {
    label: 'B · 公开信息交叉',
    desc: '招聘平台公开信息、企业公开制度、多家媒体二次报道，可信但未见一手公告',
    color: '#1d4ed8',
  },
  C: {
    label: 'C · 网友口碑待核实',
    desc: '社媒/论坛员工集中反馈，尚未获官方或媒体确认，仅供参考',
    color: '#a16207',
  },
}
