#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
自动同步所有有用户互动数据的公司
"""

import os
import sys
import json
import time
import logging
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from sync_data import DataSyncer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def get_all_companies_with_data(syncer, start_time):
    """从数据库获取所有有用户互动数据的公司OID"""

    sql = """
    SELECT DISTINCT oid FROM (
        -- 有订阅记录的公司
        SELECT DISTINCT oid FROM rscdb30.user_follow_org 
        WHERE sys_valid = 1 AND sys_utime > '{start_time}'
        
        UNION
        
        -- 有参会记录的公司
        SELECT DISTINCT b.oid FROM rscdb30.meet_participation p
        JOIN rscdb30.meet_base b ON p.mid = b.mid
        WHERE p.sys_valid = 1 AND b.sys_valid = 1 
        AND p.join_time > '{start_time}'
        
        UNION
        
        -- 有报名记录的公司
        SELECT DISTINCT b.oid FROM rscdb30.meet_appointment p
        JOIN rscdb30.meet_base b ON p.mid = b.mid
        WHERE p.sys_valid = 1 AND b.sys_valid = 1 
        AND p.apply_time > '{start_time}'
    ) t
    WHERE oid NOT IN (6, 53201, 53000, 15283, 52998, 53557, 53181, 52212, 52207, 53180, 52949, 52948, 52169, 14714)
    """.format(start_time=start_time)

    with syncer.mysql_conn.cursor() as cursor:
        cursor.execute(sql)
        results = cursor.fetchall()

    return [row["oid"] for row in results]


def auto_sync_all():
    """自动同步所有有数据的公司"""
    start_time = time.time()
    logger.info("=" * 60)
    logger.info("开始自动同步所有有用户互动数据的公司...")
    logger.info("=" * 60)

    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    syncer = DataSyncer(config_path)
    data_start_time = "2023-01-01 00:00:00"

    try:
        # 建立连接
        syncer._create_ssh_tunnel()
        syncer._connect_mysql()

        # 获取输出目录
        output_dir = Path(syncer.config["output"]["dir"])
        output_dir.mkdir(parents=True, exist_ok=True)

        # 从数据库获取所有有数据的公司OID
        logger.info("正在查询所有有用户互动数据的公司...")
        oids_to_sync = get_all_companies_with_data(syncer, data_start_time)
        logger.info(f"找到 {len(oids_to_sync)} 家公司有用户互动数据")

        # 获取公司列表（用于查找名称）
        logger.info("获取公司名称...")
        companies = syncer.fetch_companies()
        company_map = {c["oid"]: c["cn_short_name"] for c in companies}

        # 保存公司列表
        companies_file = output_dir / "companies.json"
        with open(companies_file, "w", encoding="utf-8") as f:
            json.dump(companies, f, ensure_ascii=False, indent=2)
        logger.info(f"已保存 {len(companies)} 家公司列表")

        # 检查已存在的文件
        existing_files = set()
        for f in output_dir.glob("oid_*.json"):
            existing_files.add(f.stem.replace("oid_", ""))

        # 过滤需要同步的OID
        oids_to_sync_filtered = [
            oid for oid in oids_to_sync if str(oid) not in existing_files
        ]
        skipped = len(oids_to_sync) - len(oids_to_sync_filtered)

        logger.info(f"已存在数据: {skipped} 个")
        logger.info(f"待同步: {len(oids_to_sync_filtered)} 个")

        # 逐个同步
        success_count = 0
        empty_count = 0
        fail_count = 0
        manifest_files = []

        # 首先添加已存在的文件
        for oid in oids_to_sync:
            if str(oid) in existing_files:
                try:
                    with open(
                        output_dir / f"oid_{oid}.json", "r", encoding="utf-8"
                    ) as f:
                        data = json.load(f)
                        user_count = len(data)
                        if user_count > 0:
                            cn_name = company_map.get(oid, f"OID-{oid}")
                            manifest_files.append(
                                {
                                    "oid": oid,
                                    "cn_short_name": cn_name,
                                    "filename": f"oid_{oid}.json",
                                    "user_count": user_count,
                                }
                            )
                except:
                    pass

        # 同步新的OID
        for i, oid in enumerate(oids_to_sync_filtered, 1):
            cn_name = company_map.get(oid, f"OID-{oid}")

            if i % 100 == 0 or i <= 10:
                logger.info(
                    f"[{i}/{len(oids_to_sync_filtered)}] 同步: {oid} - {cn_name}"
                )

            try:
                user_count = syncer.sync_company_data(oid, cn_name, output_dir)

                if user_count and user_count > 0:
                    success_count += 1
                    manifest_files.append(
                        {
                            "oid": oid,
                            "cn_short_name": cn_name,
                            "filename": f"oid_{oid}.json",
                            "user_count": user_count,
                        }
                    )
                else:
                    empty_count += 1

            except Exception as e:
                fail_count += 1
                if fail_count <= 5:
                    logger.error(f"  ✗ {oid} - {cn_name}: {e}")

        # 按用户数量排序
        manifest_files.sort(key=lambda x: x["user_count"], reverse=True)

        # 更新manifest
        manifest = {
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "companies_count": len(companies),
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
        logger.info(f"  有数据公司总数: {len(oids_to_sync)}")
        logger.info(f"  成功同步: {len(manifest_files)}")
        logger.info(f"  无数据: {empty_count}")
        logger.info(f"  失败: {fail_count}")
        logger.info(f"  耗时: {elapsed:.1f}秒 ({elapsed / 60:.1f}分钟)")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"批量同步失败: {e}")
        raise
    finally:
        syncer._close_connections()


if __name__ == "__main__":
    auto_sync_all()
