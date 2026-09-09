import type { IndustryBenchmark } from '../types'

/**
 * 行业灰度对照
 * ------------
 * 只呈现行业层面的公开统计与趋势，不指向具体企业。
 * monthlyOtHours 为 null 表示未找到可信的公开统计，不做推测。
 */
export const BENCHMARKS: IndustryBenchmark[] = [
  {
    industryId: 'auto',
    monthlyOtHours: [70, 100],
    status: '加班重灾区，2026 年起出现拐点。自主品牌加班强度显著高于合资企业，「8—10—6」曾一度是常态。2026 年 1 月长城汽车取消大小周、全员双休被视为分水岭事件，比亚迪、蔚来、理想等同步收紧周末加班审批。',
    trend: '改善',
    drivers: [
      '2025 年 5 月 31 日中国汽车工业协会、工信部先后表态，直指无序价格战等内卷式竞争',
      '《欧盟市场禁止强迫劳动产品条例》2027 年底实施：出口欧盟产品任何环节每周超 40 小时的加班即便自愿也在禁止之列',
      '国内新能源品牌平均研发周期 1.6 年 vs 外国品牌 5.4 年，工时竞赛难以为继',
    ],
    sources: [
      { title: '风向变了！多家知名企业带头「反内卷」', url: 'https://news.qq.com/rain/a/20260109A073H200', date: '2026-01-09', publisher: '腾讯新闻' },
      { title: '观点丨落实「双休」不应是喜讯，而是回归常态的应有动作', url: 'https://k.sina.com.cn/article_2010666107_77d8547b02001gtma.html', date: '2026-01', publisher: '新浪新闻' },
    ],
  },
  {
    industryId: 'tech3c',
    monthlyOtHours: null,
    status: '头部企业率先以「强制下班」方式切断加班。深圳总部 21 点清场、上海办公楼关灯断电等物理手段成为标志性做法。改善集中在总部与研发，代工与产线端仍存差异。',
    trend: '改善',
    drivers: [
      '出口合规压力：欧盟反强迫劳动法案覆盖供应链全环节',
      '研发产出密度与工时脱钩，内部数据反而显示效率提升',
    ],
    sources: [
      { title: '大疆启动「强制21点下班」政策', url: 'https://www.sznews.com/news/content/2025-03/10/content_31484553.htm', date: '2025-03-10', publisher: '深圳新闻网' },
    ],
  },
  {
    industryId: 'appliance',
    monthlyOtHours: null,
    status: '白电三巨头动作最系统：直接下发双休通知、关闭周末食堂、18:20 后清场。制造业中以「切断加班后勤保障」倒逼休息的做法始于此行业。',
    trend: '改善',
    drivers: [
      '以反形式主义为抓手的效率改革（禁用 PPT、减少手工报表、会议限时）',
      '提前一周加班审批制，工作日加班不超过 3 小时/天',
    ],
    sources: [
      { title: '大疆启动「强制21点下班」政策', url: 'https://www.sznews.com/news/content/2025-03/10/content_31484553.htm', date: '2025-03-10', publisher: '深圳新闻网' },
    ],
  },
  {
    industryId: 'internet',
    monthlyOtHours: null,
    status: '曾是 996 重灾区，2021 年字节跳动、快手取消大小周后双休成为头部标配。但「隐形加班」争议仍在：居家办公、线上夜校、家庭工位等新形态模糊了工作边界。',
    trend: '改善',
    drivers: [
      '2021 年头部企业集体取消大小周',
      '2025 年起转向薪酬改善：字节奖金提升 35%、京东采销平均 25 薪',
      '混合办公（携程 3+2）成为可复制样本',
    ],
    sources: [
      { title: '大疆启动「强制21点下班」政策', url: 'https://www.sznews.com/news/content/2025-03/10/content_31484553.htm', date: '2025-03-10', publisher: '深圳新闻网' },
    ],
  },
  {
    industryId: 'manufacturing',
    monthlyOtHours: null,
    status:
      '出口主力，也是欧盟新规的重点监管对象，头部制造企业普遍提前收紧工时，周末加班需提前一周审批、足额支付加班费。连续生产型子行业（化工、造纸、盐业、钢铁、半导体晶圆）适用综合计算工时制，四班三运转是主流排法，周均工时通常在 40—44 小时之间——略高于 40 小时标准但仍在《劳动法》第三十六条的法定上限内，本站判定为「基本合规」。半导体与集成电路行业出现了「周五带薪休假」等缩短工时试点。',
    trend: '改善',
    drivers: [
      '国家市场监管总局 2024 年 12 月发布「中国企业需警惕」提醒公告',
      '欧盟合规倒逼供应链全环节工时审查',
      '劳部发〔1994〕503 号第六条明确允许「集中工作、集中休息、轮休轮调」',
      '四班三倒相比三班倒休息天数显著增加（月休 7—8 天 vs 4 天）',
    ],
    sources: [
      { title: '公司「上四休三」但降工资……网友吵翻', url: 'https://www.toutiao.com/article/7662191693903348259', date: '2026-07-14', publisher: '深圳龙岗发布' },
      { title: '中盐东兴盐化股份有限公司非标准工时公示', url: 'https://www.dingyuan.gov.cn/public/161054654/1112861939.html', date: '2025-12', publisher: '定远县人民政府' },
    ],
  },
  {
    industryId: 'retail',
    monthlyOtHours: null,
    status: '门店一线普遍为排班轮休（综合计算工时制），与总部职能岗的标准双休差异明显。判断该行业是否「双休」要看具体岗位而非公司整体。',
    trend: '持平',
    drivers: ['门店营业时间连续性要求决定了一线必须排班', '区域商超标杆企业将工时合规延伸至供应商筛查'],
    sources: [
      { title: '上有老下有小，以后买双休企业的产品', url: 'https://www.toutiao.com/article/7682414218775183895', date: '2026-09-06', publisher: '今日头条' },
    ],
  },
  {
    industryId: 'food',
    monthlyOtHours: null,
    status: '总部职能岗双休较普遍，一线销售、导购、产线岗多为轮班调休。同一家企业内总部与一线的制度差异是主要矛盾点。',
    trend: '持平',
    drivers: ['快消业销售体系天然弹性', '产线受订单淡旺季影响，多适用综合工时制'],
    sources: [
      { title: '什么公司双休', url: 'https://aiqicha.baidu.com/details/ugknowledge?id=377c611a3138b1d67257acbcb7898944', date: '2026-08-31', publisher: '爱企查' },
    ],
  },
  {
    industryId: 'energy',
    monthlyOtHours: null,
    status: '电力、电网、工业气体等连续性生产企业适用综合计算工时制，一线为轮班轮休；职能岗标准双休。动力电池龙头 2025 年底转向全员涨薪。',
    trend: '改善',
    drivers: ['连续生产特性决定轮班制合法存在', '新能源产业链受出口合规压力传导'],
    sources: [
      { title: '风向变了！多家知名企业带头「反内卷」', url: 'https://news.qq.com/rain/a/20260109A073H200', date: '2026-01-09', publisher: '腾讯新闻' },
    ],
  },
  {
    industryId: 'telecom',
    monthlyOtHours: null,
    status: '营业厅、客服、网络运维为排班轮休；行政财务岗标准双休。属于「同一公司两种制度」的典型。',
    trend: '持平',
    drivers: ['服务连续性要求'],
    sources: [
      { title: '什么公司双休', url: 'https://aiqicha.baidu.com/details/ugknowledge?id=377c611a3138b1d67257acbcb7898944', date: '2026-08-31', publisher: '爱企查' },
    ],
  },
  {
    industryId: 'finance',
    monthlyOtHours: null,
    status:
      '银行业是「轮休」制度最成熟的行业，也是本站收录政府批复文件最多的行业。对公网点的对公业务跟随机关作息，执行标准工时制；对私网点因周末照常营业，经批准执行以月为周期的综合计算工时工作制，靠弹性排班解决轮休。月工时上限通常被批复明确写死（如某地批复为 166.64 小时/月，约合周均 38.5 小时）。',
    trend: '持平',
    drivers: [
      '《劳动法》第三十九条 + 劳部发〔1994〕503 号，银行网点是最早大规模获批综合工时制的行业之一',
      '服务连续性要求决定了周末必须营业，只能靠压缩日工时或轮班平衡',
      '多地人社部门的公开答复显示，网点「周休 1—1.5 天 + 日均 6.5 小时」的排法被认定为合规',
    ],
    sources: [
      {
        title: '关于同意宁夏贺兰农村商业银行股份有限公司实行综合计算工时工作制的函',
        url: 'https://zwfw.nx.gov.cn/zwcontent.jsp?urltype=news.NewsContentUrl&wbtreeid=5409&wbnewsid=91096',
        date: '2021-09-16',
        publisher: '银川市审批服务管理局',
      },
      {
        title: '建设银行福安支行关于网点员工工作时间问题的公开答复',
        url: 'http://www.mnw.cn/news/fj/817845.html',
        date: '—',
        publisher: '闽南网',
      },
    ],
  },
  {
    industryId: 'pharma',
    monthlyOtHours: null,
    status:
      '外资药企与医疗器械公司在工作生活平衡（WLB）榜单上长期位居前列，普遍准点下班、15—25 天年假、每周 1—2 天居家。本土药企与 CRO 差异较大，医药代表与生产岗另计。',
    trend: '持平',
    drivers: ['外企总部合规体系直接约束在华实体', '行业毛利高、人力成本敏感度相对低'],
    sources: [
      { title: '广州这些外企还是很值得去的！', url: 'https://www.hanlefang.net/xiu-ctgtxtnbnbgdcdxntg.html', date: '2026', publisher: ' hanlefang' },
      { title: '北京好的外企', url: 'https://aiqicha.baidu.com/details/ugknowledge?id=cea33a601a9ed8f8ca1b33f6ac6bf2d1', date: '2026', publisher: '爱企查' },
    ],
  },
  {
    industryId: 'daily',
    monthlyOtHours: null,
    status:
      '快消与日化是外企密度最高的行业之一，宝洁、联合利华、玛氏、汉高、金佰利等普遍执行 965 + 弹性打卡 + 18 天起年假。本土快消企业的总部职能岗多为双休，但销售与一线导购通常为轮班/调休。',
    trend: '持平',
    drivers: ['外企总部制度平移', '行业成熟、流程标准化程度高，加班边际收益低'],
    sources: [
      { title: '广州这些外企还是很值得去的！', url: 'https://www.hanlefang.net/xiu-ctgtxtnbnbgdcdxntg.html', date: '2026', publisher: ' hanlefang' },
    ],
  },
  {
    industryId: 'culture',
    monthlyOtHours: null,
    status:
      '内容行业工时弹性极大，很难用统一标准衡量。值得注意的是出现了以「缩短工时」为组织设计起点的公司——国内首家四天工作制公司就诞生在这个行业。',
    trend: '改善',
    drivers: ['内容产出难以用工时衡量，结果导向更容易成立', '小团队试错成本低，新型工时制度的试验田'],
    sources: [
      { title: '上四休三不是福利，是一道经济分裂的分水岭', url: 'https://so.html5.qq.com/page/real/search_news?docid=70000021_4996a7961c669252', date: '2026', publisher: '腾讯新闻' },
    ],
  },
]

export const BENCHMARK_MAP: Record<string, IndustryBenchmark> = Object.fromEntries(
  BENCHMARKS.map((b) => [b.industryId, b]),
)
