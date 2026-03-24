# Vercel 部署指南

## 前置准备

1. 注册 [Vercel](https://vercel.com) 账号（可用GitHub账号登录）
2. 安装 Git（如未安装）

## 部署步骤

### 步骤一：初始化Git仓库

```bash
cd E:\AIwork\路演互动查询系统

git init
git add .
git commit -m "Initial commit: 路演互动用户查询系统"
```

### 步骤二：推送到GitHub

1. 登录 GitHub，创建新仓库 `roadshow-user-query`
2. 执行以下命令：

```bash
git remote add origin https://github.com/YOUR_USERNAME/roadshow-user-query.git
git branch -M main
git push -u origin main
```

### 步骤三：在Vercel部署

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 选择你刚创建的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 点击 **"Deploy"**

### 步骤四：验证部署

等待部署完成后，Vercel会提供一个 `.vercel.app` 域名，例如：
```
https://roadshow-user-query.vercel.app
```

访问该地址，你应该能看到路演互动用户查询系统的首页。

## 自动部署

一旦配置完成，每次你推送到 GitHub 的 `main` 分支，Vercel 会自动重新构建和部署。

## 数据更新流程

由于Vercel是静态站点，数据更新需要以下步骤：

1. **本地同步数据**:
   ```bash
   cd scripts
   python sync_data.py
   ```

2. **提交数据文件**:
   ```bash
   cd ..
   git add frontend/public/data/
   git commit -m "Update data: $(date +%Y-%m-%d)"
   git push
   ```

3. **Vercel自动部署**: 推送后Vercel会自动部署新数据

## 定时自动化

### 方案一：使用本地定时任务（推荐）

运行 `scripts/run_scheduler.bat`，脚本会在每天凌晨1点自动同步数据。

### 方案二：使用 GitHub Actions

创建 `.github/workflows/sync-data.yml`：

```yaml
name: Sync Data

on:
  schedule:
    - cron: '0 1 * * *'  # 每天凌晨1点 (UTC)
  workflow_dispatch:  # 允许手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: pip install -r scripts/requirements.txt
      
      - name: Run sync
        env:
          SSH_KEY: ${{ secrets.SSH_KEY }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: python scripts/sync_data.py
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add frontend/public/data/
          git diff --staged --quiet || git commit -m "Auto sync data $(date +%Y-%m-%d)"
          git push
```

**注意**：使用GitHub Actions需要在仓库Settings → Secrets中配置：
- `SSH_KEY`: SSH私钥内容
- `DB_PASSWORD`: 数据库密码
- 以及其他必要的配置信息

## 自定义域名（可选）

1. 在Vercel项目设置中点击 **"Domains"**
2. 输入你的自定义域名
3. 按照提示配置DNS记录

## 常见问题

### Q: 部署后数据为空？

A: 确认 `frontend/public/data/` 目录下有以下文件：
- `companies.json`
- `manifest.json`
- `oid_*.json`（公司数据文件）

### Q: 如何查看部署日志？

A: 在Vercel Dashboard → 项目 → Deployments → 点击具体部署 → 查看Build Logs

### Q: 如何回滚版本？

A: 在Vercel Dashboard → 项目 → Deployments → 找到要回滚的版本 → 点击"..." → "Promote to Production"
