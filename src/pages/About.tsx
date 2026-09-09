import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { INDUSTRIES } from '../data/industries'
import { REST_PATTERNS } from '../data/restPatterns'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

export default function About() {
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="ABOUT"
        title="关于本站"
        desc="一个公开信息整理工具。我们想让「哪些公司真双休、哪些只是嘴上说说」这件事，变得可查、可比对、可溯源——找工作、做消费选择，都能少踩点坑。"
        icon="info"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { k: '收录企业', v: COMPANIES.length, sub: '全部附来源链接', i: 'building' },
          { k: '行业分类', v: INDUSTRIES.length, sub: '每个行业标注细分与产品类型', i: 'briefcase' },
          { k: '休息模式', v: REST_PATTERNS.length, sub: '含轮休、弹性、缩短工时', i: 'clock' },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Icon name={x.i as any} className="h-5 w-5" />
            </div>
            <div className="kicker mt-3">{x.k}</div>
            <div className="num mt-1 text-[28px] font-bold text-ink">{x.v}</div>
            <p className="mt-1 text-2xs font-medium text-ink-3">{x.sub}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="heart" className="h-5 w-5 text-rose-600" />
          <h2 className="h-sec">为什么做这个</h2>
        </div>
        <div className="space-y-3 rounded-2xl border border-line bg-white p-5 text-[14px] leading-[1.85] text-ink-2 shadow-soft">
          <p>
            双休日工作制 1995 年 5 月 1 日就写进了国家规定，可快三十年了，很多人还是没真正休上。
            2025 年以来情况开始变化：工信部、中国汽车工业协会先后表态整治「内卷式」竞争，
            一批头部企业主动取消大小周、强制下班、关闭周末食堂，加上
            <strong className="font-semibold text-ink">《欧盟市场禁止强迫劳动产品条例》2027 年底实施</strong>
            带来的出口合规压力，工时制度正在从「卷时长」转向「卷效率」。
          </p>
          <p>
            但公开信息是散的：今天这家车企宣布双休，明天那家工厂被曝强制下班，中间夹杂着大量未经核实的传言。
            消费者想「用购买支持双休企业」，求职者想知道哪些公司真的不加班，都缺少一个能查的地方。
          </p>
          <p>
            本站做的就是把这些散落信息收拢起来，统一口径、标注来源、按行业和产品分类，
            让「双休」这件事可以被检索，而不是停留在情绪里。
          </p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="shield" className="h-5 w-5 text-rose-600" />
          <h2 className="h-sec">口径上的三个坚持</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: '轮休也算双休',
              d: '《劳动法》第三十九条与劳部发〔1994〕503 号第六条明确允许「集中工作、集中休息、轮休轮调」。判断标准是周期内的周均休息天数与周均工时，不是日历上的周六周日。',
            },
            {
              t: '没有数据就写「—」',
              d: '周均休息天数或工时未公开的企业，一律留空并显示「数据不足」，不做推测、不给估计值。宁可少收，不可编造。',
            },
            {
              t: '区分岗位，不搞一刀切',
              d: '同一家企业里，总部职能岗标准双休、门店一线排班轮休、产线三班倒是常态。本站记录具体覆盖范围，不做整体定性。',
            },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="text-[15px] font-bold text-ink">{x.t}</div>
              <p className="mt-2 text-[13px] leading-[1.8] text-ink-2">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper-2 p-5">
        <div className="kicker">免责声明</div>
        <div className="mt-2 space-y-2 text-[13px] leading-[1.8] text-ink-2">
          <p>
            本站内容均整理自公开渠道，不构成对企业的评价、评级、推荐或投资建议，也不构成法律意见。
            企业制度会随时调整，本站无法保证信息的实时性与完整性。
          </p>
          <p>
            标注为「C 级证据 · 网友口碑待核实」的条目尚未获官方或媒体确认，仅供参考，不应作为决策依据。
          </p>
          <p>
            如认为某条目信息有误或侵犯合法权益，请通过提交线索页说明情况并附证明材料，核实后会及时更正或下架。
          </p>
        </div>
      </section>

      <p className="text-2xs font-medium text-ink-3">数据版本更新于 {LAST_UPDATED}</p>
    </div>
  )
}
