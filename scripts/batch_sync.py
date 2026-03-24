#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量同步所有公司数据
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(__file__))
from sync_data import DataSyncer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def sync_single_company(syncer, company):
    """同步单个公司数据"""
    oid = company["oid"]
    cn_short_name = company["cn_short_name"]
    output_dir = Path(syncer.config["output"]["dir"])

    try:
        user_count = syncer.sync_company_data(oid, cn_short_name, output_dir)
        return {
            "oid": oid,
            "cn_short_name": cn_short_name,
            "user_count": user_count or 0,
            "success": True,
        }
    except Exception as e:
        logger.error(f"同步公司 {oid} ({cn_short_name}) 失败: {e}")
        return {
            "oid": oid,
            "cn_short_name": cn_short_name,
            "user_count": 0,
            "success": False,
            "error": str(e),
        }


def batch_sync_all():
    """批量同步所有公司数据"""
    start_time = time.time()
    logger.info("=" * 60)
    logger.info("开始批量同步所有公司数据...")
    logger.info("=" * 60)

    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    syncer = DataSyncer(config_path)

    try:
        # 建立连接
        syncer._create_ssh_tunnel()
        syncer._connect_mysql()

        # 获取公司列表
        companies = syncer.fetch_companies()
        total_companies = len(companies)
        logger.info(f"共 {total_companies} 家公司待同步")

        # 获取输出目录
        output_dir = Path(syncer.config["output"]["dir"])
        output_dir.mkdir(parents=True, exist_ok=True)

        # 保存公司列表
        companies_file = output_dir / "companies.json"
        with open(companies_file, "w", encoding="utf-8") as f:
            json.dump(companies, f, ensure_ascii=False, indent=2)

        # 检查已存在的数据文件
        existing_files = set()
        for f in output_dir.glob("oid_*.json"):
            existing_files.add(f.stem.replace("oid_", ""))

        # 过滤出需要同步的公司（跳过已存在的）
        companies_to_sync = [
            c for c in companies if str(c["oid"]) not in existing_files
        ]
        skipped = total_companies - len(companies_to_sync)

        logger.info(f"已存在数据文件: {skipped} 个")
        logger.info(f"待同步公司: {len(companies_to_sync)} 个")

        # 逐个同步（单线程避免SSH隧道问题）
        manifest_files = []
        success_count = 0
        fail_count = 0
        empty_count = 0

        # 首先添加已存在的文件到manifest
        for company in companies:
            oid = company["oid"]
            if str(oid) in existing_files:
                # 读取现有文件获取用户数量
                try:
                    with open(
                        output_dir / f"oid_{oid}.json", "r", encoding="utf-8"
                    ) as f:
                        data = json.load(f)
                        user_count = len(data)
                        if user_count > 0:
                            manifest_files.append(
                                {
                                    "oid": oid,
                                    "cn_short_name": company["cn_short_name"],
                                    "filename": f"oid_{oid}.json",
                                    "user_count": user_count,
                                }
                            )
                except:
                    pass

        for i, company in enumerate(companies_to_sync, 1):
            oid = company["oid"]
            cn_short_name = company["cn_short_name"]

            if i % 100 == 0 or i == 1:
                logger.info(f"[{i}/{len(companies_to_sync)}] 同步进度...")

            try:
                result = sync_single_company(syncer, company)

                if result["success"]:
                    if result["user_count"] > 0:
                        success_count += 1
                        manifest_files.append(
                            {
                                "oid": oid,
                                "cn_short_name": cn_short_name,
                                "filename": f"oid_{oid}.json",
                                "user_count": result["user_count"],
                            }
                        )
                        if i <= 10:  # 只打印前10个详细信息
                            logger.info(
                                f"  ✓ {oid} - {cn_short_name}: {result['user_count']} 条"
                            )
                    else:
                        empty_count += 1
                else:
                    fail_count += 1

            except Exception as e:
                fail_count += 1
                logger.error(f"  ✗ {oid} - {cn_short_name}: {e}")
                continue

        # 按用户数量排序
        manifest_files.sort(key=lambda x: x["user_count"], reverse=True)

        # 生成manifest
        manifest = {
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "companies_count": total_companies,
            "data_start_time": "2023-01-01",
            "synced_companies": len(manifest_files),
            "files": manifest_files,
        }

        manifest_file = output_dir / "manifest.json"
        with open(manifest_file, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        elapsed = time.time() - start_time
        logger.info("=" * 60)
        logger.info(f"同步完成!")
        logger.info(f"  总公司数: {total_companies}")
        logger.info(f"  有数据公司: {len(manifest_files)}")
        logger.info(f"  成功同步: {success_count}")
        logger.info(f"  无数据跳过: {empty_count}")
        logger.info(f"  同步失败: {fail_count}")
        logger.info(f"  耗时: {elapsed:.1f}秒 ({elapsed / 60:.1f}分钟)")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"批量同步失败: {e}")
        raise
    finally:
        syncer._close_connections()


if __name__ == "__main__":
    batch_sync_all()
