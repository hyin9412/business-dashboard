import { useMemo, useState } from 'react'
import { Button, Card, Drawer, Empty, Select, Table, Tabs, Tag, Tooltip } from '@tod-m/materials/ve-o'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { TableColumnProps } from '@tod-m/materials/ve-o/es/Table'
import './App.css'

type PageView = 'home' | 'detail'
type ProductOption = {
  label: string
  value: string
  diagnosis: string
  issueCount: number
  issueMetrics: string[]
}
type BaseConfigItem = {
  key: string
  title: string
  status: string
  passed: boolean
  detail: string
}
type EvaluationRow = {
  key: string
  dimension: string
  metric: string
  status: '达标' | '不达标'
  statusTone: 'green' | 'red'
  current: string
  target: string
  reasonKey?: 't-plus-one'
}
type RankingItem = {
  key: string
  rank: number
  name: string
  issueCount: number
  metrics: string[]
}
type GovernanceRow = {
  key: string
  reason: string
  products: string[]
  dimensions: string[]
}
type HomeTone = 'positive' | 'warning' | 'danger'
type HomeDimensionStatus = {
  label: string
  value: string
  tone: HomeTone
}
type HomeMetricBar = {
  label: string
  value: number
  children?: Array<{
    label: string
    value: number
  }>
}
type HomeIssueItem = {
  key: string
  title: string
  metric: string
  product?: string
}
type HomeBoardRow = {
  key: string
  rank: number
  product: string
  amount: string
  ratio: string
  dayChange: string
  trend: 'up' | 'flat' | 'down'
}
type HomeGoalProgress = {
  title: string
  targetLabel: string
  actualLabel: string
  value: string
  unit: string
  status: string
  progress: number
  threshold: number
}

const primaryMenus = ['经营工作台', '收益管理', '商品管理', '商品询价', 'APP事件', '插件汇总', '账号管理', '监控事件', '财务管理', '指标管理'] as const
const homeTabs = ['个人视图', '产品线视图', '商品视图', 'App视图'] as const
const homeMetrics = [
  { label: '收入', value: '2,009.34万元', info: '环比上涨 15.15%', delta: '+1.13%' },
  { label: '成本', value: '1,801.34万元', info: '环比上涨 15.15%', delta: '+1.13%' },
  { label: '利润', value: '208万元', info: '环比上涨 15.15%', delta: '+1.13%' },
  { label: '成本利润率', value: '11.55%', info: '环比上涨 15.1%', delta: '+1.13%' },
] as const
const homeBoardRows: HomeBoardRow[] = [
  { key: 'row-1', rank: 1, product: '创意互动Vlog-标准平台服务', amount: '6.22万元', ratio: '1.44%', dayChange: '18.70%', trend: 'up' },
  { key: 'row-2', rank: 2, product: '创意互动Vlog-视频存储增项包', amount: '7.36万元', ratio: '9.24%', dayChange: '18.70%', trend: 'up' },
  { key: 'row-3', rank: 3, product: '图片配文', amount: '5.76万元', ratio: '7.84%', dayChange: '18.70%', trend: 'up' },
  { key: 'row-4', rank: 4, product: '视频画质评分', amount: '4.04万元', ratio: '5.89%', dayChange: '18.70%', trend: 'up' },
  { key: 'row-5', rank: 5, product: '车牌检测', amount: '2.80万元', ratio: '4.99%', dayChange: '0.00%', trend: 'flat' },
  { key: 'row-6', rank: 6, product: '字节跳动大模型服务（豆包大模型）', amount: '1.88万元', ratio: '1.44%', dayChange: '18.70%', trend: 'up' },
  { key: 'row-7', rank: 7, product: '智能数据洞察-私部订阅', amount: '1.88万元', ratio: '4.82%', dayChange: '0.00%', trend: 'flat' },
  { key: 'row-8', rank: 8, product: '云数据库 PostgreSQL 版', amount: '1.88万元', ratio: '4.82%', dayChange: '-19.88%', trend: 'down' },
  { key: 'row-9', rank: 9, product: '跨域宽带（电信）', amount: '1.88万元', ratio: '4.82%', dayChange: '-82.64%', trend: 'down' },
  { key: 'row-10', rank: 10, product: '云服务器-自动驾驶云', amount: '1.88万元', ratio: '4.82%', dayChange: '-82.64%', trend: 'down' },
]
const homeGoalProgress: HomeGoalProgress = {
  title: '目标进度',
  targetLabel: '管理目标',
  actualLabel: '实际值',
  value: '192,393.12',
  unit: '元',
  status: '正常',
  progress: 28,
  threshold: 27.5,
}
const productOptions: ProductOption[] = [
  {
    label: '视频直播',
    value: 'C30489',
    diagnosis: '定价稳定偏差不大，账单准但及时性有待提升',
    issueCount: 4,
    issueMetrics: ['T+1 计量能力', '回溯金额', '成本利润率', '最终未处理异常金额'],
  },
  {
    label: '云点播',
    value: 'C12567',
    diagnosis: '定价稳定，账单准确且及时',
    issueCount: 3,
    issueMetrics: ['成本配置无异常', '大区收支均衡度', '监控报警合理'],
  },
  {
    label: '实时音视频',
    value: 'C67210',
    diagnosis: '定价波动较大，账单及时性与准确性需持续治理',
    issueCount: 5,
    issueMetrics: ['T+1 计量能力', '半年周期调价次数', '回溯金额', '调账次数-商品方计量问题', '基础配置整体状态'],
  },
  {
    label: '图片图文',
    value: 'C77880',
    diagnosis: '基础配置存在缺口，建议优先补齐文档与利润率治理',
    issueCount: 2,
    issueMetrics: ['计费信息文档完整准确', '成本利润率'],
  },
  {
    label: '对象存储标准版',
    value: 'P10298',
    diagnosis: '账单准确性存在多项异常，需要尽快进入专项治理',
    issueCount: 6,
    issueMetrics: ['T+1 计量能力', '成本配置无异常', '大区收支均衡度', '回溯金额', '调账次数-商品方计量问题', '最终未处理异常金额'],
  },
  {
    label: '边缘渲染',
    value: 'P30562',
    diagnosis: '基础配置与调账链路仍需完善，整体健康度中等',
    issueCount: 3,
    issueMetrics: ['基础配置整体状态', '最早账期调账', '成本利润率'],
  },
]
const baseConfigItems: BaseConfigItem[] = [
  { key: 'price-rule', title: '无定价为1计费项', status: '达标', passed: true, detail: '检查通过（符合1:1计费项标准）' },
  { key: 'billing-doc', title: '计费信息文档完整准确', status: '达标', passed: true, detail: '文档完整且数据准确' },
  { key: 'meter-link', title: 'BY大区计量链路完整度', status: '达标', passed: true, detail: '大区链路全量覆盖无缺失' },
  { key: 'monitor-alert', title: '监控报警合理', status: '达标', passed: true, detail: '报警阈值与通道配置正确' },
]
const evaluationRows: EvaluationRow[] = [
  { key: 'price-stability', dimension: '定价稳定性', metric: '半年周期调价次数', status: '达标', statusTone: 'green', current: '1 次', target: '目标：0-1 次' },
  { key: 'profit-rate', dimension: '定价精准度', metric: '成本利润率', status: '达标', statusTone: 'green', current: '处于合理正负 5% 区间', target: '目标：正负 5%' },
  { key: 'non-meter-adjust', dimension: '定价精准度', metric: '调账次数-商品方非计量问题', status: '达标', statusTone: 'green', current: '本月 0 次', target: '目标：无异常调账' },
  { key: 't-plus-one', dimension: '账单及时性', metric: 'T+1 计量能力', status: '不达标', statusTone: 'red', current: '触发异常原因', target: '目标：日计费项 T+1 完成全部上传', reasonKey: 't-plus-one' },
  { key: 'early-adjust', dimension: '账单及时性', metric: '最早账期调账', status: '达标', statusTone: 'green', current: '月结后问题账单已及时调整', target: '目标：最早可调账期调整' },
  { key: 'cost-config', dimension: '账单准确度', metric: '成本配置无异常', status: '达标', statusTone: 'green', current: '无配置冲突', target: '目标：无配置冲突' },
  { key: 'region-balance', dimension: '账单准确度', metric: '大区收支均衡度', status: '达标', statusTone: 'green', current: '异常大区金额占比 0%', target: '目标：大区收支均衡' },
  { key: 'traceback-amount', dimension: '账单准确度', metric: '回溯金额', status: '达标', statusTone: 'green', current: '无重新推量参数不一致', target: '目标：0（无异常回溯）' },
  { key: 'meter-adjust', dimension: '账单准确度', metric: '调账次数-商品方计量问题', status: '达标', statusTone: 'green', current: '本月 0 次', target: '目标：0（无计量调账）' },
  { key: 'residual-bill', dimension: '账单准确度', metric: '最终未处理异常账单金额', status: '达标', statusTone: 'green', current: '封账后无残留未调账单', target: '目标：0（完全清零）' },
]
const topRankingItems: RankingItem[] = [
  {
    key: 'rank-1',
    rank: 1,
    name: '对象存储标准版',
    issueCount: 6,
    metrics: ['T+1 计量能力', '成本配置无异常', '大区收支均衡度', '回溯金额', '调账次数-商品方计量问题', '最终未处理异常金额'],
  },
  {
    key: 'rank-2',
    rank: 2,
    name: '实时音视频',
    issueCount: 5,
    metrics: ['T+1 计量能力', '半年周期调价次数', '回溯金额', '调账次数-商品方计量问题', '基础配置整体状态'],
  },
  {
    key: 'rank-3',
    rank: 3,
    name: '视频直播',
    issueCount: 4,
    metrics: ['T+1 计量能力', '回溯金额', '成本利润率', '最终未处理异常金额'],
  },
  {
    key: 'rank-4',
    rank: 4,
    name: '云点播',
    issueCount: 3,
    metrics: ['成本配置无异常', '大区收支均衡度', '监控报警合理'],
  },
  {
    key: 'rank-5',
    rank: 5,
    name: '边缘渲染',
    issueCount: 3,
    metrics: ['基础配置整体状态', '最早账期调账', '成本利润率'],
  },
]
const governanceRows: GovernanceRow[] = [
  {
    key: 'gov-1',
    reason: '日常账单中，日计费项未在 T+1 完成全部用量上传。',
    products: ['对象存储标准版', '实时音视频', '视频直播'],
    dimensions: ['账单及时性', '经营力评估'],
  },
  {
    key: 'gov-2',
    reason: '大区存在有收入无成本，导致收支均衡异常。',
    products: ['对象存储标准版', '云点播'],
    dimensions: ['账单准确度'],
  },
  {
    key: 'gov-3',
    reason: '半年周期内多次调价，定价稳定性不达标。',
    products: ['实时音视频'],
    dimensions: ['定价稳定性'],
  },
  {
    key: 'gov-4',
    reason: '计费信息文档不完整，影响基础配置合规性。',
    products: ['图片图文', '边缘渲染'],
    dimensions: ['基础配置'],
  },
]
const homeSingleStatusesByProduct: Record<string, HomeDimensionStatus[]> = {
  C30489: [
    { label: '基础配置', value: '符合要求', tone: 'positive' },
    { label: '定价稳定性', value: '符合要求', tone: 'positive' },
    { label: '定价偏差度', value: '偏差较大', tone: 'warning' },
    { label: '账单及时性', value: '不及时', tone: 'warning' },
    { label: '账单准确性', value: '准确', tone: 'positive' },
  ],
  C12567: [
    { label: '基础配置', value: '符合要求', tone: 'positive' },
    { label: '定价稳定性', value: '稳定', tone: 'positive' },
    { label: '定价偏差度', value: '偏差不大', tone: 'positive' },
    { label: '账单及时性', value: '及时', tone: 'positive' },
    { label: '账单准确性', value: '准确', tone: 'positive' },
  ],
  C67210: [
    { label: '基础配置', value: '待改进', tone: 'warning' },
    { label: '定价稳定性', value: '波动较大', tone: 'warning' },
    { label: '定价偏差度', value: '偏差较大', tone: 'warning' },
    { label: '账单及时性', value: '不及时', tone: 'danger' },
    { label: '账单准确性', value: '待核查', tone: 'warning' },
  ],
  C77880: [
    { label: '基础配置', value: '存在缺口', tone: 'warning' },
    { label: '定价稳定性', value: '基本稳定', tone: 'positive' },
    { label: '定价偏差度', value: '偏差较大', tone: 'warning' },
    { label: '账单及时性', value: '及时', tone: 'positive' },
    { label: '账单准确性', value: '准确', tone: 'positive' },
  ],
  P10298: [
    { label: '基础配置', value: '待补齐', tone: 'warning' },
    { label: '定价稳定性', value: '符合要求', tone: 'positive' },
    { label: '定价偏差度', value: '偏差可控', tone: 'positive' },
    { label: '账单及时性', value: '不及时', tone: 'warning' },
    { label: '账单准确性', value: '异常较多', tone: 'danger' },
  ],
  P30562: [
    { label: '基础配置', value: '待补齐', tone: 'warning' },
    { label: '定价稳定性', value: '有波动', tone: 'warning' },
    { label: '定价偏差度', value: '偏差可控', tone: 'positive' },
    { label: '账单及时性', value: '及时', tone: 'positive' },
    { label: '账单准确性', value: '需关注', tone: 'warning' },
  ],
}
const homeMetricBars: HomeMetricBar[] = [
  { label: '基础配置', value: 75 },
  {
    label: '定价健康',
    value: 75,
    children: [
      { label: '稳定性', value: 75 },
      { label: '偏差度', value: 75 },
    ],
  },
  {
    label: '账单健康',
    value: 75,
    children: [
      { label: '及时性', value: 75 },
      { label: '准确性', value: 75 },
    ],
  },
]
const homeIssueTemplates = [
  { key: 'home-issue-1', title: '存在成本配置异常，递归配置导致节点重复关联' },
  { key: 'home-issue-2', title: '存在商品方计量问题，未在封账前修正计量问题，产生调账' },
  { key: 'home-issue-3', title: '存在大区收支不均衡，影响账单准确性判定' },
  { key: 'home-issue-4', title: '半年周期内调价次数过多，定价稳定性待治理' },
  { key: 'home-issue-5', title: '计费信息文档不完整，影响基础配置合规性' },
] as const
const homeIssueMetricsByProduct: Record<string, string[]> = {
  C30489: ['账单准确性', '账单准确性', '账单及时性', '定价稳定性', '定价偏差度'],
  C12567: ['基础配置', '定价稳定性', '定价偏差度', '账单及时性', '账单准确性'],
  C67210: ['账单准确性', '账单及时性', '账单准确性', '定价稳定性', '基础配置'],
  C77880: ['基础配置', '定价偏差度', '账单准确性', '定价稳定性', '基础配置'],
  P10298: ['账单准确性', '账单准确性', '账单准确性', '账单及时性', '基础配置'],
  P30562: ['基础配置', '账单及时性', '账单准确性', '定价稳定性', '定价偏差度'],
}
const drawerReasons = {
  't-plus-one': {
    title: 'T+1 计量能力 - 异常治理诊断',
    metricPath: '账单及时性 -> T+1 计量能力',
    objective: '日计费项在 T+1 完成全部用量上传；月计费项在月结第二个工作日完成全部计量上传。',
    rootCauses: ['日常账单中，日计费项未在 T+1 完成全部用量上传。', '月结账单场景下，问题账单未在最早可调账期完成调整。'],
    monitorText: '查看延迟计费项首次推量分布',
    actions: ['查看延迟计费项明细', '去计量数据补传'],
  },
} as const

function StatusTag({ text, tone }: { text: string; tone: 'green' | 'red' | 'arcoblue' }) {
  return <Tag color={tone} className="status-tag">{text}</Tag>
}

function RankingMetricTags({ metrics }: { metrics: string[] }) {
  const previewMetrics = metrics.slice(0, 4)
  const remainingCount = Math.max(metrics.length - previewMetrics.length, 0)

  return (
    <div className="ranking-metrics">
      <span className="ranking-metrics-label">共 {metrics.length} 项未达标：</span>
      {previewMetrics.map((metric) => (
        <span key={metric} className="metric-pill">{metric}</span>
      ))}
      {remainingCount ? <span className="metric-pill metric-pill-count">+{remainingCount}</span> : null}
    </div>
  )
}

function buildHomeSingleIssues(productValue: string): HomeIssueItem[] {
  const metrics = homeIssueMetricsByProduct[productValue] ?? homeIssueMetricsByProduct[productOptions[0].value]

  return homeIssueTemplates.map((item, index) => ({
    key: item.key,
    title: item.title,
    metric: metrics[index] ?? metrics[metrics.length - 1] ?? '经营力评估',
  }))
}

function buildHomeMultiIssues(selectedProducts: ProductOption[]): HomeIssueItem[] {
  const labels = selectedProducts.length ? selectedProducts.map((item) => item.label) : [productOptions[0].label]
  const metrics = ['账单准确性', '账单准确性', '账单及时性', '定价稳定性', '定价偏差度']

  return homeIssueTemplates.map((item, index) => ({
    key: item.key,
    title: item.title,
    metric: metrics[index] ?? '经营力评估',
    product: labels[index % labels.length],
  }))
}

function HomeInsightIssues({ items }: { items: HomeIssueItem[] }) {
  return (
    <section className="business-issues">
      <div className="business-issues-title">
        <span className="business-issues-marker" />
        <span>Top 5 问题</span>
      </div>
      <div className="business-issue-list">
        {items.map((item) => (
          <div key={item.key} className="business-issue-item">
            <p className="business-issue-text">{item.title}</p>
            <div className="business-issue-tags">
              {item.product ? <span className="business-issue-tag">{item.product}</span> : null}
              <span className="business-issue-tag">{item.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function HomeSingleInsightCard({
  statuses,
  issues,
}: {
  statuses: HomeDimensionStatus[]
  issues: HomeIssueItem[]
}) {
  return (
    <div className="business-panel business-panel-single">
      <div className="business-status-grid">
        {statuses.map((item) => (
          <div key={item.label} className="business-status-item">
            <span className="business-status-label">{item.label}</span>
            <div className={`business-status-value ${item.tone}`}>
              <span className={`business-status-dot ${item.tone}`} />
              <span>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="business-divider" />
      <HomeInsightIssues items={issues} />
    </div>
  )
}

function HomeMultiInsightCard({
  metrics,
  issues,
}: {
  metrics: HomeMetricBar[]
  issues: HomeIssueItem[]
}) {
  return (
    <div className="business-panel business-panel-multi">
      <div className="business-progress-list">
        {metrics.map((item) => (
          <div key={item.label} className="business-progress-group">
            <div className="business-progress-row">
              <span className="business-progress-label">{item.label}</span>
              <div className="business-progress-track">
                <div className="business-progress-fill" style={{ width: `${item.value}%` }} />
              </div>
              <span className="business-progress-value">{item.value}%达标</span>
            </div>
            {item.children?.length ? (
              <div className="business-progress-children">
                {item.children.map((child) => (
                  <div key={child.label} className="business-progress-row business-progress-row-child">
                    <span className="business-progress-label">{child.label}</span>
                    <div className="business-progress-track">
                      <div className="business-progress-fill" style={{ width: `${child.value}%` }} />
                    </div>
                    <span className="business-progress-value">{child.value}%达标</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="business-divider" />
      <HomeInsightIssues items={issues} />
    </div>
  )
}

function HomeRankingTableCard({
  title,
  rows,
}: {
  title: string
  rows: HomeBoardRow[]
}) {
  return (
    <section className="home-ranking-card">
      <div className="home-ranking-header">{title}</div>
      <div className="home-ranking-table">
        <div className="home-ranking-row home-ranking-row-head">
          <div className="home-ranking-cell home-ranking-cell-rank" />
          <div className="home-ranking-cell home-ranking-cell-product">商品</div>
          <div className="home-ranking-cell home-ranking-cell-number">成本金额</div>
          <div className="home-ranking-cell home-ranking-cell-number">占比</div>
          <div className="home-ranking-cell home-ranking-cell-number">日环比</div>
          <div className="home-ranking-cell home-ranking-cell-action">操作列</div>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="home-ranking-row">
            <div className="home-ranking-cell home-ranking-cell-rank">
              <span className={`rank-badge rank-badge-${row.rank <= 3 ? row.rank : 'default'}`}>{row.rank}</span>
            </div>
            <div className="home-ranking-cell home-ranking-cell-product">
              <button type="button" className="home-link-button">{row.product}</button>
            </div>
            <div className="home-ranking-cell home-ranking-cell-number">{row.amount}</div>
            <div className="home-ranking-cell home-ranking-cell-number">{row.ratio}</div>
            <div className={`home-ranking-cell home-ranking-cell-number trend-${row.trend}`}>
              <span className={`trend-arrow trend-arrow-${row.trend}`} />
              <span>{row.dayChange}</span>
            </div>
            <div className="home-ranking-cell home-ranking-cell-action">
              <button type="button" className="home-link-button">成本明细</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function HomeGoalProgressCard({ progress }: { progress: HomeGoalProgress }) {
  return (
    <article className="dashboard-card side-card goal-progress-card">
      <div className="goal-progress-header">
        <h3>{progress.title}</h3>
        <button type="button" className="goal-progress-link">
          <span>{progress.targetLabel}</span>
          <span className="goal-progress-chevron" />
        </button>
      </div>
      <div className="goal-progress-body">
        <p className="goal-progress-label">{progress.actualLabel}</p>
        <div className="goal-progress-value-row">
          <div className="goal-progress-value">
            <span className="goal-progress-currency">¥</span>
            <strong>{progress.value}</strong>
            <span className="goal-progress-unit">{progress.unit}</span>
          </div>
          <span className="goal-progress-status">{progress.status}</span>
        </div>
        <div className="goal-progress-track">
          <div className="goal-progress-track-rest" />
          <div className="goal-progress-track-light" style={{ width: `${Math.max(progress.threshold - 12, 0)}%` }} />
          <div className="goal-progress-track-fill" style={{ width: `${progress.progress}%` }} />
          <div className="goal-progress-indicator" style={{ left: `${progress.threshold}%` }} />
        </div>
        <div className="goal-progress-scale">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="goal-progress-dots">
        <span className="goal-progress-dot active" />
        <span className="goal-progress-dot" />
        <span className="goal-progress-dot" />
      </div>
    </article>
  )
}

function SankeyCard() {
  const option = useMemo<EChartsOption>(() => ({
    animation: false,
    tooltip: { show: false },
    series: [
      {
        type: 'sankey',
        data: [
          {
            name: '商品总数',
            depth: 0,
            label: {
              position: 'right',
              distance: 10,
              formatter: '{name|商品总数} {value|10}',
              rich: {
                name: { color: '#0c0d0e', fontSize: 12, fontWeight: 500, lineHeight: 20 },
                value: { color: '#737a87', fontSize: 12, lineHeight: 20 },
              },
            },
            itemStyle: { color: '#7864ff', borderRadius: 4 },
          },
          {
            name: '不达标',
            depth: 1,
            label: {
              position: 'right',
              distance: 10,
              formatter: '{name|不达标} {value|6}',
              rich: {
                name: { color: '#0c0d0e', fontSize: 12, fontWeight: 500, lineHeight: 20 },
                value: { color: '#737a87', fontSize: 12, lineHeight: 20 },
              },
            },
            itemStyle: { color: '#fb7d0f', borderRadius: 4 },
          },
          {
            name: '达标',
            depth: 1,
            label: {
              position: 'right',
              distance: 10,
              formatter: '{name|达标} {value|4}',
              rich: {
                name: { color: '#0c0d0e', fontSize: 12, fontWeight: 500, lineHeight: 20 },
                value: { color: '#737a87', fontSize: 12, lineHeight: 20 },
              },
            },
            itemStyle: { color: '#2078fd', borderRadius: 4 },
          },
          {
            name: '基础配置',
            depth: 2,
            label: {
              position: 'right',
              distance: 10,
              formatter: '{name|基础配置} {value|2}',
              rich: {
                name: { color: '#0c0d0e', fontSize: 12, fontWeight: 500, lineHeight: 20 },
                value: { color: '#737a87', fontSize: 12, lineHeight: 20 },
              },
            },
            itemStyle: { color: '#fb7d0f', borderRadius: 4 },
          },
          {
            name: '经营力评估',
            depth: 2,
            label: {
              position: 'right',
              distance: 10,
              formatter: '{name|经营力评估} {value|4}',
              rich: {
                name: { color: '#0c0d0e', fontSize: 12, fontWeight: 500, lineHeight: 20 },
                value: { color: '#737a87', fontSize: 12, lineHeight: 20 },
              },
            },
            itemStyle: { color: '#fb7d0f', borderRadius: 4 },
          },
        ],
        links: [
          { source: '商品总数', target: '不达标', value: 6 },
          { source: '商品总数', target: '达标', value: 4 },
          { source: '不达标', target: '基础配置', value: 2 },
          { source: '不达标', target: '经营力评估', value: 4 },
        ],
        nodeWidth: 12,
        nodeGap: 18,
        draggable: false,
        emphasis: { focus: 'none' },
        levels: [
          { depth: 0, lineStyle: { color: 'source', opacity: 0.14, curveness: 0.5 } },
          { depth: 1, lineStyle: { color: 'source', opacity: 0.14, curveness: 0.5 } },
          { depth: 2, lineStyle: { color: 'source', opacity: 0.14, curveness: 0.5 } },
        ],
        lineStyle: {
          color: 'gradient',
          opacity: 0.14,
          curveness: 0.5,
        },
        top: 0,
        left: 0,
        right: 8,
        bottom: 0,
      },
    ],
  }), [])

  return (
    <Card className="overview-card sankey-card sankey-frame-card">
      <div className="sankey-chart-header">
        <p className="sankey-chart-caption">商品数量</p>
        <p className="sankey-chart-total">10</p>
      </div>
      <ReactECharts option={option} opts={{ renderer: 'svg' }} notMerge lazyUpdate className="sankey-echart" />
    </Card>
  )
}

function HomePage({
  activeFilters,
  onChangeFilters,
  onEnterDetail,
}: {
  activeFilters: string[]
  onChangeFilters: (value: string[]) => void
  onEnterDetail: () => void
}) {
  const effectiveFilterValues = activeFilters.length ? activeFilters : [productOptions[0].value]
  const selectedHomeProducts = effectiveFilterValues
    .map((value) => productOptions.find((item) => item.value === value))
    .filter((item): item is ProductOption => Boolean(item))
  const isMultiMode = selectedHomeProducts.length > 1
  const primaryProduct = selectedHomeProducts[0] ?? productOptions[0]
  const singleStatuses = homeSingleStatusesByProduct[primaryProduct.value] ?? homeSingleStatusesByProduct[productOptions[0].value]
  const singleIssues = buildHomeSingleIssues(primaryProduct.value)
  const multiIssues = buildHomeMultiIssues(selectedHomeProducts)

  return (
    <section className="home-page">
      <section className="content-header">
        <div className="view-tabs-wrap">
          <div className="view-tabs">
            {homeTabs.map((tab, index) => (
              <button key={tab} type="button" className={index === 2 ? 'view-tab active' : 'view-tab'}>
                {tab}
              </button>
            ))}
          </div>
          <div className="home-product-picker">
            <span className="home-product-picker-label">商品选择</span>
            <Select
              mode="multiple"
              allowClear
              placeholder="请选择商品"
              value={activeFilters}
              options={productOptions.map((item) => ({ label: item.label, value: item.value }))}
              className="home-filter-select"
              onChange={(value) => onChangeFilters((value as string[]) ?? [])}
            />
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="main-column">
          <article className="dashboard-card board-card">
            <div className="card-top">
              <div>
                <h1 className="page-title">经营看板</h1>
                <div className="switch-row">
                  <button type="button" className="mini-tab active">数据概览</button>
                  <button type="button" className="mini-tab">洞察报告</button>
                </div>
              </div>
              <p className="update-text">最近数据更新时间：2025-05-13 12:00:00</p>
            </div>

            <div className="board-filter-row">
              <div className="board-inline-filter board-inline-filter-period">
                <span className="board-filter-label">账期</span>
                <button type="button" className="board-filter-field board-filter-field-period">
                  <span className="board-filter-chip">近 7 前</span>
                  <span className="board-filter-divider" />
                  <span>2022-03-03 - 2022-04-03</span>
                  <span className="board-filter-calendar" />
                </button>
              </div>
              <div className="board-inline-filter board-inline-filter-region">
                <span className="board-filter-label">大区及售卖区域</span>
                <button type="button" className="board-filter-field">
                  <span className="board-filter-placeholder">请选择</span>
                  <span className="board-filter-chevron" />
                </button>
              </div>
              <button type="button" className="board-icon-button board-icon-button-badge" aria-label="筛选条件">
                <span className="board-icon board-icon-filter" />
                <span className="board-icon-badge">4</span>
              </button>
              <button type="button" className="board-icon-button" aria-label="更多操作">
                <span className="board-icon board-icon-compare" />
              </button>
            </div>

            <div className="metrics-grid board-metrics-grid">
              {homeMetrics.map((metric) => (
                <div key={metric.label} className="metric-card board-metric-card">
                  <span className="metric-label">{metric.label}</span>
                  <div className="metric-value">
                    <strong>{metric.value.replace(/(万元|万|%)/, '')}</strong>
                    <span>{metric.value.match(/(万元|万|%)/)?.[0] ?? ''}</span>
                  </div>
                  <div className="metric-meta-block">
                    <div className="metric-meta-row">
                      <span>环比基准值</span>
                      <span>15.15万元</span>
                    </div>
                    <div className="metric-meta-row">
                      <span>环比</span>
                      <span className="metric-meta-inline">
                        <span>15.15万元</span>
                        <span className="metric-trend-up" />
                        <span className="metric-delta">1.13%</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <HomeRankingTableCard title="成本构成 Top10" rows={homeBoardRows} />
            <HomeRankingTableCard title="成本商品 Top10" rows={homeBoardRows} />
          </article>
        </div>

        <aside className="side-column">
          <article className="dashboard-card side-card business-side-card">
            <div className="side-card-header business-side-card-header">
              <div className="business-side-card-heading">
                <h2>经营力表现</h2>
                <div className="business-standard">
                  <span className="business-standard-icon" />
                  <span>经营力标准</span>
                </div>
              </div>
              <Button type="text" className="detail-link-button" onClick={onEnterDetail}>查看详情</Button>
            </div>
            {isMultiMode ? (
              <HomeMultiInsightCard metrics={homeMetricBars} issues={multiIssues} />
            ) : (
              <HomeSingleInsightCard statuses={singleStatuses} issues={singleIssues} />
            )}
          </article>
          <HomeGoalProgressCard progress={homeGoalProgress} />
        </aside>
      </section>
    </section>
  )
}

function SingleDetailPage({
  selectedProducts,
  activeProductInfo,
  activeTab,
  basicConfigHealthy,
  columns,
  failedRows,
  onBack,
  onChangeProducts,
  onChangeTab,
}: {
  selectedProducts: string[]
  activeProductInfo: ProductOption
  activeTab: string
  basicConfigHealthy: boolean
  columns: TableColumnProps<EvaluationRow>[]
  failedRows: EvaluationRow[]
  onBack: () => void
  onChangeProducts: (value: string[]) => void
  onChangeTab: (value: string) => void
}) {
  return (
    <section className="detail-page">
      <header className="detail-header detail-header-single">
        <div>
          <div className="breadcrumb">商品管理 / 商品经营力 / 详情诊断</div>
          <div className="title-row">
            <button type="button" className="back-link" aria-label="返回" onClick={onBack}>
              <span className="back-link-icon" />
            </button>
            <h1 className="page-title">商品经营力深度诊断详情页</h1>
          </div>
          <p className="page-subtitle">基于默认数据字典输出单商品经营力结论、异常归因与治理建议。</p>
        </div>
      </header>

      <section className="global-summary">
        <div className="summary-toolbar">
          <div className="filter-group">
            <span className="filter-label">选择商品</span>
            <Select
              mode="multiple"
              allowClear
              showSearch
              value={selectedProducts}
              options={productOptions.map((item) => ({ label: `${item.label} (${item.value})`, value: item.value }))}
              className="product-select"
              onChange={(value) => onChangeProducts((value as string[]) ?? [])}
            />
          </div>
        </div>

        <Card className="summary-card">
          <div className="summary-topline">
            <div className="summary-main summary-main-noicon">
              <div>
                <div className="summary-name">
                  当前商品：{activeProductInfo.label}
                  <span className="summary-id">ID: {activeProductInfo.value}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-diagnosis">
            <span className="diagnosis-label">综合诊断：</span>
            <strong>{activeProductInfo.diagnosis}</strong>
          </div>
        </Card>
      </section>

      <Tabs activeTab={activeTab} onChange={onChangeTab} className="detail-tabs">
        <Tabs.TabPane key="diagnosis" title="核心指标诊断">
          <div className="tab-panel">
            <section className="module-block">
              <div className="module-header">
                <div>
                  <div className="module-title">模块一：基础配置</div>
                  <p className="module-desc">保障经营力的基础能力，对应图 1 的四项核心检查。</p>
                </div>
                <div className="module-state">
                  {basicConfigHealthy ? (
                    <StatusTag text="基础配置符合要求" tone="green" />
                  ) : (
                    <>
                      <StatusTag text="基础配置需要改进" tone="red" />
                      <Button type="secondary" size="small">去配置</Button>
                    </>
                  )}
                </div>
              </div>

              <div className="base-card-grid">
                {baseConfigItems.map((item) => (
                  <Card key={item.key} className="base-card">
                    <div className="base-card-title">{item.title}</div>
                    <div className="base-card-status-row">
                      <StatusTag text={item.status} tone={item.passed ? 'green' : 'red'} />
                      <p className="base-card-detail">{item.detail}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="module-block">
              <div className="module-header">
                <div>
                  <div className="module-title">模块二：经营力评估</div>
                  <p className="module-desc">以表格形式展示定价与账单核心域的状态、现状数据与不达标排查入口。</p>
                </div>
                <div className="module-state">
                  <StatusTag text={`异常项 ${failedRows.length} 个`} tone={failedRows.length ? 'red' : 'green'} />
                </div>
              </div>
              <Table rowKey="key" pagination={false} data={evaluationRows} columns={columns} className="diagnosis-table" />
            </section>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="trend" title="历史趋势分析">
          <div className="tab-panel">
            <section className="module-block">
              <div className="module-header">
                <div>
                  <div className="module-title">历史趋势分析</div>
                  <p className="module-desc">后续接入经营力趋势图表，分析问题是否持续发生。</p>
                </div>
              </div>
              <div className="placeholder-card-grid">
                <Card className="placeholder-module">
                  <div className="placeholder-module-title">半年周期调价次数趋势</div>
                  <Empty description="待接入趋势图表数据" />
                </Card>
                <Card className="placeholder-module">
                  <div className="placeholder-module-title">异常账单金额趋势</div>
                  <Empty description="待接入趋势图表数据" />
                </Card>
              </div>
            </section>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="history" title="治理历史存证">
          <div className="tab-panel">
            <section className="module-block">
              <div className="module-header">
                <div>
                  <div className="module-title">治理历史存证</div>
                  <p className="module-desc">后续可沉淀治理动作、执行人、结果和证据链信息。</p>
                </div>
              </div>
              <Card className="placeholder-module single">
                <Empty description="暂无治理历史存证" />
              </Card>
            </section>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </section>
  )
}

function MultiDetailPage({
  columns,
  selectedProducts,
  onBack,
  onChangeProducts,
}: {
  columns: TableColumnProps<GovernanceRow>[]
  selectedProducts: string[]
  onBack: () => void
  onChangeProducts: (value: string[]) => void
}) {
  return (
    <section className="detail-page">
      <header className="detail-header detail-header-single">
        <div>
          <div className="breadcrumb">商品管理 / 商品经营力 / 详情诊断</div>
          <div className="title-row">
            <button type="button" className="back-link" aria-label="返回" onClick={onBack}>
              <span className="back-link-icon" />
            </button>
            <h1 className="page-title">商品经营力多商品诊断详情页</h1>
          </div>
          <p className="page-subtitle">基于已选商品聚合经营力状态，展示总览分布、异常排行和问题治理清单。</p>
        </div>
      </header>

      <section className="global-summary">
        <div className="summary-toolbar">
          <div className="filter-group">
            <span className="filter-label">选择商品</span>
            <Select
              mode="multiple"
              allowClear
              showSearch
              value={selectedProducts}
              options={productOptions.map((item) => ({ label: `${item.label} (${item.value})`, value: item.value }))}
              className="product-select"
              onChange={(value) => onChangeProducts((value as string[]) ?? [])}
            />
          </div>
        </div>
      </section>

      <section className="module-block">
        <div className="overview-grid">
          <SankeyCard />

          <Card className="overview-card ranking-card">
            <div className="overview-card-title">Top 异常排行榜</div>
            <div className="ranking-list">
              {topRankingItems.map((item) => (
                <div key={item.key} className="ranking-row">
                  <div className="ranking-index">{item.rank}</div>
                  <Tooltip content="下钻该商品查看评估详情">
                    <button type="button" className="ranking-name-button">
                      <span className="ranking-name">{item.name}</span>
                    </button>
                  </Tooltip>
                  <RankingMetricTags metrics={item.metrics} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="module-block">
        <div className="module-header">
          <div>
            <div className="module-title">问题治理表格</div>
            <p className="module-desc">按未达标原因聚合问题，展示涉及商品、影响维度和治理入口。</p>
          </div>
        </div>
        <Table rowKey="key" pagination={false} data={governanceRows} columns={columns} className="diagnosis-table" />
      </section>
    </section>
  )
}

function App() {
  const [pageView, setPageView] = useState<PageView>('home')
  const [homeFilters, setHomeFilters] = useState<string[]>([productOptions[0].value])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([productOptions[0].value])
  const [activeTab, setActiveTab] = useState('diagnosis')
  const [activeReasonKey, setActiveReasonKey] = useState<keyof typeof drawerReasons | null>(null)

  const isSingleDetail = selectedProducts.length <= 1
  const activeProduct = selectedProducts[0] ?? productOptions[0].value
  const activeProductInfo = useMemo(
    () => productOptions.find((item) => item.value === activeProduct) ?? productOptions[0],
    [activeProduct],
  )
  const basicConfigHealthy = useMemo(() => baseConfigItems.every((item) => item.passed), [])
  const failedRows = useMemo(() => evaluationRows.filter((item) => item.status === '不达标'), [])
  const activeDrawer = activeReasonKey ? drawerReasons[activeReasonKey] : null

  const singleColumns: TableColumnProps<EvaluationRow>[] = [
    { title: '大维度分类', dataIndex: 'dimension', width: 180, render: (value: string) => <span className="dimension-cell">{value}</span> },
    { title: '子指标', dataIndex: 'metric', width: 220, render: (value: string) => <span className="metric-cell">{value}</span> },
    { title: '当前状态', dataIndex: 'status', width: 120, render: (_: string, record: EvaluationRow) => <StatusTag text={record.status} tone={record.statusTone} /> },
    {
      title: '核心现状数据 / 目标值',
      dataIndex: 'current',
      render: (_: string, record: EvaluationRow) => (
        <div className="current-cell">
          <span>{record.current}</span>
          <small>{record.target}</small>
          {record.reasonKey ? (
            <Button type="text" size="small" className="reason-trigger" onClick={() => setActiveReasonKey(record.reasonKey ?? null)}>
              点击排查
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  const multiColumns: TableColumnProps<GovernanceRow>[] = [
    { title: '未达标原因', dataIndex: 'reason', render: (value: string) => <span className="governance-reason">{value}</span> },
    {
      title: '涉及商品',
      dataIndex: 'products',
      width: 320,
      render: (_: string[], record: GovernanceRow) => (
        <div className="tag-cell">
          {record.products.map((item) => (
            <Tag key={item} color="arcoblue">{item}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '影响维度',
      dataIndex: 'dimensions',
      width: 220,
      render: (_: string[], record: GovernanceRow) => (
        <div className="tag-cell">
          {record.dimensions.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      ),
    },
    { title: '操作', dataIndex: 'action', width: 120, render: () => <Button type="text">去处理</Button> },
  ]

  const handleEnterDetail = () => {
    const nextSelected = homeFilters.length ? homeFilters : [productOptions[0].value]
    setSelectedProducts(nextSelected)
    setActiveTab('diagnosis')
    setActiveReasonKey(null)
    setPageView('detail')
  }

  const handleChangeDetailProducts = (value: string[]) => {
    const nextValue = value.length ? value : [productOptions[0].value]
    setSelectedProducts(nextValue)
    if (nextValue.length > 1) {
      setActiveTab('diagnosis')
      setActiveReasonKey(null)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">B</div>
          <div className="brand-text">
            <strong>Byte BABI</strong>
            <span>让经营看目标，更高效，更智能</span>
          </div>
          <span className="brand-badge">Online</span>
        </div>
        <div className="topbar-actions">
          <span>UTC+8</span>
          <span>工单</span>
          <span>权限管理</span>
          <span>帮助中心</span>
          <div className="avatar">H</div>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <nav className="menu">
            {primaryMenus.map((item, index) => (
              <button key={item} type="button" className={index === 0 ? 'menu-item active' : 'menu-item'}>
                <span className="menu-icon" />
                <span>{item}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={pageView === 'detail' ? 'content detail-content' : 'content home-content'}>
          {pageView === 'home' ? (
            <HomePage
              activeFilters={homeFilters}
              onChangeFilters={setHomeFilters}
              onEnterDetail={handleEnterDetail}
            />
          ) : (
            isSingleDetail ? (
              <SingleDetailPage
                selectedProducts={selectedProducts}
                activeProductInfo={activeProductInfo}
                activeTab={activeTab}
                basicConfigHealthy={basicConfigHealthy}
                columns={singleColumns}
                failedRows={failedRows}
                onBack={() => setPageView('home')}
                onChangeProducts={handleChangeDetailProducts}
                onChangeTab={setActiveTab}
              />
            ) : (
              <MultiDetailPage
                columns={multiColumns}
                selectedProducts={selectedProducts}
                onBack={() => setPageView('home')}
                onChangeProducts={handleChangeDetailProducts}
              />
            )
          )}
        </main>
      </div>

      <Drawer
        visible={Boolean(activeDrawer && isSingleDetail)}
        width={600}
        title={activeDrawer?.title}
        footer={
          <div className="drawer-footer">
            <Button type="secondary" onClick={() => setActiveReasonKey(null)}>取消</Button>
            <Button type="primary">去配置</Button>
          </div>
        }
        onCancel={() => setActiveReasonKey(null)}
      >
        {activeDrawer ? (
          <div className="drawer-body">
            <section className="drawer-section">
              <div className="drawer-section-title">归属指标</div>
              <p>{activeDrawer.metricPath}</p>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-title">考核目标</div>
              <p>{activeDrawer.objective}</p>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-title">未达标真因</div>
              <ul className="drawer-list">
                {activeDrawer.rootCauses.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-title">现状数据监测</div>
              <Button type="text" className="drawer-link">{activeDrawer.monitorText}</Button>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-title">治理行动闭环</div>
              <div className="drawer-action-group">
                {activeDrawer.actions.map((action: string) => (
                  <Button key={action} type="secondary">{action}</Button>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

export default App
