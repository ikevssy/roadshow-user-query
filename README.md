# 路演互动用户查询系统

路演平台用户互动数据查询工具，支持按公司维度查询2025年以来的报名、参会、订阅用户行为记录。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design
- **数据同步**: Python + pymysql + SSH隧道
- **部署**: Vercel (静态站点)

## 项目结构

```
路演互动查询系统/
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── components/        # UI组件
│   │   │   ├── CompanySelector/   # 公司选择器
│   │   │   ├── TimeRangePicker/   # 时间范围选择
│   │   │   ├── FilterPanel/       # 筛选面板
│   │   │   ├── UserTable/         # 结果表格
│   │   │   └── DetailDrawer/      # 详情抽屉
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── store/             # Zustand状态管理
│   │   ├── types/             # TypeScript类型
│   │   └── utils/             # 工具函数
│   ├── public/data/           # 静态数据文件（Python脚本生成）
│   └── vercel.json            # Vercel配置
├── scripts/                   # Python脚本
│   ├── sync_data.py           # 数据同步脚本
│   ├── config.example.json    # 配置文件模板
│   ├── requirements.txt       # Python依赖
│   ├── run_scheduler.bat      # 定时任务启动脚本
│   └── run_once.bat           # 单次同步脚本
└── README.md
```

## 快速开始

### 1. 数据同步配置

```bash
cd scripts

# 复制配置文件模板
copy config.example.json config.json

# 编辑配置文件，填入你的SSH和MySQL信息
# config.json:
# {
#   "ssh": {
#     "host": "跳板机IP",
#     "port": 22,
#     "username": "SSH用户名",
#     "key_path": "SSH密钥路径"
#   },
#   "mysql": {
#     "host": "MySQL主机",
#     "port": 3306,
#     "database": "rscdb30",
#     "user": "数据库用户名",
#     "password": "数据库密码"
#   },
#   "output": {
#     "dir": "../frontend/public/data"
#   },
#   "schedule": {
#     "time": "01:00",
#     "enabled": true
#   }
# }

# 安装Python依赖
pip install -r requirements.txt

# 单次执行同步
run_once.bat

# 或启动定时任务（每天凌晨1点自动同步）
run_scheduler.bat
```

### 2. 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 3. 部署到Vercel

#### 方式一：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
cd frontend
vercel

# 部署到生产环境
vercel --prod
```

#### 方式二：通过GitHub

1. 将代码推送到GitHub仓库
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 选择你的GitHub仓库
5. 配置：
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Deploy"

## 使用说明

### 查询流程

1. **选择公司**: 输入OID或公司简称搜索，最多选择10家公司
2. **选择时间范围**: 使用预设选项（7天/30天/3月/1年/3年）或自定义日期
3. **点击查询**: 加载并展示用户互动数据
4. **筛选结果**: 使用左侧筛选面板过滤数据
5. **查看详情**: 点击"查看详情"打开详情抽屉
6. **导出数据**: 点击"导出Excel"下载数据

### 筛选功能

**左侧筛选**:
- 认证类型（机构投资者、卖方分析师等）
- 机构类型（公募、私募、QFII等）
- 最近互动时间（近3天/7天/15天/30天）
- 最新报名时间
- 最新参会时间
- 是否首次参会

**右侧快速过滤**:
- 近X天报名过某公司路演的人

### 导出功能

- **导出Excel**: 导出当前筛选后的所有数据为xlsx文件
- **复制UID**: 一键复制结果中所有UID到剪贴板
- **单个复制**: 点击UID列直接复制

## 数据更新

数据通过Python脚本每日凌晨1点自动同步。数据范围为2025年1月1日以来的所有用户互动记录。

手动更新：
```bash
cd scripts
python sync_data.py
```

## 开发说明

### 添加新的筛选条件

1. 在 `src/types/index.ts` 中添加类型定义
2. 在 `src/store/index.ts` 中添加状态和action
3. 在 `src/components/FilterPanel/index.tsx` 中添加UI
4. 在 `src/utils/filter.ts` 中添加过滤逻辑

### 添加新的表格列

1. 在 `src/types/index.ts` 中的 `UserInteraction` 接口添加字段
2. 在 `scripts/sync_data.py` 中添加SQL查询字段
3. 在 `src/components/UserTable/index.tsx` 中添加列定义

## 常见问题

### Q: 数据同步失败怎么办？

A: 检查以下项目：
1. SSH密钥是否有效
2. 数据库连接信息是否正确
3. 网络是否能访问跳板机

### Q: 前端页面空白？

A: 检查以下项目：
1. `public/data/` 目录下是否有数据文件
2. 浏览器控制台是否有错误
3. 确认数据格式是否正确

### Q: 如何添加新公司？

A: 数据同步脚本会自动获取所有公司的数据，无需手动添加。

## License

Internal Use Only
