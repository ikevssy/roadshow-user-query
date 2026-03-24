#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
路演互动用户查询 - 数据同步脚本
功能：每日凌晨1点从MySQL同步数据到JSON文件
"""

import os
import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import pymysql
from sshtunnel import SSHTunnelForwarder

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# 排除的内部公司OID
EXCLUDED_OIDS = [
    6,
    53201,
    53000,
    15283,
    52998,
    53557,
    53181,
    52212,
    52207,
    53180,
    52949,
    52948,
    52169,
    14714,
]


class DataSyncer:
    """路演互动数据同步器"""

    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
        self.config = self._load_config()
        self.ssh_tunnel: Optional[SSHTunnelForwarder] = None
        self.mysql_conn: Optional[pymysql.Connection] = None

    def _load_config(self) -> dict:
        """加载配置文件"""
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _create_ssh_tunnel(self):
        """建立SSH隧道"""
        ssh_config = self.config["ssh"]
        mysql_config = self.config["mysql"]

        logger.info(f"正在建立SSH隧道: {ssh_config['host']}:{ssh_config['port']}")

        self.ssh_tunnel = SSHTunnelForwarder(
            (ssh_config["host"], ssh_config["port"]),
            ssh_username=ssh_config["username"],
            ssh_pkey=ssh_config["key_path"],
            remote_bind_address=(mysql_config["host"], mysql_config["port"]),
            set_keepalive=60,
        )
        self.ssh_tunnel.start()
        logger.info(f"SSH隧道建立成功，本地端口: {self.ssh_tunnel.local_bind_port}")

    def _connect_mysql(self):
        """连接MySQL数据库"""
        mysql_config = self.config["mysql"]
        local_port = self.ssh_tunnel.local_bind_port

        self.mysql_conn = pymysql.connect(
            host="127.0.0.1",
            port=local_port,
            user=mysql_config["user"],
            password=mysql_config["password"],
            database=mysql_config["database"],
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )
        logger.info(f"MySQL连接成功: {mysql_config['database']}")

    def _close_connections(self):
        """关闭所有连接"""
        if self.mysql_conn:
            self.mysql_conn.close()
            self.mysql_conn = None
        if self.ssh_tunnel:
            self.ssh_tunnel.stop()
            self.ssh_tunnel = None
        logger.info("连接已关闭")

    def fetch_companies(self) -> list:
        """获取所有公司列表"""
        sql = """
        SELECT 
            o.oid,
            o.cn_short_name,
            p.logo_url
        FROM rscdb30.org_base o
        LEFT JOIN rscdb30.org_profile p ON o.oid = p.oid
        WHERE o.oid NOT IN ({})
        AND o.cn_short_name IS NOT NULL
        AND o.cn_short_name != ''
        ORDER BY o.oid
        """.format(",".join(map(str, EXCLUDED_OIDS)))

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        companies = [
            {
                "oid": row["oid"],
                "cn_short_name": row["cn_short_name"],
                "logo_url": row.get("logo_url"),
            }
            for row in result
        ]
        logger.info(f"获取到 {len(companies)} 家公司")
        return companies

    def fetch_user_interactions(self, oids: list, start_time: str) -> dict:
        """
        查询指定公司的用户互动数据
        返回格式: {oid: [user_records]}
        """
        if not oids:
            return {}

        oids_str = ",".join(map(str, oids))
        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        excluded_oids_str = ",".join(map(str, EXCLUDED_OIDS))

        # 主查询：获取用户互动汇总
        sql = """
        SELECT 
            u.uid,
            u.name AS user_name,
            a.audit_level,
            a.org_name,
            COALESCE(k.item_value, j.finance_class) AS org_type,
            a.oid AS user_oid,
            a.position_name,
            a.department_name,
            
            -- 最近互动时间
            GREATEST(
                COALESCE(app.latest_apply_time, '1970-01-01 00:00:00'),
                COALESCE(m.latest_attend_time, '1970-01-01 00:00:00'),
                COALESCE(f.latest_follow_time, '1970-01-01 00:00:00'),
                COALESCE(spec.latest_special_time, '1970-01-01 00:00:00')
            ) AS last_interaction_time,
            
            -- 最近互动行为类型
            CASE 
                WHEN COALESCE(app.latest_apply_time, '1970-01-01 00:00:00') = GREATEST(
                    COALESCE(app.latest_apply_time, '1970-01-01 00:00:00'),
                    COALESCE(m.latest_attend_time, '1970-01-01 00:00:00'),
                    COALESCE(f.latest_follow_time, '1970-01-01 00:00:00'),
                    COALESCE(spec.latest_special_time, '1970-01-01 00:00:00')
                ) THEN '报名'
                WHEN COALESCE(m.latest_attend_time, '1970-01-01 00:00:00') = GREATEST(
                    COALESCE(app.latest_apply_time, '1970-01-01 00:00:00'),
                    COALESCE(m.latest_attend_time, '1970-01-01 00:00:00'),
                    COALESCE(f.latest_follow_time, '1970-01-01 00:00:00'),
                    COALESCE(spec.latest_special_time, '1970-01-01 00:00:00')
                ) THEN '参会'
                WHEN COALESCE(f.latest_follow_time, '1970-01-01 00:00:00') = GREATEST(
                    COALESCE(app.latest_apply_time, '1970-01-01 00:00:00'),
                    COALESCE(m.latest_attend_time, '1970-01-01 00:00:00'),
                    COALESCE(f.latest_follow_time, '1970-01-01 00:00:00'),
                    COALESCE(spec.latest_special_time, '1970-01-01 00:00:00')
                ) THEN '订阅'
                WHEN COALESCE(spec.latest_special_time, '1970-01-01 00:00:00') = GREATEST(
                    COALESCE(app.latest_apply_time, '1970-01-01 00:00:00'),
                    COALESCE(m.latest_attend_time, '1970-01-01 00:00:00'),
                    COALESCE(f.latest_follow_time, '1970-01-01 00:00:00'),
                    COALESCE(spec.latest_special_time, '1970-01-01 00:00:00')
                ) THEN '特关'
                ELSE '无'
            END AS last_interaction_behavior,
            
            -- 互动的公司OID（取最近互动的公司）
            COALESCE(app.latest_apply_oid, m.latest_attend_oid, f.latest_follow_oid) AS interaction_oid,
            
            COALESCE(app.apply_count, 0) AS apply_count,
            COALESCE(m.attend_count, 0) AS attend_count,
            
            -- 是否首次参会
            CASE 
                WHEN COALESCE(m.attend_count, 0) > 0 AND COALESCE(h.history_attend_count, 0) < 1 THEN 1
                ELSE 0
            END AS is_first_attend
            
        FROM rscdb30.user_base u
        LEFT JOIN rscdb30.user_certificate_info a ON u.uid = a.uid
        
        -- 参会记录
        LEFT JOIN (
            SELECT 
                p.uid,
                b.oid AS latest_attend_oid,
                COUNT(DISTINCT p.mid) AS attend_count,
                MAX(p.join_time) AS latest_attend_time
            FROM rscdb30.meet_participation p
            JOIN rscdb30.meet_base b ON b.mid = p.mid
            WHERE p.join_time > '{start_time}'
              AND p.join_time < '{end_time}'
              AND p.uid IS NOT NULL
              AND p.sys_valid = 1
              AND b.oid IN ({oids_str})
            GROUP BY p.uid, b.oid
        ) m ON u.uid = m.uid
        
        -- 历史参会次数（用于判断首次参会）
        LEFT JOIN (
            SELECT 
                p.uid,
                COUNT(DISTINCT p.id) AS history_attend_count
            FROM rscdb30.meet_participation p
            JOIN rscdb30.meet_base b ON b.mid = p.mid
            WHERE p.join_time <= '{start_time}'
              AND p.uid IS NOT NULL
              AND p.sys_valid = 1
              AND b.oid IN ({oids_str})
            GROUP BY p.uid
        ) h ON u.uid = h.uid
        
        -- 订阅记录（按uid分组，不是按uid+oid）
        LEFT JOIN (
            SELECT 
                uid,
                COUNT(uid) AS follow_org_count,
                MAX(sys_utime) AS latest_follow_time,
                MIN(oid) AS latest_follow_oid
            FROM rscdb30.user_follow_org
            WHERE sys_valid = 1
              AND sys_utime > '{start_time}'
              AND sys_utime < '{end_time}'
              AND oid IN ({oids_str})
            GROUP BY uid
        ) f ON u.uid = f.uid
        
        -- 报名记录
        LEFT JOIN (
            SELECT
                p.uid,
                b.oid AS latest_apply_oid,
                COUNT(DISTINCT b.mid) AS apply_count,
                MAX(p.apply_time) AS latest_apply_time
            FROM rscdb30.meet_appointment p
            LEFT JOIN rscdb30.meet_base b ON p.mid = b.mid
            WHERE p.apply_time > '{start_time}'
              AND p.apply_time < '{end_time}'
              AND p.sys_valid = 1
              AND b.sys_valid = 1
              AND b.oid IN ({oids_str})
              AND p.uid IS NOT NULL
            GROUP BY p.uid, b.oid
        ) app ON u.uid = app.uid
        
        -- 特别关注记录
        LEFT JOIN (
            SELECT 
                a.uid,
                MAX(a.sys_utime) AS latest_special_time
            FROM rscdb30.distribute_list a
            JOIN rscdb30.org_base o ON a.oid = o.oid
            WHERE a.sys_valid = 1
              AND a.sys_utime > '{start_time}'
              AND a.sys_utime < '{end_time}'
              AND a.oid IN ({oids_str})
            GROUP BY a.uid
        ) spec ON u.uid = spec.uid
        
        LEFT JOIN rscdb30.org_base j ON a.oid = j.oid
        LEFT JOIN rscdb30.sys_dict k ON k.item_id = j.finance_class AND k.class_code = 'finance_class'
        
        WHERE 
            (COALESCE(m.attend_count, 0) > 0 OR COALESCE(f.follow_org_count, 0) > 0 OR COALESCE(app.apply_count, 0) > 0)
            AND a.oid NOT IN ({excluded_oids})
        GROUP BY u.uid
        ORDER BY last_interaction_time DESC
        """.format(
            start_time=start_time,
            end_time=end_time,
            oids_str=oids_str,
            excluded_oids=excluded_oids_str,
        )

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        return result

    def fetch_apply_records(self, uids: list, oids: list) -> dict:
        """获取报名记录详情"""
        if not uids or not oids:
            return {}

        uids_str = ",".join(map(str, uids))
        oids_str = ",".join(map(str, oids))
        start_time = "2023-01-01 00:00:00"

        sql = f"""
        SELECT
            p.uid,
            DATE_FORMAT(p.apply_time, '%Y-%m-%d') AS apply_time,
            b.meet_title
        FROM rscdb30.meet_appointment p
        LEFT JOIN rscdb30.meet_base b ON p.mid = b.mid
        WHERE p.apply_time >= '{start_time}'
          AND p.sys_valid = 1
          AND b.sys_valid = 1
          AND b.oid IN ({oids_str})
          AND p.uid IN ({uids_str})
        ORDER BY p.apply_time DESC
        """

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        records = {}
        for row in result:
            uid = str(row["uid"])
            if uid not in records:
                records[uid] = []
            records[uid].append(
                {"time": row["apply_time"], "meet_title": row["meet_title"]}
            )
        return records

    def fetch_attend_records(self, uids: list, oids: list) -> dict:
        """获取参会记录详情"""
        if not uids or not oids:
            return {}

        uids_str = ",".join(map(str, uids))
        oids_str = ",".join(map(str, oids))
        start_time = "2023-01-01 00:00:00"

        sql = """
        SELECT 
            v.uid,
            DATE_FORMAT(v.start_time, '%Y-%m-%d') AS join_time,
            b.meet_title,
            LEAST((v.duration / 60000), 240) AS duration_min
        FROM rscdb30.meet_view_statistic v
        JOIN rscdb30.meet_base b ON b.mid = v.mid
        WHERE v.start_time >= '{start_time}'
          AND v.uid IS NOT NULL
          AND v.sys_valid = 1
          AND b.oid IN ({oids_str})
          AND v.uid IN ({uids_str})
        ORDER BY v.start_time DESC
        """.format(start_time=start_time, oids_str=oids_str, uids_str=uids_str)

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        records = {}
        for row in result:
            uid = str(row["uid"])
            if uid not in records:
                records[uid] = []
            records[uid].append(
                {
                    "time": row["join_time"],
                    "meet_title": row["meet_title"],
                    "duration": int(row["duration_min"]) if row["duration_min"] else 0,
                }
            )
        return records

    def fetch_subscribe_records(self, uids: list) -> dict:
        """获取订阅公司明细"""
        if not uids:
            return {}

        uids_str = ",".join(map(str, uids))
        start_time = "2023-01-01 00:00:00"

        sql = f"""
        SELECT 
            a.uid,
            o.cn_short_name,
            DATE_FORMAT(a.sys_utime, '%Y-%m-%d') AS subscribe_time
        FROM rscdb30.user_follow_org a
        LEFT JOIN rscdb30.org_base o ON a.oid = o.oid
        WHERE a.sys_valid = 1
          AND a.sys_utime >= '{start_time}'
          AND a.uid IN ({uids_str})
        ORDER BY a.sys_utime DESC
        """

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        records = {}
        for row in result:
            uid = str(row["uid"])
            if uid not in records:
                records[uid] = []
            records[uid].append(
                {"company": row["cn_short_name"], "time": row["subscribe_time"]}
            )
        return records

    def fetch_special_companies(self, uids: list) -> dict:
        """获取特别关注公司列表"""
        if not uids:
            return {}

        uids_str = ",".join(map(str, uids))
        start_time = "2023-01-01 00:00:00"

        sql = f"""
        SELECT 
            a.uid,
            GROUP_CONCAT(DISTINCT o.cn_short_name ORDER BY o.cn_short_name SEPARATOR ',') AS companies
        FROM rscdb30.distribute_list a
        JOIN rscdb30.org_base o ON a.oid = o.oid
        WHERE a.sys_valid = 1
          AND a.sys_utime >= '{start_time}'
          AND a.uid IN ({uids_str})
        GROUP BY a.uid
        """

        with self.mysql_conn.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()

        return {str(row["uid"]): row["companies"] for row in result}

    def get_cert_type(self, audit_level) -> str:
        """获取认证类型名称"""
        cert_types = {
            1: "机构投资者",
            2: "卖方分析师",
            3: "上市公司",
            4: "服务机构",
            5: "金融机构",
            6: "媒体",
            99: "个人",
            "-1": "未分类",
        }
        return cert_types.get(audit_level, "缺少分类")

    def sync_company_data(self, oid: int, cn_short_name: str, output_dir: Path):
        """同步单个公司的用户互动数据"""
        logger.info(f"开始同步公司数据: {oid} - {cn_short_name}")

        start_time = "2023-01-01 00:00:00"

        # 获取用户互动汇总
        users = self.fetch_user_interactions([oid], start_time)

        if not users:
            logger.info(f"  公司 {oid} 无用户互动数据")
            return None

        uids = [row["uid"] for row in users]

        # 批量获取详情（分批处理，避免SQL过长）
        batch_size = 500
        apply_records = {}
        attend_records = {}
        subscribe_records = {}
        special_companies = {}

        for i in range(0, len(uids), batch_size):
            batch_uids = uids[i : i + batch_size]
            apply_records.update(self.fetch_apply_records(batch_uids, [oid]))
            attend_records.update(self.fetch_attend_records(batch_uids, [oid]))
            subscribe_records.update(self.fetch_subscribe_records(batch_uids))
            special_companies.update(self.fetch_special_companies(batch_uids))

        # 组装数据
        user_list = []
        for row in users:
            uid = str(row["uid"])

            # 获取互动的公司名称
            interaction_oid = row.get("interaction_oid")
            interaction_company = ""
            if interaction_oid:
                # 这里简化处理，实际应该查询公司名称
                interaction_company = cn_short_name

            user_list.append(
                {
                    "uid": uid,
                    "name": row.get("user_name", ""),
                    "org_name": row.get("org_name", ""),
                    "org_type": row.get("org_type", ""),
                    "cert_type": self.get_cert_type(row.get("audit_level")),
                    "position": row.get("position_name", ""),
                    "department": row.get("department_name", ""),
                    "last_interaction_time": str(row.get("last_interaction_time", "")),
                    "last_interaction_behavior": row.get(
                        "last_interaction_behavior", ""
                    ),
                    "interaction_company": interaction_company,
                    "apply_count": row.get("apply_count", 0),
                    "apply_records": apply_records.get(uid, []),
                    "attend_count": row.get("attend_count", 0),
                    "attend_records": attend_records.get(uid, []),
                    "is_first_attend": bool(row.get("is_first_attend", 0)),
                    "subscribed_companies": subscribe_records.get(uid, []),
                    "special_companies": special_companies.get(uid, ""),
                }
            )

        # 保存JSON
        output_file = output_dir / f"oid_{oid}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(user_list, f, ensure_ascii=False, indent=2)

        logger.info(f"  已保存 {len(user_list)} 条用户数据到 {output_file}")
        return len(user_list)

    def sync_all(self):
        """同步所有数据"""
        start_time = time.time()
        logger.info("=" * 50)
        logger.info("开始数据同步...")
        logger.info("=" * 50)

        try:
            # 建立连接
            self._create_ssh_tunnel()
            self._connect_mysql()

            # 获取输出目录
            output_dir = Path(self.config["output"]["dir"])
            output_dir.mkdir(parents=True, exist_ok=True)

            # 获取公司列表
            companies = self.fetch_companies()

            # 保存公司列表
            companies_file = output_dir / "companies.json"
            with open(companies_file, "w", encoding="utf-8") as f:
                json.dump(companies, f, ensure_ascii=False, indent=2)
            logger.info(f"已保存公司列表: {len(companies)} 家")

            # 逐公司同步数据
            manifest_files = []
            for i, company in enumerate(companies, 1):
                oid = company["oid"]
                cn_short_name = company["cn_short_name"]

                logger.info(f"[{i}/{len(companies)}] 处理公司: {oid} - {cn_short_name}")

                try:
                    user_count = self.sync_company_data(oid, cn_short_name, output_dir)
                    if user_count:
                        manifest_files.append(
                            {
                                "oid": oid,
                                "cn_short_name": cn_short_name,
                                "filename": f"oid_{oid}.json",
                                "user_count": user_count,
                            }
                        )
                except Exception as e:
                    logger.error(f"  同步公司 {oid} 失败: {e}")
                    continue

            # 生成manifest
            manifest = {
                "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "companies_count": len(companies),
                "data_start_time": "2023-01-01",
                "files": manifest_files,
            }

            manifest_file = output_dir / "manifest.json"
            with open(manifest_file, "w", encoding="utf-8") as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2)

            elapsed = time.time() - start_time
            logger.info("=" * 50)
            logger.info(f"同步完成!")
            logger.info(f"  公司数量: {len(companies)}")
            logger.info(f"  数据文件: {len(manifest_files)}")
            logger.info(f"  耗时: {elapsed:.1f}秒")
            logger.info("=" * 50)

        except Exception as e:
            logger.error(f"同步失败: {e}")
            raise
        finally:
            self._close_connections()


def run_scheduler():
    """定时任务模式"""
    import schedule

    config_path = os.path.join(os.path.dirname(__file__), "config.json")

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    schedule_time = config.get("schedule", {}).get("time", "01:00")

    def job():
        syncer = DataSyncer(config_path)
        syncer.sync_all()

    logger.info(f"定时任务已设置，每天 {schedule_time} 执行")
    schedule.every().day.at(schedule_time).do(job)

    # 启动时立即执行一次
    logger.info("启动时立即执行一次同步...")
    job()

    while True:
        schedule.run_pending()
        time.sleep(60)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="路演互动用户数据同步脚本")
    parser.add_argument("--config", default="config.json", help="配置文件路径")
    parser.add_argument("--schedule", action="store_true", help="定时任务模式")
    parser.add_argument("--company", type=int, help="只同步指定OID的公司")

    args = parser.parse_args()

    config_path = os.path.join(os.path.dirname(__file__), args.config)

    if args.schedule:
        run_scheduler()
    else:
        syncer = DataSyncer(config_path)

        if args.company:
            # 同步单个公司
            syncer._create_ssh_tunnel()
            syncer._connect_mysql()

            output_dir = Path(syncer.config["output"]["dir"])
            output_dir.mkdir(parents=True, exist_ok=True)

            # 获取公司名称
            with syncer.mysql_conn.cursor() as cursor:
                cursor.execute(
                    f"SELECT cn_short_name FROM org_base WHERE oid = {args.company}"
                )
                result = cursor.fetchone()
                cn_short_name = result["cn_short_name"] if result else "Unknown"

            syncer.sync_company_data(args.company, cn_short_name, output_dir)
            syncer._close_connections()
        else:
            # 同步所有公司
            syncer.sync_all()


if __name__ == "__main__":
    main()
