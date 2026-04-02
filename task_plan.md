# Task Plan: 路演榜单功能迭代

## Goal
在现有"路演互动邀约用户查询"网站上新增"路演榜单"模块，包含三个数据可视化榜单（报名分析、参会效果、转化效果），支持Tab切换、表头排序、详情查看，并新增首页展示网站介绍。

## Current Phase
Phase 1

## Phases

### Phase 1: 数据同步脚本
- [ ] 创建 sync_rankings.py 同步三个榜单数据
- [ ] 更新 config.json 增加榜单配置
- [ ] 修改 scheduled_sync.py 增加榜单同步
- [ ] 测试同步脚本
- **Status:** pending

### Phase 2: 前端类型定义和状态管理
- [ ] 创建 types/rankings.ts 类型定义
- [ ] 更新 store/index.ts 增加榜单状态
- [ ] 创建 hooks/useRankingsData.ts 数据加载Hook
- **Status:** pending

### Phase 3: 前端组件开发
- [ ] 创建 RankingTable 可复用榜单表格组件
- [ ] 创建 RankingDetail 详情抽屉组件
- [ ] 创建 HomePage 首页组件
- [ ] 创建 RankingsPage 路演榜单页面
- **Status:** pending

### Phase 4: 路由和导航
- [ ] 修改 App.tsx 增加导航菜单
- [ ] 配置路由（首页、用户查询、路演榜单）
- [ ] 响应式适配
- **Status:** pending

### Phase 5: 测试验证
- [ ] 功能测试（三个榜单数据展示）
- [ ] 交互测试（Tab切换、排序、详情）
- [ ] 空数据测试
- [ ] 移动端适配测试
- **Status:** pending

### Phase 6: 部署上线
- [ ] 更新定时任务增加榜单同步
- [ ] 推送到GitHub
- [ ] Vercel部署
- [ ] 线上验证
- **Status:** pending

## Key Questions
1. 时间范围选择器放在榜单页面顶部还是每个Tab独立？
2. 首页内容需要哪些具体模块？
3. 详情抽屉需要展示哪些字段？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 前端提供时间范围选择器 | 用户可自定义查询范围 |
| Tab切换展示三个榜单 | 避免页面过长，聚焦单个榜单 |
| 表头排序支持 | 用户可按不同维度查看数据 |
| 详情抽屉右侧滑出 | 不打断当前浏览上下文 |
| 股票代码不跳转 | 避免用户离开网站 |
| 空数据显示"暂无数据" | 明确告知用户状态 |
| 数据库只读 | 无法添加索引，需优化SQL |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 数据库只有只读权限，无法添加索引
- 同步频率：每天2次（凌晨1点、下午8点）
- 时间范围：可配置，默认7天/15天，最多60天
- 榜单记录数：报名分析30条、参会效果30条、转化效果20条
