import { useMemo, useState } from 'react'
import { INDUSTRIES } from '../data/industries'
import { REST_PATTERNS, EVIDENCE_META } from '../data/restPatterns'
import { loadSubmissions, submitRemote, exportSubmissionsJson, saveReviewed, loadReviewed, submissionToCompany, type Submission } from '../lib/submit'
import type { RestPatternId } from '../types'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

const OWNERSHIPS = ['央企/国企', '民营企业', '外资企业', '合资企业', '上市公司', '其他']

const empty = {
  name: '',
  industryId: '',
  subIndustry: '',
  products: '',
  productTypes: '',
  province: '',
  city: '',
  ownership: '',
  restPattern: 'standard' as RestPatternId,
  weeklyRestDays: '',
  weeklyHours: '',
  since: '',
  scope: '',
  policy: '',
  sourceUrl: '',
  sourceTitle: '',
  contact: '',
}

export default function Submit() {
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [reload, setReload] = useState(0)
  const subs = useMemo(() => loadSubmissions(), [reload])

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setMsg({ type: 'err', text: '企业名称为必填项' })
    if (!form.policy.trim()) return setMsg({ type: 'err', text: '请简要说明具体的休息制度，空泛描述无法通过审核' })
    const s: Submission = {
      ...form,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    const r = await submitRemote(s)
    setMsg({
      type: 'ok',
      text: r.via === 'remote' ? '已提交至远程审核队列' : '已保存到本地审核队列（未配置远程端点）',
    })
    setForm(empty)
    setReload((n) => n + 1)
  }

  function publish(s: Submission) {
    const cur = loadReviewed()
    if (cur.find((c) => c.id === `sub-${s.id}`)) return
    saveReviewed([submissionToCompany(s), ...cur])
    setReload((n) => n + 1)
    setMsg({ type: 'ok', text: `「${s.name}」已上线到企业库（仅本机可见，重新部署需同步数据）` })
  }

  function download() {
    const blob = new Blob([exportSubmissionsJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `shuangxiu-submissions-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="SUBMIT"
        title="提交线索"
        desc={
          <>
            收录范围不设门槛，但<strong className="font-semibold text-ink">必须有可溯源的信息</strong>。
            附来源链接（企业公告、官方媒体、招聘信息）的条目会被标为更高证据等级并优先通过；
            纯口头传闻也可以提交，但会明确标注为待核实。
          </>
        }
        icon="zap"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="kicker mb-4">基本信息</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">企业名称 *</span>
                <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="如：某某科技有限公司" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">细分领域</span>
                <input className="field" value={form.subIndustry} onChange={(e) => set('subIndustry', e.target.value)} placeholder="如：集成电路 / 区域商超 / 在线旅游" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">行业</span>
                <select className="field h-[40px]" value={form.industryId} onChange={(e) => set('industryId', e.target.value)}>
                  <option value="">请选择</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">企业性质</span>
                <select className="field h-[40px]" value={form.ownership} onChange={(e) => set('ownership', e.target.value)}>
                  <option value="">请选择</option>
                  {OWNERSHIPS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">省份</span>
                <input className="field" value={form.province} onChange={(e) => set('province', e.target.value)} placeholder="如：广东" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">城市</span>
                <input className="field" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="如：深圳" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="kicker mb-4">产品与类型</div>
            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">主要产品 / 业务线（逗号分隔）</span>
                <input className="field" value={form.products} onChange={(e) => set('products', e.target.value)} placeholder="如：扫地机器人,洗地机,擦窗机器人" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">产品类型标签（逗号分隔）</span>
                <input className="field" value={form.productTypes} onChange={(e) => set('productTypes', e.target.value)} placeholder="如：清洁电器,智能家居,服务机器人" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="kicker mb-4">休息制度</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">休息模式</span>
                <select className="field h-[40px]" value={form.restPattern} onChange={(e) => set('restPattern', e.target.value)}>
                  {REST_PATTERNS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}（{p.short}）
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">生效时间</span>
                <input className="field" value={form.since} onChange={(e) => set('since', e.target.value)} placeholder="如：2026-01 或留空" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">周均休息天数</span>
                <input className="field" value={form.weeklyRestDays} onChange={(e) => set('weeklyRestDays', e.target.value)} placeholder="如：2" inputMode="decimal" />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">周均工时（小时）</span>
                <input className="field" value={form.weeklyHours} onChange={(e) => set('weeklyHours', e.target.value)} placeholder="如：40" inputMode="decimal" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">覆盖范围</span>
                <input className="field" value={form.scope} onChange={(e) => set('scope', e.target.value)} placeholder="如：全员 / 总部职能岗 / 深圳工厂" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">制度描述 *</span>
                <textarea
                  className="field min-h-[110px] resize-y leading-relaxed"
                  value={form.policy}
                  onChange={(e) => set('policy', e.target.value)}
                  placeholder="请写具体安排：哪天休、几点下班、加班是否需要审批、是否降薪、是否有官方文件。"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="kicker mb-4">来源（强烈建议填写）</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">来源链接</span>
                <input className="field" value={form.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} placeholder="https://..." />
              </label>
              <label className="block">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">来源标题 / 发布方</span>
                <input className="field" value={form.sourceTitle} onChange={(e) => set('sourceTitle', e.target.value)} placeholder="如：某某日报 2026-01-08" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-2xs font-semibold text-ink-3">联系方式（可选，仅用于核实信息）</span>
                <input className="field" value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="邮箱或微信" />
              </label>
            </div>
            {msg && (
              <div
                className="mt-4 rounded-xl border px-3 py-2 text-[13px] font-medium"
                style={{
                  borderColor: msg.type === 'ok' ? '#a7f3d0' : '#fecdd3',
                  background: msg.type === 'ok' ? '#ecfdf5' : '#fff1f2',
                  color: msg.type === 'ok' ? '#047857' : '#be123c',
                }}
              >
                {msg.text}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button type="submit" className="btn">
                提交线索
              </button>
              <button type="button" onClick={() => setForm(empty)} className="btn-ghost">
                重置
              </button>
            </div>
          </section>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="kicker mb-3">证据等级怎么定</div>
            <div className="space-y-3">
              {(['A', 'B', 'C'] as const).map((k) => (
                <div key={k} className="rounded-xl bg-paper-2 p-3">
                  <div className="text-[13px] font-bold" style={{ color: EVIDENCE_META[k].color }}>
                    {EVIDENCE_META[k].label}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{EVIDENCE_META[k].desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-2 p-5">
            <div className="kicker mb-3">我们不收录什么</div>
            <ul className="space-y-2 text-[12.5px] leading-relaxed text-ink-3">
              <li className="flex gap-2"><span className="text-rose-500">·</span>无法溯源的企业名称</li>
              <li className="flex gap-2"><span className="text-rose-500">·</span>仅凭「听说」且无任何佐证的单休指控</li>
              <li className="flex gap-2"><span className="text-rose-500">·</span>带有情绪化定性或人身攻击的表述</li>
              <li className="flex gap-2"><span className="text-rose-500">·</span>涉及个人隐私的内部文件截图</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="kicker">本地队列（{subs.length}）</span>
              <button onClick={download} className="text-2xs font-semibold text-rose-600 underline decoration-rose-200 hover:text-rose-700">
                导出 JSON
              </button>
            </div>
            {subs.length === 0 ? (
              <p className="text-[13px] text-ink-3">暂无提交记录</p>
            ) : (
              <div className="scroll-thin max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {subs.map((s) => (
                  <div key={s.id} className="rounded-xl border border-line bg-paper-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-ink">{s.name}</div>
                        <div className="mt-0.5 text-2xs text-ink-3">
                          {s.createdAt.slice(0, 10)}
                          {s.sourceUrl ? ' · 有来源' : ' · 无来源'}
                        </div>
                      </div>
                      <button
                        onClick={() => publish(s)}
                        className="shrink-0 rounded-lg border border-line-2 bg-white px-2 py-1 text-2xs font-medium text-ink-3 transition-colors hover:border-rose-200 hover:text-rose-600"
                      >
                        上线
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-2xs leading-relaxed text-ink-3">
              「上线」会把条目加入本机企业库并标注为待核实，刷新后仍在本机。要让所有人看到，需要把导出的 JSON
              合并进主数据文件后重新部署。
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
