#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
同步公司行业数据
"""

import os
import sys
import json
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


def sync_industry():
    """同步公司行业数据"""
    logger.info("=" * 60)
    logger.info("开始同步公司行业数据...")
    logger.info("=" * 60)

    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    syncer = DataSyncer(config_path)

    try:
        syncer._create_ssh_tunnel()
        syncer._connect_mysql()

        # 获取输出目录
        output_dir = Path(syncer.config["output"]["dir"])
        output_dir.mkdir(parents=True, exist_ok=True)

        # 查询公司行业数据
        sql = """
        SELECT
            o.oid AS oid,
            o.cn_short_name AS cn_short_name,
            COALESCE(indu.industries, '') AS industries
        FROM org_base o
        LEFT JOIN (
            SELECT
                mim.oid,
                GROUP_CONCAT(DISTINCT sd.item_value ORDER BY sd.item_value SEPARATOR ',') AS industries
            FROM org_industry_map mim
            JOIN sys_dict sd
                ON sd.class_code = 'u_research_preference'
               AND sd.item_code = mim.indu_id
               AND sd.sys_valid = 1
            WHERE mim.sys_valid = 1
            GROUP BY mim.oid
        ) indu ON o.oid = indu.oid
        WHERE o.sys_valid = 1
            AND o.oid NOT IN (6, 53201, 53000, 15283, 52998, 53557, 53181, 52212, 52207, 53180, 52949, 52948, 52169, 14714)
        ORDER BY o.oid
        """

        logger.info("正在查询公司行业数据...")
        with syncer.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()

        logger.info(f"查询到 {len(results)} 家公司")

        # 处理数据
        industries_set = set()
        company_industry_map = {}
        company_list = []

        for row in results:
            oid = row["oid"]
            cn_short_name = row["cn_short_name"]
            industries_str = row["industries"]

            if industries_str:
                industry_list = [ind.strip() for ind in industries_str.split(",")]
                industries_set.update(industry_list)
                company_industry_map[str(oid)] = industry_list
            else:
                company_industry_map[str(oid)] = []

            company_list.append(
                {
                    "oid": oid,
                    "cn_short_name": cn_short_name,
                    "industries": industry_list if industries_str else [],
                }
            )

        # 构建行业到公司的映射
        industry_company_map = {}
        for industry in industries_set:
            industry_company_map[industry] = [
                c["oid"] for c in company_list if industry in c.get("industries", [])
            ]

        # 保存数据
        industry_data = {
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "industries": sorted(list(industries_set)),
            "company_industry_map": company_industry_map,
            "industry_company_map": industry_company_map,
            "total_companies": len(company_list),
        }

        output_file = output_dir / "industries.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(industry_data, f, ensure_ascii=False, indent=2)

        logger.info(f"已保存行业数据到 {output_file}")
        logger.info(f"  行业数量: {len(industries_set)}")
        logger.info(f"  公司数量: {len(company_list)}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"同步行业数据失败: {e}")
        raise
    finally:
        syncer._close_connections()


if __name__ == "__main__":
    sync_industry()
