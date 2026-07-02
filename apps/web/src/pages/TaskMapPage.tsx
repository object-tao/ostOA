import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Empty, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EnvironmentOutlined, FullscreenExitOutlined, FullscreenOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/client';
import { formatBeijingTime } from '../utils/date';

const { Text } = Typography;

type MapConfig = {
  id: string;
  provider: string;
  amapWebKey?: string | null;
  amapRestKey?: string | null;
  amapSecurityJsCode?: string | null;
  enabled: boolean;
  remark?: string | null;
};

type TaskMapItem = {
  id: string;
  taskNo: string;
  status?: string | null;
  progress?: number | null;
  vehicleNo?: string | null;
  vehicleType?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  projectName?: string | null;
  customerName?: string | null;
  customerShortName?: string | null;
  origin?: string | null;
  destination?: string | null;
  currentNodeName?: string | null;
  currentNodeStatus?: string | null;
  currentOwner?: string | null;
  requireGps: boolean;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  locatedAt?: string | null;
  locationUpdatedAt?: string | null;
  gpsDeviceNo?: string | null;
  gpsProviderShortName?: string | null;
};

declare global {
  interface Window {
    AMap?: any;
    _AMapSecurityConfig?: { securityJsCode?: string };
  }
}

let amapLoader: Promise<void> | null = null;

function loadAmap(config?: MapConfig | null) {
  if (window.AMap) return Promise.resolve();
  if (!config?.amapWebKey) return Promise.reject(new Error('请先在基础信息中配置高德地图 Web Key'));
  if (config.amapSecurityJsCode) {
    window._AMapSecurityConfig = { securityJsCode: config.amapSecurityJsCode };
  }
  if (!amapLoader) {
    amapLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'amap-js-api';
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(config.amapWebKey || '')}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('高德地图脚本加载失败'));
      document.head.appendChild(script);
    });
  }
  return amapLoader;
}

const hasPosition = (item: TaskMapItem) =>
  Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude));

export function TaskMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [items, setItems] = useState<TaskMapItem[]>([]);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const positionedItems = useMemo(() => items.filter(hasPosition), [items]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest<{ items: TaskMapItem[]; mapConfig: MapConfig }>('/api/task-map');
      setItems(result.items ?? []);
      setMapConfig(result.mapConfig ?? null);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapInstanceRef.current?.resize?.();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isFullscreen]);

  useEffect(() => {
    if (!mapRef.current || !mapConfig?.amapWebKey) return;
    let disposed = false;
    loadAmap(mapConfig)
      .then(() => {
        if (disposed || !mapRef.current || !window.AMap) return;
        const AMap = window.AMap;
        const map =
          mapInstanceRef.current ??
          new AMap.Map(mapRef.current, {
            zoom: 4,
            center: [84, 44],
            viewMode: '2D',
            resizeEnable: true,
          });
        mapInstanceRef.current = map;
        map.clearMap();
        const markers = positionedItems.map((item) => {
          const marker = new AMap.Marker({
            position: [Number(item.longitude), Number(item.latitude)],
            title: item.taskNo,
            label: { content: item.vehicleNo || item.taskNo, direction: 'top' },
          });
          const info = new AMap.InfoWindow({
            content: `<div style="min-width:220px;font-size:13px;line-height:1.7">
              <strong>${item.taskNo}</strong><br/>
              ${item.customerShortName || item.customerName || '-'} / ${item.projectName || '-'}<br/>
              ${item.origin || '-'} → ${item.destination || '-'}<br/>
              车辆：${item.vehicleNo || '-'} ${item.vehicleType || ''}<br/>
              节点：${item.currentNodeName || '-'}<br/>
              位置：${item.address || '-'}<br/>
              时间：${formatBeijingTime(item.locatedAt || item.locationUpdatedAt || '', true)}
            </div>`,
          });
          marker.on('click', () => info.open(map, marker.getPosition()));
          map.add(marker);
          return marker;
        });
        if (markers.length) {
          map.setFitView(markers, false, [80, 80, 80, 80], 16);
        }
      })
      .catch((error) => message.error((error as Error).message));
    return () => {
      disposed = true;
    };
  }, [mapConfig, positionedItems]);

  const refreshGps = async (record: TaskMapItem) => {
    try {
      setRefreshingId(record.id);
      await apiRequest(`/api/task-map/${record.id}/refresh-gps`, { method: 'POST' });
      message.success('GPS位置已刷新');
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setRefreshingId(null);
    }
  };

  const columns: ColumnsType<TaskMapItem> = [
    {
      title: '任务',
      dataIndex: 'taskNo',
      width: 210,
      fixed: 'left',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.taskNo}</Text>
          <Text type="secondary">{record.customerShortName || record.customerName || '-'}</Text>
          <Text type="secondary">{record.projectName || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '路线 / 节点',
      width: 210,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <span>{record.origin || '-'} → {record.destination || '-'}</span>
          <Space size={6}>
            <Tag color="blue">{record.currentNodeName || '-'}</Tag>
            <Text type="secondary">{record.currentOwner || '-'}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '车辆 / GPS',
      width: 190,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <span>{record.vehicleNo || '-'}</span>
          <Text type="secondary">{record.vehicleType || '-'}</Text>
          <Text type="secondary">
            {record.gpsProviderShortName || '-'} / {record.gpsDeviceNo || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '最新位置',
      width: 260,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <span>{record.address || '-'}</span>
          {hasPosition(record) ? (
            <Text type="secondary">
              {Number(record.latitude).toFixed(6)}, {Number(record.longitude).toFixed(6)}
            </Text>
          ) : (
            <Text type="secondary">未获取经纬度</Text>
          )}
          <Text type="secondary">{formatBeijingTime(record.locatedAt || record.locationUpdatedAt || '', true)}</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            disabled={!record.requireGps}
            loading={refreshingId === record.id}
            onClick={() => void refreshGps(record)}
          >
            刷新GPS
          </Button>
          {hasPosition(record) ? (
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => {
                window.open(
                  `https://uri.amap.com/marker?position=${record.longitude},${record.latitude}&name=${encodeURIComponent(record.taskNo)}`,
                  '_blank',
                );
              }}
            >
              地图
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div className={isFullscreen ? 'task-map-page task-map-page-fullscreen' : 'task-map-page'}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {!mapConfig?.amapWebKey ? (
        <Alert
          type="warning"
          showIcon
          message="高德地图 Web Key 未配置"
          description="请到基础信息的地图配置中维护高德 Web Key。没有 Key 时仍可查看任务明细，但无法显示地图。"
        />
      ) : null}

      <Card
        className="glass-card"
        title="运行任务位置"
        bordered={false}
        extra={
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => setIsFullscreen((value) => !value)}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </Button>
        }
      >
        <div className="task-map-layout">
          <div className="task-map-sidebar">
            <Table
              rowKey="id"
              size="small"
              loading={loading}
              dataSource={items}
              columns={columns}
              scroll={{ x: 1040, y: isFullscreen ? 'calc(100vh - 250px)' : 520 }}
              pagination={{ pageSize: 20, size: 'small' }}
            />
          </div>
          <div className="task-map-canvas" ref={mapRef}>
            {!positionedItems.length ? (
              <div className="task-map-empty">
                <Empty description="暂无可显示的GPS位置" />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
      </Space>
    </div>
  );
}
