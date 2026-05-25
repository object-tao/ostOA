import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import MobileApp from './MobileApp';
import './styles/global.css';

const host = window.location.hostname.toLowerCase();
const params = new URLSearchParams(window.location.search);
const useMobileApp = host === 'm.ostoa.org' || host.startsWith('m.') || params.get('mobile') === '1';
const RootApp = useMobileApp ? MobileApp : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
          colorBgLayout: '#f7f9fc',
          colorText: '#1f2937',
          colorTextSecondary: '#667085',
          colorBorder: '#e6ebf2',
          fontFamily: '"Aptos", "Segoe UI Variable", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: {
            controlHeight: 38,
            borderRadius: 10,
          },
          Card: {
            borderRadiusLG: 16,
            headerFontSize: 16,
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#344054',
            rowHoverBg: '#f5f8ff',
          },
        },
      }}
    >
      <RootApp />
    </ConfigProvider>
  </React.StrictMode>,
);
