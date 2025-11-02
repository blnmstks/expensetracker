import { Layout, Menu, Button, Grid } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  WalletOutlined,
  BarChartOutlined,
  HistoryOutlined,
  SettingOutlined,
  PlusOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Expense } from '../../types';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface MainLayoutProps {
  expenses: Expense[];
  onLogout: () => void;
}

type MenuItem = Required<MenuProps>['items'][number];

export function MainLayout({
  onLogout,
}: MainLayoutProps) {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем активную вкладку из URL
  const getActiveTab = () => {
    const path = location.pathname.split('/')[1];
    return path || 'expenses';
  };

  const activeTab = getActiveTab();

  const menuItems: MenuItem[] = [
    {
      key: 'expenses',
      icon: <PlusOutlined />,
      label: 'Добавить расход',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Аналитика',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'История',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
    // {
    //   key: 'test-api',
    //   icon: <WalletOutlined />,
    //   label: '🧪 Test API',
    //   style: { borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px' },
    // },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(`/${e.key}`);
  };

  const handleNavClick = (key: string) => {
    navigate(`/${key}`);
  };

  const sidebarContent = (
    <>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <WalletOutlined style={{ fontSize: 24, color: '#2078F3', marginRight: 12 }} />
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          Трекер расходов
        </h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
      <div style={{ padding: 16, marginTop: 'auto', borderTop: '1px solid #f0f0f0' }}>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={onLogout}
          block
        >
          Выйти
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Десктопный сайдбар */}
      {screens.md && (
        <Sider
          width={256}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {sidebarContent}
          </div>
        </Sider>
      )}

      <Layout style={{ marginLeft: screens.md ? 256 : 0 }}>
        {/* Мобильный хедер */}
        {!screens.md && (
          <Header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              padding: '0 16px',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}
            >
              <WalletOutlined style={{ fontSize: 24, color: '#2078F3' }} />
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                }}
              >
                Трекер расходов
              </h1>
            </div>
            <Button
              type="primary"
              ghost
              size="small"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 999,
              }}
            />
          </Header>
        )}

        {/* Основной контент */}
        <Content
          style={{
            padding: screens.md ? '24px' : '16px',
            paddingBottom: screens.md ? '24px' : '80px', // Дополнительный отступ снизу для мобильного навбара
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>

        {/* Мобильный нижний навбар */}
        {!screens.md && (
          <div className="mobile-bottom-nav">
            {menuItems.map((item: any) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`mobile-nav-button ${activeTab === item.key ? 'active' : ''}`}
              >
                <span className="mobile-nav-icon">
                  {item.icon}
                </span>
                <span className="mobile-nav-label">
                  {item.key === 'expenses' ? 'Расходы' : 
                   item.key === 'analytics' ? 'Аналитика' : 
                   item.key === 'history' ? 'История' : 'Настройки'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Layout>
    </Layout>
  );
}
