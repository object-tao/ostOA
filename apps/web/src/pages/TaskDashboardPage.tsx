import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Empty, Input, Progress, Select, Space, Spin, Statistic, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  CompressOutlined,
  ExpandOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { apiRequest } from '../api/client';
import { beijingTimeValue, formatBeijingTime } from '../utils/date';

const { Text } = Typography;
const DEFAULT_TIMING_START_NODE = '__DEFAULT_SECOND_NODE__';

type WorkflowNode = {
  id: string;
  nodeName: string;
  sortOrder: number;
  status?: string | null;
  owner?: string | null;
  timeoutAt?: string | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  plannedDurationHours?: number | null;
  warningBeforeHours?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

type TaskItem = {
  id: string;
  taskNo: string;
  status?: string | null;
  progress?: number | null;
  vehicleNo?: string | null;
  vehiclePlate?: string | null;
  vehicleInfo?: string | null;
  vehicleType?: string | null;
  driverName?: string | null;
  plannedDepartureDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  workflowStatus?: string | null;
  workflowCurrentNodeName?: string | null;
  workflowCurrentNodeStatus?: string | null;
  workflowNodes?: WorkflowNode[];
};

type ProjectItem = {
  id: string;
  projectNo?: string | null;
  name?: string | null;
  projectName?: string | null;
  customerName?: string | null;
  origin?: string | null;
  destination?: string | null;
  tasks?: TaskItem[];
};

type SchedulePredictionResult = {
  baseTime?: string;
  applied?: boolean;
  items?: WorkflowNode[];
};

type BoardTask = TaskItem & {
  projectNo?: string | null;
  projectName?: string | null;
  customerName?: string | null;
  origin?: string | null;
  destination?: string | null;
  firstStartedAt?: string | null;
  totalElapsedHours?: number | null;
  overdueNodes: number;
  runningNode?: WorkflowNode;
};

function textIncludes(value: unknown, words: string[]) {
  const text = String(value ?? '');
  return words.some((word) => text.includes(word));
}

function isNodeCompleted(node?: WorkflowNode | null) {
  if (!node) return false;
  const status = String(node.status ?? '').toUpperCase();
  return Boolean(
    node.completedAt ||
      textIncludes(node.status, ['已完成', '完成', '已跳过', '跳过']) ||
      ['COMPLETED', 'DONE', 'SKIPPED'].includes(status),
  );
}

function isTaskCompleted(task: Pick<TaskItem, 'status' | 'workflowStatus' | 'progress'>) {
  const statusText = [task.status, task.workflowStatus].map((value) => String(value ?? '')).join(' ');
  const upper = statusText.toUpperCase();
  return Boolean(
    Number(task.progress) >= 100 ||
      textIncludes(statusText, ['已完成', '完成', '已结束', '结束']) ||
      ['COMPLETED', 'FINISHED', 'DONE'].some((word) => upper.includes(word)),
  );
}

function hoursBetween(start?: string | null, end?: string | null) {
  const startTime = beijingTimeValue(start);
  const endTime = end ? beijingTimeValue(end) : Date.now();
  if (!startTime || !endTime || endTime < startTime) return null;
  return (endTime - startTime) / 36e5;
}

function formatHours(hours?: number | null) {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return '-';
  if (hours < 1) return String(Math.max(1, Math.round(hours * 60))) + '分钟';
  if (hours < 24) return hours.toFixed(1) + '小时';
  return (hours / 24).toFixed(1) + '天';
}

function formatBoardTime(value?: string | null) {
  const formatted = formatBeijingTime(value);
  if (!formatted || formatted === '-') return '-';
  const parts = formatted.split(' ');
  if (parts.length < 2) return formatted;
  const [, month, day] = parts[0].split('-');
  return `${month}${day} ${parts[1]}`;
}

function getExpectedHours(node: WorkflowNode) {
  if (Number(node.plannedDurationHours) > 0) return Number(node.plannedDurationHours);
  if (Number(node.timeoutAt) > 0) return Number(node.timeoutAt);
  const planned = hoursBetween(node.plannedStartAt, node.plannedEndAt);
  return planned && planned > 0 ? planned : null;
}

function getNodeActualHours(node: WorkflowNode) {
  if (node.startedAt) return hoursBetween(node.startedAt, node.completedAt);
  return null;
}

function isNodeOverdue(node: WorkflowNode) {
  if (isNodeCompleted(node)) return false;
  const expected = getExpectedHours(node);
  const actual = getNodeActualHours(node);
  return Boolean(expected && actual && actual > expected);
}

function sortNodes(nodes?: WorkflowNode[]) {
  return [...(nodes ?? [])].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
}

function getFirstStartedAt(nodes?: WorkflowNode[], fallback?: string | null) {
  const started = sortNodes(nodes)
    .map((node) => node.startedAt ?? node.completedAt)
    .filter(Boolean) as string[];
  return started.sort((a, b) => beijingTimeValue(a) - beijingTimeValue(b))[0] ?? fallback ?? null;
}

function getTimingStartNode(nodes?: WorkflowNode[], timingStartNodeName?: string) {
  const ordered = sortNodes(nodes);
  if (!ordered.length) return null;
  if (timingStartNodeName && timingStartNodeName !== DEFAULT_TIMING_START_NODE) {
    return ordered.find((node) => node.nodeName === timingStartNodeName) ?? ordered[1] ?? ordered[0];
  }
  return ordered[1] ?? ordered[0];
}

function getTimingStartedAt(nodes?: WorkflowNode[], timingStartNodeName?: string, fallback?: string | null) {
  const node = getTimingStartNode(nodes, timingStartNodeName);
  if (!node) return fallback ?? null;
  return node.startedAt ?? node.completedAt ?? null;
}

function getLastCompletedAt(nodes?: WorkflowNode[]) {
  const completed = sortNodes(nodes)
    .map((node) => node.completedAt)
    .filter(Boolean) as string[];
  return completed.sort((a, b) => beijingTimeValue(b) - beijingTimeValue(a))[0] ?? null;
}

function getRunningNode(task: TaskItem) {
  const nodes = sortNodes(task.workflowNodes);
  return (
    nodes.find((node) => !isNodeCompleted(node) && textIncludes(node.status, ['处理中', '待处理'])) ??
    nodes.find((node) => !isNodeCompleted(node)) ??
    nodes[nodes.length - 1]
  );
}

function getTaskSortTime(task: BoardTask) {
  return (
    beijingTimeValue(task.updatedAt) ||
    beijingTimeValue(task.createdAt) ||
    beijingTimeValue(task.plannedDepartureDate) ||
    beijingTimeValue(task.firstStartedAt) ||
    0
  );
}

function buildBoardTasks(projects: ProjectItem[], timingStartNodeName?: string): BoardTask[] {
  return projects
    .flatMap((project) =>
      (project.tasks ?? []).map((task) => {
        const nodes = sortNodes(task.workflowNodes);
        const completed = isTaskCompleted(task);
        const firstStartedAt = getTimingStartedAt(nodes, timingStartNodeName);
        const lastCompletedAt = completed ? getLastCompletedAt(nodes) ?? task.updatedAt ?? null : null;
        const totalElapsedHours = firstStartedAt ? hoursBetween(firstStartedAt, lastCompletedAt) : null;

        return {
          ...task,
          projectNo: project.projectNo,
          projectName: project.projectName ?? project.name,
          customerName: project.customerName,
          origin: project.origin,
          destination: project.destination,
          firstStartedAt,
          totalElapsedHours,
          overdueNodes: nodes.filter(isNodeOverdue).length,
          runningNode: completed ? undefined : getRunningNode(task),
        };
      }),
    )
    .sort((a, b) => getTaskSortTime(b) - getTaskSortTime(a));
}

function getPredictionFinishTime(result?: SchedulePredictionResult | null) {
  const nodes = sortNodes(result?.items);
  return [...nodes].reverse().find((node) => node.plannedEndAt)?.plannedEndAt ?? null;
}

function getNodeStatusText(node?: WorkflowNode) {
  if (!node) return '-';
  if (isNodeCompleted(node)) return '已完成';
  if (textIncludes(node.status, ['处理中'])) return '处理中';
  if (textIncludes(node.status, ['待处理'])) return '待处理';
  if (node.startedAt && !node.completedAt) return '处理中';
  return node.status || '未开始';
}

function getNodeStatusColor(node?: WorkflowNode) {
  if (!node) return 'default';
  if (isNodeOverdue(node)) return 'error';
  if (isNodeCompleted(node)) return 'success';
  if (textIncludes(node.status, ['处理中'])) return 'processing';
  if (textIncludes(node.status, ['待处理'])) return 'warning';
  return 'default';
}

function getCurrentNodeText(task: BoardTask) {
  if (isTaskCompleted(task)) return '已完成';
  return task.runningNode?.nodeName ?? task.workflowCurrentNodeName ?? '未开始';
}

function getProgressValue(task: BoardTask) {
  if (isTaskCompleted(task)) return 100;
  return Math.max(0, Math.min(100, Number(task.progress ?? 0)));
}

function getVehicleText(task: BoardTask) {
  return task.vehicleNo || task.vehiclePlate || task.vehicleInfo || task.vehicleType || '-';
}

function NodeCell({ node }: { node?: WorkflowNode }) {
  if (!node) return <Text type="secondary">-</Text>;
  const overdue = isNodeOverdue(node);
  return (
    <div className={overdue ? 'task-node-cell task-node-cell-overdue' : 'task-node-cell'}>
      <Tag color={getNodeStatusColor(node)}>{getNodeStatusText(node)}</Tag>
      <div>预计：{formatHours(getExpectedHours(node))}</div>
      <div className={overdue ? 'task-danger-text' : ''}>实际：{formatHours(getNodeActualHours(node))}</div>
      {node.startedAt ? <div>S: {formatBoardTime(node.startedAt)}</div> : null}
      {node.completedAt ? <div>E: {formatBoardTime(node.completedAt)}</div> : null}
    </div>
  );
}

export function TaskDashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [plateKeyword, setPlateKeyword] = useState('');
  const [timingStartNodeName, setTimingStartNodeName] = useState(DEFAULT_TIMING_START_NODE);
  const [predictions, setPredictions] = useState<Record<string, SchedulePredictionResult>>({});
  const [fullScreen, setFullScreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest<{ items: ProjectItem[] }>('/api/oversize-projects');
      setProjects(result.items ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '任务大屏加载失败');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const timingNodeOptions = useMemo(() => {
    const names = new Set<string>();
    projects.forEach((project) =>
      (project.tasks ?? []).forEach((task) => sortNodes(task.workflowNodes).forEach((node) => names.add(node.nodeName))),
    );
    return Array.from(names);
  }, [projects]);

  const allTasks = useMemo(() => buildBoardTasks(projects, timingStartNodeName), [projects, timingStartNodeName]);

  const filteredTasks = useMemo(() => {
    const keyword = plateKeyword.trim().toLowerCase();
    if (!keyword) return allTasks;
    return allTasks.filter((task) => getVehicleText(task).toLowerCase().includes(keyword));
  }, [allTasks, plateKeyword]);

  const nodeNames = useMemo(() => {
    const names = new Set<string>();
    filteredTasks.forEach((task) => sortNodes(task.workflowNodes).forEach((node) => names.add(node.nodeName)));
    return Array.from(names);
  }, [filteredTasks]);

  useEffect(() => {
    const ids = filteredTasks
      .slice(0, 60)
      .map((task) => task.id)
      .filter((id) => !predictions[id]);
    if (!ids.length) return;

    let cancelled = false;
    void Promise.all(
      ids.map(async (taskId) => {
        try {
          const result = await apiRequest<SchedulePredictionResult>(`/api/transport-tasks/${taskId}/workflow/schedule/predict`, {
            method: 'POST',
          });
          return [taskId, result] as const;
        } catch {
          return [taskId, null] as const;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setPredictions((previous) => {
        const next = { ...previous };
        results.forEach(([taskId, result]) => {
          if (result) next[taskId] = result;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [filteredTasks, predictions]);

  useEffect(() => {
    const onChange = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const unfinishedCount = filteredTasks.filter((task) => !isTaskCompleted(task)).length;
  const runningCount = filteredTasks.filter((task) => !isTaskCompleted(task) && task.runningNode).length;
  const overdueCount = filteredTasks.reduce((sum, task) => sum + task.overdueNodes, 0);

  const columns = useMemo<ColumnsType<BoardTask>>(() => {
    const baseColumns: ColumnsType<BoardTask> = [
      {
        title: '任务信息',
        width: 210,
        render: (_, task) => (
          <Space direction="vertical" size={2} className="task-info-cell">
            <Text strong>{task.taskNo}</Text>
            <Text type="secondary">{task.customerName || '-'}</Text>
            <Text type="secondary">{task.projectName || task.projectNo || '-'}</Text>
          </Space>
        ),
      },
      {
        title: '路线 / 当前节点',
        width: 165,
        render: (_, task) => (
          <Space direction="vertical" size={3}>
            <span>{task.origin || '-'} → {task.destination || '-'}</span>
            <Tag color={isTaskCompleted(task) ? 'success' : 'blue'}>{getCurrentNodeText(task)}</Tag>
          </Space>
        ),
      },
      {
        title: '总耗时 / 进度',
        width: 105,
        sorter: (a, b) => Number(a.totalElapsedHours ?? 0) - Number(b.totalElapsedHours ?? 0),
        render: (_, task) => (
          <Space direction="vertical" size={4} className="task-progress-cell">
            <Text>{formatHours(task.totalElapsedHours)}</Text>
            <Progress percent={getProgressValue(task)} size="small" showInfo={false} />
            <Text>{getProgressValue(task)}%</Text>
          </Space>
        ),
      },
      {
        title: '计时开始 / 预测',
        width: 118,
        render: (_, task) => (
          <Space direction="vertical" size={2}>
            <Text>S: {formatBoardTime(task.firstStartedAt)}</Text>
            <Text type="secondary">P: {formatBoardTime(getPredictionFinishTime(predictions[task.id]))}</Text>
          </Space>
        ),
      },
      {
        title: '车辆',
        width: 105,
        render: (_, task) => <Text>{getVehicleText(task)}</Text>,
      },
    ];

    const dynamicColumns: ColumnsType<BoardTask> = nodeNames.map((nodeName) => ({
      title: nodeName,
      width: 145,
      render: (_, task) => <NodeCell node={sortNodes(task.workflowNodes).find((node) => node.nodeName === nodeName)} />,
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [nodeNames, predictions]);

  const toggleFullScreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await wrapRef.current?.requestFullscreen();
  };

  return (
    <div ref={wrapRef} className={fullScreen ? 'task-dashboard-page task-dashboard-fullscreen' : 'task-dashboard-page'}>
      <div className="page-hero">
        <div>
          <div className="page-kicker">CENTRAL ASIA TRANSPORT</div>
          <h1>任务大屏</h1>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            刷新
          </Button>
          <Button icon={fullScreen ? <CompressOutlined /> : <ExpandOutlined />} onClick={toggleFullScreen}>
            {fullScreen ? '退出全屏' : '全屏'}
          </Button>
        </Space>
      </div>

      <Card className="dashboard-summary-card">
        <div className="dashboard-summary">
          <Statistic title="未完成任务" value={unfinishedCount} prefix={<ClockCircleOutlined />} />
          <Statistic title="进行中任务" value={runningCount} />
          <Statistic title="超时节点" value={overdueCount} valueStyle={{ color: overdueCount ? '#cf1322' : undefined }} prefix={<WarningOutlined />} />
          <div className="dashboard-filter-field">
            <Text type="secondary">开始计时节点</Text>
            <Select
              value={timingStartNodeName}
              onChange={setTimingStartNodeName}
              className="timing-node-select"
              options={[
                { value: DEFAULT_TIMING_START_NODE, label: '默认第二个节点' },
                ...timingNodeOptions.map((name) => ({ value: name, label: name })),
              ]}
            />
          </div>
          <div className="dashboard-filter-field">
            <Text type="secondary">车牌筛选</Text>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              value={plateKeyword}
              onChange={(event) => setPlateKeyword(event.target.value)}
              placeholder="按车牌号码筛选"
              className="plate-filter"
            />
          </div>
        </div>
      </Card>

      <Card>
        {overdueCount > 0 ? <Alert type="error" showIcon message={`当前共有 ${overdueCount} 个超时节点，请优先跟进红色标注的任务。`} /> : null}
        <Spin spinning={loading}>
          {filteredTasks.length ? (
            <Table<BoardTask>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filteredTasks}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: 705 + nodeNames.length * 145 }}
              rowClassName={(task) => (task.overdueNodes ? 'task-row-overdue' : '')}
            />
          ) : (
            <Empty description="暂无任务" />
          )}
        </Spin>
      </Card>

      <style>{`
        .task-dashboard-page {
          min-height: 100%;
          background: #f5f7fb;
          padding: 24px 24px 40px;
        }
        .task-dashboard-fullscreen {
          overflow: auto;
          padding: 18px;
        }
        .page-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .page-kicker {
          color: #667085;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .page-hero h1 {
          margin: 8px 0 0;
          font-size: 34px;
          line-height: 1.15;
        }
        .dashboard-summary-card {
          margin-bottom: 16px;
        }
        .dashboard-summary {
          display: grid;
          grid-template-columns: 120px 120px 120px minmax(190px, 260px) minmax(220px, 320px);
          align-items: end;
          gap: 24px;
        }
        .dashboard-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .timing-node-select {
          width: 100%;
        }
        .plate-filter {
          width: 100%;
        }
        .task-dashboard-page .ant-table {
          font-size: 12px;
        }
        .task-dashboard-page .ant-table-thead > tr > th {
          font-size: 12px;
          padding: 8px 10px;
          white-space: nowrap;
        }
        .task-dashboard-page .ant-table-tbody > tr > td {
          padding: 8px 10px;
          vertical-align: middle;
        }
        .task-info-cell .ant-typography {
          display: block;
          font-size: 12px;
          line-height: 1.55;
        }
        .task-progress-cell {
          width: 86px;
        }
        .task-node-cell {
          min-height: 92px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px 8px;
          color: #667085;
          font-size: 12px;
          line-height: 1.45;
          background: #fff;
        }
        .task-node-cell .ant-tag {
          margin-bottom: 4px;
          font-size: 11px;
          line-height: 18px;
        }
        .task-node-cell-overdue {
          border-color: #ff4d4f;
          background: #fff1f0;
        }
        .task-danger-text {
          color: #ff4d4f;
        }
        .task-row-overdue > td {
          background: #fff7f7;
        }
        @media (max-width: 900px) {
          .dashboard-summary {
            grid-template-columns: repeat(2, minmax(120px, 1fr));
          }
          .plate-filter {
            justify-self: stretch;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default TaskDashboardPage;
