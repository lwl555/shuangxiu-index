import { COMPANIES, LAST_UPDATED } from '../data/companies'
import { INDUSTRIES } from '../data/industries'
import { REST_PATTERNS } from '../data/restPatterns'

export default function About() {
  return (
    <div>
      <div className="border-b border-line pb-5">
        <h1 className="text-[22px] font-semibold tracking-tight">关于本站</h1>
        <p className="mt-1.5 max-w-[760px] text-[13px] leading-relaxed text-ink-2">
          这是一个公开信息整理工具，目标是让「哪些企业真正执行双休」这件事变得可查、可比对、可溯源。
        </p>
      </div>

      <section className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
        <div className="bg-paper p-4">
          <div className="kicker">收录企业</div>
          <div className="num mt-1 text-[24px] font-semibold">{COMPANIES.length}</div>
          <p className="mt-1 text-2xs text-ink-3">全部附来源链接</p>
        </div>
        <div className="bg-paper p-4">
          <div className="kicker">行业分类</div>
          <div className="num mt-1 text-[24px] font-semibold">{INDUSTRIES.length}</div>
          <p className="mt-1 text-2xs text-ink-3">每个行业标注细分与产品类型</p>
        </div>
        <div className="bg-paper p-4">
          <div className="kicker">休息模式</div>
          <div className="num mt-1 text-[24px] font-semibold">{REST_PATTERNS.length}</div>
          <p className="mt-1 text-2xs text-ink-3">含轮休、弹性、缩短工时</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="h-sec mb-3">为什么做这个</h2>
        <div className="space-y-3 text-[13.5px] leading-[1.85] text-ink-2">
          <p>
            1995 年 5 月 1 日我国就确立了双休日工作制，但很长一段时间里，这条规定在不少行业停留在纸面。
            2025 年以来情况开始变化：工信部、中国汽车工业协会先后表态整治「内卷式」竞争，
            一批头部企业主动取消大小周、强制下班、关闭周末食堂，加上
            <strong className="font-semibold">《欧盟市场禁止强迫劳动产品条例》2027 年底实施</strong>
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

      <section className="mt-8">
        <h2 className="h-sec mb-3">口径上的三个坚持</h2>
        <div className="space-y-px border border-line bg-line">
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
            <div key={x.t} className="bg-paper p-4">
              <div className="text-[14px] font-semibold">{x.t}</div>
              <p className="mt-1.5 text-[13px] leading-[1.8] text-ink-2">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-line bg-paper-2 p-4">
        <div className="kicker">免责声明</div>
        <div className="mt-2 space-y-2 text-[12.5px] leading-[1.8] text-ink-2">
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

      <p className="mt-6 text-2xs text-ink-3">数据版本更新于 {LAST_UPDATED}</p>
    </div>
  )
}
