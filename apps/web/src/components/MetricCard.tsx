import { Card, Statistic } from 'antd';

export function MetricCard(props: { title: string; value: string | number; suffix?: string }) {
  return (
    <Card className="glass-card">
      <Statistic title={props.title} value={props.value} suffix={props.suffix} />
    </Card>
  );
}
