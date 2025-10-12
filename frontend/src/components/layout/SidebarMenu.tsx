// src/components/layout/SidebarMenu.tsx

import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';

const SidebarMenu: React.FC = () => {
  const location = useLocation();

  return (
    <div>
        <div style={{ 
            height: '32px', 
            margin: '16px', 
            color: 'white', 
            textAlign: 'center', 
            fontSize: '18px', 
            fontWeight: 'bold',
            lineHeight: '32px'
        }}>
            AI REPORT
        </div>
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
            <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
                <Link to="/dashboard">Kontrol Paneli</Link>
            </Menu.Item>
            <Menu.Item key="/files" icon={<FileOutlined />}>
                <Link to="/files">Dosyalarım</Link>
            </Menu.Item>
            <Menu.Item key="/history" icon={<HistoryOutlined />}>
                <Link to="/history">Analiz Geçmişi</Link>
            </Menu.Item>
            <Menu.Item key="/reports" icon={<AreaChartOutlined />}>
                <Link to="/reports">Raporlarım</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="/team" icon={<TeamOutlined />}>
                <Link to="/team">Takım Yönetimi</Link>
            </Menu.Item>
            <Menu.Item key="/settings" icon={<SettingOutlined />}>
                <Link to="/settings">Ayarlar</Link>
            </Menu.Item>
        </Menu>
    </div>
  );
};

export default SidebarMenu;