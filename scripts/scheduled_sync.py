#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
定时同步任务脚本 - 直接调用，无需批处理文件
"""

import os
import sys
import subprocess
import logging
from datetime import datetime

# 配置
WORK_DIR = r"E:\AIwork\路演互动查询系统"
SCRIPTS_DIR = os.path.join(WORK_DIR, "scripts")
LOG_FILE = os.path.join(SCRIPTS_DIR, "sync_log.txt")

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler(LOG_FILE, encoding="utf-8"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


def run_sync():
    """执行同步任务"""
    logger.info("=" * 60)
    logger.info(f"定时同步开始: {datetime.now()}")
    logger.info("=" * 60)

    try:
        # 1. 同步公司数据
        logger.info("[1/4] 同步公司数据...")
        os.chdir(SCRIPTS_DIR)
        result = subprocess.run(
            [sys.executable, "auto_sync_all.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.returncode != 0:
            logger.error(f"公司数据同步失败: {result.stderr}")
            return False
        logger.info("公司数据同步完成")

        # 2. 同步行业数据
        logger.info("[2/4] 同步行业数据...")
        result = subprocess.run(
            [sys.executable, "sync_industry.py"],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.returncode != 0:
            logger.error(f"行业数据同步失败: {result.stderr}")
            return False
        logger.info("行业数据同步完成")

        # 3. 更新manifest
        logger.info("[3/4] 更新manifest...")
        result = subprocess.run(
            [
                sys.executable,
                "-c",
                """
import os, json
data_dir = 'frontend/public/data'
manifest_files = []
for f in os.listdir(data_dir):
    if f.startswith('oid_') and f.endswith('.json'):
        try:
            with open(os.path.join(data_dir, f), 'r', encoding='utf-8') as file:
                data = json.load(file)
                oid = int(f.replace('oid_', '').replace('.json', ''))
                user_count = len(data)
                if user_count > 0:
                    cn_name = data[0].get('interaction_company', 'Unknown')
                    manifest_files.append({'oid': oid, 'cn_short_name': cn_name, 'filename': f, 'user_count': user_count})
        except: pass
manifest_files.sort(key=lambda x: x['user_count'], reverse=True)
manifest = {'update_time': '"""
                + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                + """', 'companies_count': 52542, 'data_start_time': '2023-01-01', 'synced_companies': len(manifest_files), 'files': manifest_files[:500]}
with open(os.path.join(data_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f'已更新manifest，共 {len(manifest_files)} 家公司有数据')
""",
            ],
            cwd=WORK_DIR,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.returncode != 0:
            logger.error(f"更新manifest失败: {result.stderr}")
            return False
        logger.info("manifest更新完成")

        # 4. 推送到Git
        logger.info("[4/4] 推送到Git...")
        os.chdir(WORK_DIR)

        # Git add
        subprocess.run(["git", "add", "frontend/public/data/"], capture_output=True)

        # Git commit
        commit_msg = f"Auto sync: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        result = subprocess.run(
            ["git", "commit", "-m", commit_msg],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if "nothing to commit" not in result.stdout:
            logger.info("Git commit完成")

        # Git push
        result = subprocess.run(
            ["git", "push"], capture_output=True, text=True, encoding="utf-8"
        )
        if result.returncode != 0:
            logger.warning(f"Git push可能失败: {result.stderr}")
        else:
            logger.info("Git push完成")

        logger.info("=" * 60)
        logger.info(f"定时同步完成: {datetime.now()}")
        logger.info("=" * 60)
        return True

    except Exception as e:
        logger.error(f"同步过程出错: {e}")
        return False


if __name__ == "__main__":
    run_sync()
