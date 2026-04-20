# RSC 路演互动查询系统 — 项目状态报告

> 最后更新：2026-04-20
> 下次 AI 接手时，请先读取本文件了解项目全貌。

---

## 0. 快速定位

| 项目 | 路径 |
|------|------|
| 前端代码 | `E:\AIwork\路演互动查询系统\frontend\src\` |
| 同步脚本 | `C:\roadshow_sync\` |
| 数据文件（本地） | `E:\AIwork\路演互动查询系统\frontend\public\data\` |
| 线上地址 | https://roadshow-user-query.vercel.app |
| GitHub 仓库 | https://github.com/ikevssy/roadshow-user-query |
| 同步日志 | `C:\roadshow_sync\sync_log.txt` |

---

## 1. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│ Vercel (main 分支部署)                                    │
│   frontend/public/data/                                  │
│     manifest.json     ← 每次同步更新，Cache no-store      │
│     companies.json    ← 全量公司列表                      │
│     industries.json   ← 行业分类                         │
│     rankings_*.json   ← 榜单数据                         │
│   frontend/src/       ← React + Vite + TypeScript        │
│   vercel.json         ← 根目录（注意：不是 frontend/）    │
├─────────────────────────────────────────────────────────┤
│ GitHub data 分支 (raw.githubusercontent.com, CORS *)     │
│   data-latest-1/ → oid 文件 batch 1（~904 个）           │
│   data-latest-2/ → oid 文件 batch 2（~873 个）           │
│   data-latest-3/ → oid 文件 batch 3（~384 个）           │
│   共 2161 个 oid_*.json，每日自动更新                     │
├─────────────────────────────────────────────────────────┤
│ Windows 定时任务 (C:\roadshow_sync\)                     │
│   roadshow_sync_1am  → 每天 01:00 触发                   │
│   roadshow_sync_8pm  → 每天 20:00 触发                   │
│   scheduled_sync.py  → 主入口                            │
│   auto_sync_all.py   → 增量同步 + git push data 分支     │
│   sync_rankings.py   → 同步榜单数据                      │
│   策略：近30天活跃公司强制重刷，其余跳过                   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 核心数据结构

### UserInteraction（用户互动明细）
```typescript
{
  uid: string
  name: string
  org_name: string
  org_type: string
  last_interaction_time: string       // "YYYY-MM-DD HH:mm:ss"
  last_interaction_behavior: string   // "报名" | "参会" | "订阅" | "特别关注"
  interaction_company: string
  apply_count: number
  attend_count: number
  apply_records: Array<{ time: string; meet_title: string; oid: number }>
  attend_records: Array<{ time: string; meet_title: string; oid: number }>
  subscribed_companies: string[]
  special_companies: string[]
}
```

### Manifest（数据清单）
```typescript
{
  update_time: string                 // "YYYY-MM-DD HH:mm:ss"
  companies_count: number             // 全量公司数（约52000）
  synced_companies: number            // 有数据公司数（约2161）
  data_start_time: string             // "2023-01-01"
  release_tags: string[]              // ["data-latest-1","data-latest-2","data-latest-3"]
  files: Array<{
    oid: number
    cn_short_name: string
    filename: string                  // "oid_16761.json"
    user_count: number
    release_batch: number             // 1 | 2 | 3，决定从哪个 data 分支加载
  }>
}
```

### FilterState / QuickFilterState
```typescript
FilterState: {
  certTypes: string[]
  orgTypes: string[]
  interactionDateRange: [string, string] | null
  applyDateRange: [string, string] | null
  attendDateRange: [string, string] | null
  isFirstAttend: boolean | null
}

QuickFilterState: {
  days: number          // 3 | 7 | 15 | 30
  companyOid: number | null
}
```

---

## 3. 关键函数接口

### 前端 `frontend/src/hooks/useDataLoader.ts`
```typescript
loadCompanies(): Promise<Company[]>
loadIndustryData(): Promise<IndustryData | null>
loadManifest(): Promise<Manifest | null>   // 带 ?t=Date.now() 绕过缓存
loadUsers(onProgress?: (loaded: number, total: number) => void): Promise<void>
getFileUrl(filename: string, releaseBatch?: number): string
fetchFile(filename: string, releaseBatch?: number): Promise<UserInteraction[]>
mergeUsers(usersList: UserInteraction[][]): UserInteraction[]
loadAllCompanyUsers(onProgress?): Promise<UserInteraction[]>  // batchSize=50
```

### 前端 `frontend/src/store/index.ts`
```typescript
// Zustand store，无 localStorage 持久化，刷新后恢复初始状态
setCompanies / setManifest / setAllUsers / setIndustryData
setSelectedCompanyOids / setSelectedIndustries / setDateRange
setQueryMode / setFilters / setQuickFilter / setSearchText
setLoading / setFilterCollapsed / resetFilters / resetAll
```

### 后端 `C:\roadshow_sync\`
```python
# scheduled_sync.py — 定时任务主入口
run_sync() -> bool   # [1/3]同步用户数据 [2/3]同步榜单 [3/3]git push main

# auto_sync_all.py — 增量同步核心
auto_sync_all(force_full=False) -> None
get_all_companies_with_data(syncer, start_time) -> set[int]
get_recently_active_oids(syncer, days=30) -> set[int]
push_files_to_branch(files_by_batch, output_dir, release_tags) -> None

# sync_rankings.py — 榜单同步
sync_rankings() -> None
sync_ranking_apply(syncer, days, limit) -> list
sync_ranking_effect(syncer, days, limit) -> list
sync_ranking_conversion(syncer, days, limit) -> list
```

---

## 4. 当前已知问题（待修复）

### 问题1：manifest.json 更新时间在前端显示不刷新 ⚠️
- **现象**：首页和用户查询页显示的"数据更新"时间固定在 `2026-04-07 10:20:09`
- **根因**：Vercel CDN 对 `/data/manifest.json` 缓存 `max-age=3600`
- **已尝试**：
  1. 修改 `vercel.json` 设置 `no-cache`（未生效，因为 Vercel 项目的 Root Directory 可能是 `frontend/`，导致根目录的 `vercel.json` 未被识别）
  2. 在 `loadManifest()` 加 `?t=Date.now()` 时间戳（代码已写但 edit 工具多处匹配失败，未确认是否成功写入）
- **下一步**：
  - 检查 `frontend/src/hooks/useDataLoader.ts` 第48行附近，确认 fetch URL 是否包含 `?t=`
  - 如果没有，手动加上：`fetch('/data/manifest.json?t=' + Date.now())`
  - 同时去 Vercel Dashboard 确认项目的 Root Directory 设置，将 `vercel.json` 放到正确位置

### 问题2：路演榜单时间筛选无效 ⚠️
- **现象**：点击"近7天"/"近15天"等按钮，列表数据无变化，Console 无日志
- **根因**：未确定。已加调试日志（commit `9261f6b`），但用户反馈 Console 无输出
- **可能原因**：Vercel 部署的不是最新代码，或 `useMemo` 闭包问题
- **下一步**：
  - 确认 Vercel 部署的 JS bundle 是否包含调试日志代码
  - 检查 `RankingsPage.tsx` 的 `getSortedData` 函数是否正确读取 `timeRange` 状态

### 问题3：根目录残留 oid 文件（已清理）✅
- data 分支切换时遗留的 2141 个 oid_*.json 已从 main 分支删除（commit `586f04e`）

---

## 5. 重要配置文件

### `vercel.json`（当前在根目录，但可能未生效）
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/data/manifest.json", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] },
    { "source": "/data/rankings_(.*).json", "headers": [{ "key": "Cache-Control", "value": "public, max-age=1800" }] },
    { "source": "/data/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }] }
  ]
}
```
**注意**：需要在 Vercel Dashboard 确认 Root Directory 是 `/` 还是 `frontend/`，vercel.json 必须放在 Root Directory 下才生效。

### `C:\roadshow_sync\config.json`
```json
{
  "output": { "dir": "E:\\AIwork\\路演互动查询系统\\frontend\\public\\data" },
  "schedule": { "time": "01:00", "enabled": true },
  "github": {
    "token": "ghp_**** (见 C:\\roadshow_sync\\config.json 实际值)",
    "owner": "ikevssy",
    "repo": "roadshow-user-query",
    "release_tags": ["data-latest-1", "data-latest-2", "data-latest-3"],
    "batch_size": 800
  }
}
```

### `.gitignore` 关键规则
```
frontend/public/data/oid_*.json   # oid 数据文件不进 main 分支，存在 data 分支
```

---

## 6. 定时任务状态

| 任务名 | 触发时间 | 下次运行 | 状态 |
|--------|----------|----------|------|
| roadshow_sync_1am | 每天 01:00 | 2026/4/21 1:00 | 正常 |
| roadshow_sync_8pm | 每天 20:00 | — | 正常 |

最近同步记录（`C:\roadshow_sync\sync_log.txt`）：
- `2026-04-20 01:37:48` — 同步完成，2161 家公司

---

## 7. 数据现状

| 指标 | 数值 |
|------|------|
| manifest.update_time（本地） | 2026-04-20 01:37:48 |
| manifest.update_time（Vercel） | 2026-04-07 10:20:09（缓存未刷新） |
| synced_companies | 2161 |
| data 分支文件总数 | ~2161 个 oid_*.json |
| 数据起始时间 | 2023-01-01 |
| 近7天有互动用户 | 可正常查询（数据库已更新） |

---

## 8. 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript + Vite |
| UI 组件库 | Ant Design 5 |
| 状态管理 | Zustand（无持久化） |
| 样式 | CSS Modules + CSS Variables |
| 部署 | Vercel Hobby（免费） |
| 数据存储 | GitHub data 分支（raw.githubusercontent.com） |
| 同步脚本 | Python 3.12，SSH 隧道连接 MySQL |
| 定时任务 | Windows 任务计划程序 |

---

## 9. 接手后第一步

1. 读取本文件
2. 检查 `frontend/src/hooks/useDataLoader.ts` 第45-57行，确认 `loadManifest` 是否有 `?t=Date.now()`
3. 去 Vercel Dashboard 确认 Root Directory 设置
4. 修复路演榜单时间筛选问题（见问题2）
5. 运行 `python C:\roadshow_sync\scheduled_sync.py` 验证同步链路正常
