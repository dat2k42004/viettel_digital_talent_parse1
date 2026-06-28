import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Button, Dropdown, Avatar, Space,
  Typography, Breadcrumb, theme, Badge, Modal, Form, Input, Descriptions, message, Tag, ConfigProvider, Tooltip
} from 'antd';
import type { MenuProps } from 'antd';
import { observer } from 'mobx-react-lite';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  DashboardOutlined, FileTextOutlined, LaptopOutlined,
  GlobalOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, SwapOutlined, LogoutOutlined,
  ToolOutlined, ScanOutlined, BarChartOutlined, SettingOutlined,
  KeyOutlined, SolutionOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { authStore, QUYEN } from '../stores/AuthStore';
import { doiMatKhau, logout } from '../api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = observer(() => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();

  // Trạng thái giao diện tối (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);



  // Trạng thái hiển thị Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formDoiMatKhau] = Form.useForm();

  // Đăng xuất liên kết API thực tế
  const handleDangXuat = async () => {
    const refreshTokenKey = localStorage.getItem('refreshToken') || '';
    try {
      await logout({ refreshToken: refreshTokenKey });
    } catch (e) {
      // Cho phép thoát ở client kể cả khi API gặp sự cố
    }
    authStore.dangXuat();
    message.success('Đăng xuất khỏi hệ thống thành công!');
    navigate('/login');
  };

  // Đổi mật khẩu liên kết API thực tế
  const handleDoiMatKhau = async (values: { matKhauCu: string; matKhauMoi: string }) => {
    try {
      const res = await doiMatKhau({
        matKhauCu: values.matKhauCu,
        matKhauMoi: values.matKhauMoi,
      });
      message.success(res.message || 'Đổi mật khẩu tài khoản thành công!');
      setIsPasswordModalOpen(false);
      formDoiMatKhau.resetFields();
    } catch (error: any) {
      const msg = error?.message || 'Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu cũ!';
      message.error(msg);
    }
  };

  // Tạo danh sách menu với tiếng Việt có dấu và lọc dựa trên phân quyền từ AuthStore
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Tổng quan</Link>,
    },
    authStore.kiemTraQuyen([QUYEN.XEM_BAO_CAO, QUYEN.THAO_TAC_TAI_SAN])
      ? {
          key: '/assets',
          icon: <LaptopOutlined />,
          label: <Link to="/assets">Quản lý tài sản</Link>,
        }
      : null,
    authStore.kiemTraQuyen(QUYEN.THAO_TAC_TAI_SAN)
      ? {
          key: '/lifecycle',
          icon: <FileTextOutlined />,
          label: <Link to="/lifecycle">Vòng đời tài sản</Link>,
        }
      : null,
    authStore.kiemTraQuyen(QUYEN.THAO_TAC_TAI_SAN)
      ? {
          key: '/maintenance',
          icon: <ToolOutlined />,
          label: <Link to="/maintenance">Bảo trì & Bảo hành</Link>,
        }
      : null,
    authStore.kiemTraQuyen(QUYEN.THAO_TAC_TAI_SAN)
      ? {
          key: '/inventory',
          icon: <ScanOutlined />,
          label: <Link to="/inventory">Đối soát kiểm kê</Link>,
        }
      : null,
    authStore.kiemTraQuyen(QUYEN.XEM_BAO_CAO)
      ? {
          key: '/reports',
          icon: <BarChartOutlined />,
          label: <Link to="/reports">Báo cáo thống kê</Link>,
        }
      : null,
    authStore.kiemTraQuyen(QUYEN.XEM_QUAN_TRI_TOAN_SAN)
      ? {
          key: '/tenants',
          icon: <GlobalOutlined />,
          label: <Link to="/tenants">Đơn vị (SaaS)</Link>,
        }
      : null,
    // Phân hệ Quản lý Người dùng / Hệ thống bảo mật
    authStore.kiemTraQuyen([QUYEN.XEM_NGUOI_DUNG, QUYEN.XEM_VAI_TRO])
      ? {
          key: 'security-system',
          icon: <SettingOutlined />,
          label: 'Hệ thống bảo mật',
          children: [
            authStore.kiemTraQuyen(QUYEN.XEM_NGUOI_DUNG)
              ? {
                  key: '/nguoi-dung',
                  label: <Link to="/nguoi-dung">Quản lý tài khoản</Link>,
                }
              : null,
            authStore.kiemTraQuyen(QUYEN.XEM_VAI_TRO)
              ? {
                  key: '/vai-tro',
                  label: <Link to="/vai-tro">Vai trò & Quyền hạn</Link>,
                }
              : null,
          ].filter(Boolean),
        }
      : null,
  ].filter(Boolean) as MenuProps['items'];



  // Avatar Dropdown Menu (Tiếng Việt)
  const avatarMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SolutionOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => setIsProfileModalOpen(true),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => setIsPasswordModalOpen(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất tài khoản',
      danger: true,
      onClick: handleDangXuat,
    },
  ];

  // Active key
  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0] || '/';

  // Chuyển đổi tên đường dẫn sang tiếng Việt có dấu trên Breadcrumb
  const translatePath = (path: string) => {
    const maps: Record<string, string> = {
      assets: 'Quản lý tài sản',
      lifecycle: 'Vòng đời tài sản',
      maintenance: 'Bảo trì & Bảo hành',
      inventory: 'Đối soát kiểm kê',
      reports: 'Báo cáo thống kê',
      tenants: 'Cấu hình Đơn vị',
      'nguoi-dung': 'Quản lý tài khoản',
      'vai-tro': 'Vai trò & Quyền hạn',
    };
    return maps[path] || path;
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <Link to="/">Trang chủ</Link> },
    ...pathParts.map((part, i) => ({
      title: <Link to={`/${pathParts.slice(0, i + 1).join('/')}`}>{translatePath(part)}</Link>,
    })),
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* ===== SIDEBAR ===== */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          theme="dark"
          trigger={null}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? 0 : '0 24px',
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
            }}
          >
            {!collapsed && (
              <Text strong style={{ color: '#fff', fontSize: 16 }}>
                ITAM Enterprise
              </Text>
            )}
            {collapsed && <LaptopOutlined style={{ color: '#fff', fontSize: 20 }} />}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ borderRight: 0, marginTop: 8 }}
          />
        </Sider>

        <Layout>
          {/* ===== HEADER ===== */}
          <Header
            style={{
              background: isDarkMode ? token.colorBgContainer : '#fff',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0',
              height: 64,
            }}
          >
            {/* Trái: Triggers & Breadcrumbs */}
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              <Breadcrumb items={breadcrumbItems} />
            </Space>

            {/* Phải: Dark Mode + Role Selector + Profile */}
            <Space size="middle">
              {/* Bộ chuyển đổi giao diện Sáng/Tối */}
              <Tooltip title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}>
                <Button
                  type="text"
                  icon={isDarkMode ? <SunOutlined style={{ color: '#fadb14', fontSize: 16 }} /> : <MoonOutlined style={{ fontSize: 16 }} />}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                />
              </Tooltip>



              <Dropdown menu={{ items: avatarMenuItems }} trigger={['click']}>
                <Space style={{ cursor: 'pointer' }}>
                  <Badge dot status="success">
                    <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
                  </Badge>
                  <Text strong>{authStore.tenNguoiDung}</Text>
                </Space>
              </Dropdown>
            </Space>
          </Header>

          {/* ===== CONTENT ===== */}
          <Content
            style={{
              margin: 24,
              minHeight: 'calc(100vh - 64px - 48px)',
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>

        {/* ===== MODAL: HỒ SƠ CÁ NHÂN (Tiếng Việt) ===== */}
        <Modal
          title="Hồ sơ tài khoản cá nhân"
          open={isProfileModalOpen}
          onCancel={() => setIsProfileModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsProfileModalOpen(false)}>
              Đóng lại
            </Button>
          ]}
        >
          {authStore.currentUserProfile ? (
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Họ và tên">{authStore.tenNguoiDung}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">{authStore.currentUserProfile.email || 'Chưa thiết lập'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{authStore.currentUserProfile.soDienThoai || 'Chưa thiết lập'}</Descriptions.Item>
              <Descriptions.Item label="Chức danh">{authStore.currentUserProfile.chucVu || 'Chuyên viên kỹ thuật'}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị phòng ban">{authStore.currentUserProfile.tenPhongBan || 'Phòng ban mặc định'}</Descriptions.Item>
              <Descriptions.Item label="Quyền hạn đang phân bổ">
                {authStore.danhSachQuyenHan.map((role) => (
                  <Tag color="purple" key={role} style={{ marginBottom: 4 }}>{role}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type="secondary">Không tải được thông tin từ máy chủ.</Text>
          )}
        </Modal>

        {/* ===== MODAL: ĐỔI MẬT KHẨU (Tiếng Việt) ===== */}
        <Modal
          title="Thay đổi mật khẩu tài khoản"
          open={isPasswordModalOpen}
          onCancel={() => setIsPasswordModalOpen(false)}
          footer={null}
        >
          <Form form={formDoiMatKhau} onFinish={handleDoiMatKhau} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="matKhauCu"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
              name="matKhauMoi"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải dài tối thiểu 6 ký tự!' }
              ]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setIsPasswordModalOpen(false)}>Hủy bỏ</Button>
                <Button type="primary" htmlType="submit">
                  Xác nhận thay đổi
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
});

export default AppLayout;
