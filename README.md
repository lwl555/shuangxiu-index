# 双休企业索引 · SHUANGXIU INDEX

收录中国境内公开可查的执行双休 / 轮休 / 弹性 / 缩短工时制度的企业，
按行业与产品类型分类，每条附来源链接与证据等级。

## 判定口径

「双休」不等于周六周日必须同时休。本站按三条硬指标判定：

1. 周均休息天数 ≥ 2 天（轮休、调休按综合计算工时制周期等效折算）
2. 周均工时 ≤ 40 小时
3. 特殊工时制度须经劳动行政部门审批

法律依据见站内「政策与判定」页，核心为《劳动法》第 36/38/39/41/44 条、
国务院令第 174 号（1995）、劳部发〔1994〕503 号、劳部发〔1995〕309 号、劳部发〔1997〕271 号。

## 证据等级

| 等级 | 含义 |
| --- | --- |
| A | 企业官方公告 / 官方媒体 / 主流财经媒体，可直接溯源 |
| B | 招聘平台公开信息、企业公开制度、多家媒体二次报道 |
| C | 社媒员工集中反馈，未获官方或媒体确认 |

缺失的数值字段一律显示为「—」，不做推测。

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 产出 dist/
npm run preview  # 预览构建产物
```

### 目录

```
src/
  data/
    companies.ts    企业主数据（新增公司改这里）
    industries.ts   行业分类
    restPatterns.ts 休息模式定义与法律依据
    benchmarks.ts   行业灰度对照
  lib/
    filters.ts      筛选与达标判定逻辑
    submit.ts       社区提交（localStorage + 可选远程端点）
  pages/
    Dashboard.tsx   总览
    Library.tsx     企业库
    Policy.tsx      政策与判定
    Industry.tsx    行业对照
    Submit.tsx      提交线索
    About.tsx       关于
```

### 接入远程提交后端（可选）

默认只写浏览器 localStorage。若要接真实后端（如 Supabase Edge Function），
新建 `.env` 并配置：

```
VITE_SUBMIT_ENDPOINT=https://xxxx.functions.supabase.co/xxx
```

`submitRemote()` 会自动改为 POST 提交，失败时回落到本地。

## 部署

静态站点，`base: './'` 已配置，dist 目录可直接放到任意静态托管 / GitHub Pages。
