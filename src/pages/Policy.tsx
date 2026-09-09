import { REST_PATTERNS } from '../data/restPatterns'
import { Tag } from '../components/Badge'

const LAWS = [
  {
    no: '《劳动法》第三十六条',
    title: '标准工时上限',
    text: '国家实行劳动者每日工作时间不超过八小时、平均每周工作时间不超过四十四小时的工时制度。',
    note: '1995 年国务院令第 174 号将标准进一步收紧为「每日工作 8 小时、每周工作 40 小时」，实践中以 40 小时为准。',
  },
  {
    no: '《劳动法》第三十八条',
    title: '每周至少休息一日',
    text: '用人单位应当保证劳动者每周至少休息一日。',
    note: '这是法律的强制性底线，不是「双休」。很多人误把这条当成双休的依据——它只保证 1 天。',
  },
  {
    no: '《劳动法》第三十九条',
    title: '特殊工时制度的合法出口',
    text: '企业因生产特点不能实行本法第三十六条、第三十八条规定的，经劳动行政部门批准，可以实行其他工作和休息办法。',
    note: '这条是「轮休也算双休」的总依据：法律本身就允许非周六周日的休息安排，前提是经批准。',
  },
  {
    no: '《劳动法》第四十一条',
    title: '延长工时的上限',
    text: '用人单位由于生产经营需要，经与工会和劳动者协商后可以延长工作时间，一般每日不得超过一小时；因特殊原因需要延长工作时间的，在保障劳动者身体健康的条件下延长工作时间每日不得超过三小时，但是每月不得超过三十六小时。',
  },
  {
    no: '《劳动法》第四十四条',
    title: '加班工资标准',
    text: '安排劳动者延长工作时间的，支付不低于工资的百分之一百五十的工资报酬；休息日安排劳动者工作又不能安排补休的，支付不低于工资的百分之二百的工资报酬；法定休假日安排劳动者工作的，支付不低于工资的百分之三百的工资报酬。',
  },
  {
    no: '国务院令第 174 号（1995）',
    title: '双休日工作制的确立',
    text: '自 1995 年 5 月 1 日起实行双休日工作制：国家机关、事业单位实行统一的工作时间，星期六和星期日为周休息日；职工每日工作 8 小时、每周工作 40 小时。因工作性质或者生产特点的限制，不能实行每日工作 8 小时、每周工作 40 小时标准工时制度的，按照国家有关规定，可以实行其他工作和休息办法。',
    note: '注意后半句——双休日工作制确立的同时就预留了「其他工作和休息办法」的口子。',
  },
  {
    no: '劳部发〔1994〕503 号 第五条',
    title: '综合计算工时的周期',
    text: '符合条件的行业（如受季节限制的旅游、建筑、制糖等）可按周、月、季、年等为周期综合计算工作时间，但其平均日工作时间和平均周工作时间应与法定标准工作时间基本相同。',
  },
  {
    no: '劳部发〔1994〕503 号 第六条',
    title: '轮休轮调的明文依据',
    text: '对于实行不定时工作制和综合计算工时工作制等其他工作和休息办法的职工，企业应根据《劳动法》有关规定，在保障职工身体健康并充分听取职工意见的基础上，采用集中工作、集中休息、轮休轮调、弹性工作时间等适当方式，确保职工的休息休假权利和生产、工作任务的完成。',
    note: '这是本站把轮休判定为合规双休的直接条文：白纸黑字写着「集中工作、集中休息、轮休轮调」。',
  },
  {
    no: '劳部发〔1997〕271 号 第五条',
    title: '综合工时制的加班认定',
    text: '在综合计算工时工作制的一个周期内，职工实际工作时间超过法定标准工作时间总时数的部分，视为延长工作时间，按《劳动法》第四十四条第一款支付 150% 工资报酬；法定休假日安排工作的按 300% 支付；延长工时平均每月不得超过 36 小时。',
    note: '综合工时制不是「免加班费金牌」——超了照样要给。',
  },
  {
    no: '劳部发〔1995〕309 号 第六十二条',
    title: '综合工时制下的休息日',
    text: '实行综合计算工时工作制的企业职工，工作日正好是周休息日的，属于正常工作；工作日正好是法定节假日时，要依照劳动法第四十四条第（三）项的规定支付职工的工资报酬。',
    note: '关键：轮休排班中被排在周六周日的班次属于正常工作，不计为休息日加班。',
  },
]

const FAQ = [
  {
    q: '轮休到底算不算双休？',
    a: '算，但有前提。法律上「双休」这个说法本身就容易被误读——《劳动法》第三十八条只要求每周至少休息一日，第三十九条又允许经批准实行「其他工作和休息办法」。劳部发〔1994〕503 号第六条明确写了企业可以采用「集中工作、集中休息、轮休轮调、弹性工作时间」。所以判断标准不是「周六周日有没有休息」，而是「在一个计算周期内，平均每周休息是否达到 2 天、平均每周工时是否不超过 40 小时」。满足了就是合规的等效双休。',
  },
  {
    q: '我每周只休 1 天，但每天只上 6.5 小时，这算双休吗？',
    a: '算等效达标，而且你的总工时比很多双休岗位还短。这是银行网点、医院、连锁零售最常见的排法：因为周末要对外营业，无法在周六周日集中休息，就通过压缩日工时（6.5 小时 × 5.5 天 ≈ 35.75 小时）来把周均工时压到 40 小时以内。本站把这类标记为「轮休等效达标」。判断时看周均工时，不要只看休息天数——法律对休息天数的强制底线只是每周至少 1 天。',
  },
  {
    q: '公司让我一周只休一天，合法吗？',
    a: '可能合法，也可能违法，取决于总工时。若每周工作 6 天但每天工时缩短、6 天加起来不超过 40 小时，且不违反「每周至少休息一日」，则符合法律要求；若总工时超过 40 小时且未支付加班费，则涉嫌违法。这一点上海市人社局有过明确解读。',
  },
  {
    q: '大小周算双休吗？',
    a: '不算。大小周平均每周只休 1.5 天，且周均工时通常超过 40 小时。它只踩住了「每周至少休息一日」的法定底线，属于合规但不达标的中间状态。',
  },
  {
    q: '综合计算工时制可以随便搞吗？',
    a: '不行。必须经劳动行政部门审批，并告知工会。未经审批自行实行综合工时制的，通常不被认可，超出的工时应按标准工时制支付加班费。',
  },
  {
    q: '「上四休三」一定更好吗？',
    a: '不一定，要看降不降薪。不降薪的四天工作制是实打实的工时改善；如果伴随降薪，本质上是企业缩减人力成本的方式——少排一天班就少发一天工资，劳动者的时薪反而可能下降，工作量也未必减少。本站收录的四天工作制企业均为不降薪案例。',
  },
  {
    q: '外企是不是一定双休？',
    a: '不一定，但在华外企办公室岗位普遍执行标准工时，加上《欧盟市场禁止强迫劳动产品条例》2027 年底生效的外部约束，外资企业及其供应链的工时合规压力更大。这也是为什么外企在双休榜单上占比较高的原因。',
  },
]

export default function Policy() {
  return (
    <div>
      <div className="border-b border-line pb-5">
        <h1 className="text-[22px] font-semibold tracking-tight">政策与判定标准</h1>
        <p className="mt-1.5 max-w-[760px] text-[13px] leading-relaxed text-ink-2">
          先把口径说清楚：本站不用「周六周日有没有一起休」来判断，而是用<strong className="font-semibold">周均休息天数</strong>
          和<strong className="font-semibold">周均工时</strong>两个硬指标。下面是完整的法律依据。
        </p>
      </div>

      {/* 判定口径 */}
      <section className="mt-6">
        <h2 className="h-sec mb-3">本站判定口径</h2>
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          <div className="bg-paper p-4">
            <div className="kicker">指标一 · 判定主轴</div>
            <div className="mt-1.5 text-[15px] font-semibold">周均工时 ≤ 40 小时</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">
              依据《劳动法》第三十六条与国务院令第 174 号。轮休、调休、排班制均按综合计算工时制的周期
              （周/月/季/年）折算为周均值，超出部分应依法支付加班费。
            </p>
          </div>
          <div className="bg-paper p-4">
            <div className="kicker">指标二 · 法定底线</div>
            <div className="mt-1.5 text-[15px] font-semibold">每周至少休息 1 天</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">
              《劳动法》第三十八条对休息天数的强制要求只是「每周至少休息一日」。
              休息天数不是否决项——每周休 1.5 天但周均工时 35 小时，法律上完全合规。
            </p>
          </div>
          <div className="bg-paper p-4">
            <div className="kicker">指标三 · 程序</div>
            <div className="mt-1.5 text-[15px] font-semibold">特殊工时须经审批</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">
              实行综合计算工时制或不定时工作制须经劳动行政部门审批并告知工会，未经审批的自行安排不予认可。
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-px border border-line bg-line md:grid-cols-5">
          {[
            { k: '达标', d: '周均工时 ≤40 小时且每周至少休 1 天', c: '#166534', bg: '#f0fdf4' },
            { k: '基本合规', d: '周均工时 40—44 小时，仍在第三十六条法定上限内', c: '#1d4ed8', bg: '#eff6ff' },
            { k: '改善中', d: '有明确加班管控，但工时未公开', c: '#a16207', bg: '#fefce8' },
            { k: '未达标', d: '周均工时超 44 小时，或每周休息不足 1 天', c: '#991b1b', bg: '#fef2f2' },
            { k: '数据不足', d: '关键数值缺失，本站不做推测', c: '#52525b', bg: '#f4f4f5' },
          ].map((x) => (
            <div key={x.k} className="bg-paper px-3.5 py-3">
              <Tag color={x.c} bg={x.bg} bd={x.c + '33'}>
                {x.k}
              </Tag>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 轮休等效 */}
      <section className="mt-8">
        <h2 className="h-sec mb-3">「轮休等效达标」是什么</h2>
        <div className="border border-line">
          <div className="border-b border-line bg-paper-2 p-4">
            <p className="text-[13.5px] leading-[1.85] text-ink-2">
              本站初版把「周休 ≥2 天」当作硬条件，后来发现这个口径会把一批法律上完全合规的轮休排班误判为不达标。
              最典型的是<strong className="font-semibold">建设银行福安支行对私营业网点</strong>
              ——员工每周只休 1~1.5 天，但日均工时压到 6.5 小时，周均工时只有 35.75~39 小时，
              官方回复明确认定「符合国家法律法规规定」。它比很多名义上的双休岗位工时还短。
            </p>
            <p className="mt-2 text-[13px] leading-[1.85] text-ink-2">
              所以本站把判定主轴改成了<strong className="font-semibold">周均工时</strong>：
              每周休满 2 天记「标准双休」，靠轮休 + 压缩日工时达标者记「轮休等效」，两者同样算达标。
            </p>
          </div>
          <div className="grid gap-px bg-line md:grid-cols-2">
            <div className="bg-paper p-4">
              <div className="kicker">样本 A · 压缩日工时型（达标）</div>
              <div className="mt-2 space-y-1 text-[13px] text-ink-2">
                <div>建设银行福安支行对私网点 · 月周期综合工时制</div>
                <div className="num">
                  每周休 1—1.5 天 · 日均 6.5 小时 · 周均 35.75—39 小时
                </div>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
                三种排班类型至少每季度轮换一次。休息天数少于 2 天，但周均工时低于 40 小时，达标。
              </p>
            </div>
            <div className="bg-paper p-4">
              <div className="kicker">样本 B · 连续生产轮班型（基本合规）</div>
              <div className="mt-2 space-y-1 text-[13px] text-ink-2">
                <div>中盐东兴盐化 · 四班三运转 · 综合工时制（政府公示）</div>
                <div className="num">8 天周期工作 6 天休 2 天 · 每班 8 小时 · 周均约 42 小时</div>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
                超过 40 小时但低于《劳动法》第三十六条的 44 小时上限，本站记「基本合规」——这也是绝大多数
                四班三倒企业的真实位置。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 轮休的边界 */}
      <section className="mt-6 border border-line bg-paper-2 p-4">
        <div className="kicker">轮休的边界：不是所有倒班都合规</div>
        <p className="mt-2 text-[13px] leading-[1.85] text-ink-2">
          轮休合法是有前提的，两个条件缺一不可：<strong className="font-semibold">经劳动行政部门审批</strong>，
          且<strong className="font-semibold">周期内平均工时不超过法定标准</strong>。
        </p>
        <p className="mt-2 text-[13px] leading-[1.85] text-ink-2">
          举一个反例（已匿名化）：某发电企业实行「四班三倒」，8 天周期内包含 2 个白班、2 个前夜班、
          1 个培训学习班、2 个后夜班，只在第 8 天休息——实际工作 7 天仅休 1 天，周均工时约 49 小时。
          这种排法同时踩了三条红线：违反第三十八条（无法保证每一日历周至少休息一日）、
          未经审批实行特殊工时、周均工时远超 44 小时。当地人社部门收到的举报中，
          还指出电力行业运行岗位一般应实行「五班四运转」或「五班三运转」。
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
          另一个常见误区是把法定节假日当普通工作日排进轮班——某钢铁企业的「四班三运转」就因这一点被法院
          判决支付加班费与节假日加班费。综合计算工时制不等于免加班费金牌。
        </p>
      </section>

      {/* 休息模式 */}
      <section className="mt-8">
        <h2 className="h-sec mb-3">七种休息模式的定义</h2>
        <div className="space-y-px border border-line bg-line">
          {REST_PATTERNS.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 bg-paper p-3.5 md:flex-row md:gap-5">
              <div className="md:w-[190px] md:shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ background: p.color }} />
                  <span className="text-[14px] font-semibold">{p.name}</span>
                </div>
                <div className="mt-1 text-2xs text-ink-3">{p.short}</div>
                <div className="mt-1.5">
                  <Tag
                    color={p.compliant === true ? '#166534' : p.compliant === 'partial' ? '#a16207' : '#991b1b'}
                    bd={p.compliant === true ? '#bbf7d0' : p.compliant === 'partial' ? '#fde68a' : '#fecaca'}
                    bg={p.compliant === true ? '#f0fdf4' : p.compliant === 'partial' ? '#fefce8' : '#fef2f2'}
                  >
                    {p.compliant === true ? '可判定达标' : p.compliant === 'partial' ? '需看具体数值' : '不达标'}
                  </Tag>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[13px] leading-relaxed text-ink-2">{p.desc}</p>
                <p className="mt-2 border-l-2 border-line-2 pl-2.5 text-2xs leading-relaxed text-ink-3">
                  依据：{p.legalBasis}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 法条 */}
      <section className="mt-8">
        <h2 className="h-sec mb-3">法律依据原文</h2>
        <div className="space-y-px border border-line bg-line">
          {LAWS.map((l) => (
            <div key={l.no} className="bg-paper p-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="num text-[13px] font-semibold">{l.no}</span>
                <span className="text-2xs text-ink-3">{l.title}</span>
              </div>
              <p className="mt-2 text-[13px] leading-[1.75] text-ink-2">{l.text}</p>
              {l.note && (
                <p className="mt-2 border-l-2 bg-paper-2 py-1.5 pl-2.5 text-[12px] leading-relaxed text-ink-3">
                  {l.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 常见问题 */}
      <section className="mt-8">
        <h2 className="h-sec mb-3">常见误区</h2>
        <div className="space-y-px border border-line bg-line">
          {FAQ.map((f, i) => (
            <details key={i} className="group bg-paper">
              <summary className="cursor-pointer list-none px-4 py-3 text-[13.5px] font-medium hover:bg-paper-2">
                <span className="num mr-2 text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                {f.q}
                <span className="float-right text-ink-3 group-open:rotate-45">+</span>
              </summary>
              <p className="border-t border-line px-4 py-3 pl-11 text-[13px] leading-[1.8] text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 外部压力 */}
      <section className="mt-8 border border-line bg-paper-2 p-4">
        <div className="kicker">外部变量</div>
        <h3 className="mt-1.5 text-[15px] font-semibold">《欧盟市场禁止强迫劳动产品条例》</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
          该条例将于 2027 年底实施，明确出口欧盟产品的任何环节均不得涉及强迫劳动，
          <strong className="font-semibold">每周超过 40 小时的加班即便员工自愿也在禁止之列</strong>。
          这意味着国内企业若不调整工时制度，出口欧盟将面临合规风险，供应链任一环节的超时加班都可能引发连锁反应。
          国家市场监管总局已于 2024 年 12 月发布「中国企业需警惕」提醒公告。
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
          这是本轮制造业工时调整最直接的外部驱动力之一，也解释了为什么改善最早出现在出口占比高的汽车、家电、消费电子行业。
        </p>
      </section>

      <section className="mt-6 border border-line p-4">
        <div className="kicker">维权渠道</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
          如遇到强制超时加班且不支付加班费的情况，可向企业所在地劳动保障监察机构投诉举报（12333 人力资源社会保障服务热线），
          或向劳动争议仲裁委员会申请仲裁。注意保留考勤记录、排班表、工资条、加班通知等证据。
        </p>
      </section>
    </div>
  )
}
