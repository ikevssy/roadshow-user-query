import { Drawer, Descriptions, Button } from 'antd';
import { LinkOutlined, EyeOutlined } from '@ant-design/icons';
import type { RankingApply, RankingEffect, RankingConversion, RankingTab } from '../../types/rankings';
import styles from './index.module.css';

interface RankingDetailProps {
  tab: RankingTab;
  data: RankingApply | RankingEffect | RankingConversion | null;
  open: boolean;
  onClose: () => void;
}

export function RankingDetail({ tab, data, open, onClose }: RankingDetailProps) {
  if (!data) return null;

  const renderApplyDetail = (item: RankingApply) => (
    <Descriptions column={2} bordered size="small">
      <Descriptions.Item label="路演标题" span={2}>{item.meet_title}</Descriptions.Item>
      <Descriptions.Item label="路演时间">{item.start_time}</Descriptions.Item>
      <Descriptions.Item label="公司">
        <a href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${item.oid}`} target="_blank" rel="noreferrer" className={styles.link}>
          {item.cn_short_name}
        </a>
      </Descriptions.Item>
      <Descriptions.Item label="股票代码">{item.stock_codes || '-'}</Descriptions.Item>
      <Descriptions.Item label="浏览数">{item.click_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="预约报名人次">{item.pre_apply_times ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="报名率%">{item.apply_rate != null ? `${item.apply_rate}%` : '-'}</Descriptions.Item>
      <Descriptions.Item label="标记不处理数">{item.skip_apply_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="直播参与人次">{item.live_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="预约参会率%">{item.attend_rate != null ? `${item.attend_rate}%` : '-'}</Descriptions.Item>
      <Descriptions.Item label="人均参会时长">{item.avg_watch_minutes != null ? `${item.avg_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="参会总时长">{item.total_watch_minutes != null ? `${item.total_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="提问数">{item.qa_count ?? '-'}</Descriptions.Item>
    </Descriptions>
  );

  const renderEffectDetail = (item: RankingEffect) => (
    <Descriptions column={2} bordered size="small">
      <Descriptions.Item label="路演标题" span={2}>{item.meet_title}</Descriptions.Item>
      <Descriptions.Item label="路演时间">{item.start_time}</Descriptions.Item>
      <Descriptions.Item label="公司">
        <a href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${item.oid}`} target="_blank" rel="noreferrer" className={styles.link}>
          {item.cn_short_name}
        </a>
      </Descriptions.Item>
      <Descriptions.Item label="股票代码">{item.stock_codes || '-'}</Descriptions.Item>
      <Descriptions.Item label="参会总时长">{item.total_watch_minutes != null ? `${item.total_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="总参与人次">{item.total_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="人均参会时长">{item.avg_watch_minutes != null ? `${item.avg_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="直播参与人次">{item.live_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="回看参与人次">{item.replay_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="回看总时长">{item.replay_watch_minutes != null ? `${item.replay_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="人均回看时长">{item.avg_replay_watch_minutes != null ? `${item.avg_replay_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="预约报名人次">{item.pre_apply_times ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="提问数">{item.qa_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="回看提醒人数">{item.remind_user_count ?? '-'}</Descriptions.Item>
    </Descriptions>
  );

  const renderConversionDetail = (item: RankingConversion) => (
    <Descriptions column={2} bordered size="small">
      <Descriptions.Item label="公司" span={2}>
        <a href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${item.oid}`} target="_blank" rel="noreferrer" className={styles.link}>
          {item.cn_short_name}
        </a>
      </Descriptions.Item>
      <Descriptions.Item label="股票代码" span={2}>{item.stock_codes || '-'}</Descriptions.Item>
      <Descriptions.Item label="参会总时长">{item.total_watch_minutes != null ? `${item.total_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="总参与人次">{item.total_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="人均参会时长">{item.avg_watch_minutes != null ? `${item.avg_watch_minutes}分钟` : '-'}</Descriptions.Item>
      <Descriptions.Item label="直播参与人次">{item.live_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="回看参与人次">{item.replay_join_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="提问数">{item.qa_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="新增订阅">{item.sub_user_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="取关">{item.unsub_user_count ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="特别关注">{item.special_focus_user_count ?? '-'}</Descriptions.Item>
    </Descriptions>
  );

  return (
    <Drawer
      title="详情"
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
    >
      <div className={styles.content}>
        {tab === 'apply' && renderApplyDetail(data as RankingApply)}
        {tab === 'effect' && renderEffectDetail(data as RankingEffect)}
        {tab === 'conversion' && renderConversionDetail(data as RankingConversion)}
        
        <div className={styles.actions}>
          {'mid' in data && (
            <Button
              type="primary"
              icon={<LinkOutlined />}
              href={`https://www.roadshowchina.cn/wap/m/meet/detail?mid=${(data as RankingApply | RankingEffect).mid}`}
              target="_blank"
            >
              路演详情
            </Button>
          )}
          <Button
            icon={<EyeOutlined />}
            href={`https://m.roadshowchina.cn/wap/s/company/index?oid=${data.oid}`}
            target="_blank"
          >
            公司详情
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
