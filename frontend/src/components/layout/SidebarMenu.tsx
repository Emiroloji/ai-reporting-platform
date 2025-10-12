// src/components/layout/SidebarMenu.tsx

import React from 'react';
import { Menu } from 'antd';
import {
    AppstoreOutlined,
    FileOutlined,
    HistoryOutlined,
    TeamOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const SidebarMenu: React.FC = () => {
    const location = useLocation();

    return (
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
            <Menu.Item key="/dashboard" icon={<AppstoreOutlined />}>
                <Link to="/dashboard">Gösterge Paneli</Link>
            </Menu.Item>
            <Menu.Item key="/files" icon={<FileOutlined />}>
                <Link to="/files">Dosyalarım</Link>
            </Menu.Item>
            <Menu.Item key="/history" icon={<HistoryOutlined />}>
                <Link to="/history">Analiz Geçmişi</Link>
            </Menu.Item>
            
            {/* Takım Yönetimi menü elemanı aktif edildi */}
            <Menu.Item key="/team" icon={<TeamOutlined />}>
                <Link to="/team">Takım Yönetimi</Link>
            </Menu.Item>

            <Menu.Divider />

            {/* <Menu.Item key="/settings" icon={<SettingOutlined />}>
                <Link to="/settings">Ayarlar</Link>
            </Menu.Item>
            <Menu.Item key="/logout" icon={<LogoutOutlined />}>
                <Link to="/logout">Çıkış Yap</Link>
            </Menu.Item> */}
        </Menu>
    );
};

export default SidebarMenu;