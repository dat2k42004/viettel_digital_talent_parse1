import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Button, Dropdown, Avatar, Space,
  Typography, Breadcrumb, theme, Badge, Modal, Form, Input, Descriptions, message, Tag, ConfigProvider, Tooltip
} from 'antd';
import type { MenuProps } from 'antd';
import { observer } from 'mobx-react-lite';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Icon, {
  DashboardOutlined, FileTextOutlined, LaptopOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined,
  ToolOutlined, ScanOutlined, BarChartOutlined, SettingOutlined,
  KeyOutlined, SolutionOutlined, SunOutlined, MoonOutlined,
  BankOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { authStore, QUYEN } from '../stores/AuthStore';
import { doiMatKhau, logout } from '../api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import ItamIcon from '../assets/icon.png';
import { keys } from 'mobx';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = observer(() => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();

  // Trạng thái giao diện tối (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("themeMode");
    return savedTheme === "dark";
  })

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("themeMode", newMode ? "dark" : "light");
  }



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
    authStore.kiemTraQuyen([
      QUYEN.NHOM_HANG_SAN_XUAT,
      QUYEN.NHOM_LOAI_TAI_SAN,
      QUYEN.NHOM_DANH_MUC_TAI_SAN,
      QUYEN.NHOM_MAU_TAI_SAN,
      QUYEN.NHOM_THIET_BI_THUC_THE,
      QUYEN.NHOM_DANH_MUC_THUOC_TINH,
      QUYEN.NHOM_LAP_RAP_LINH_KIEN,
    ])
      ? {
        key: '/tai-san',
        icon: <LaptopOutlined />,
        label: 'Quản lý Tài sản',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_HANG_SAN_XUAT)
            ? {
              key: '/tai-san/hang-san-xuat',
              label: <Link to="/tai-san/hang-san-xuat">Hãng sản xuất</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_LOAI_TAI_SAN)
            ? {
              key: '/tai-san/loai-tai-san',
              label: <Link to="/tai-san/loai-tai-san">Loại tài sản</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_TAI_SAN)
            ? {
              key: '/tai-san/danh-muc-tai-san',
              label: <Link to="/tai-san/danh-muc-tai-san">Danh mục tài sản</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_MAU_TAI_SAN)
            ? {
              key: '/tai-san/mau-tai-san',
              label: 'Mẫu tài sản',
              children: [
                authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_CUNG)
                  ? {
                    key: '/tai-san/mau-ma-tai-san/tai-san-phan-cung',
                    label: <Link to="/tai-san/mau-ma-tai-san/tai-san-phan-cung">Mẫu mã phần cứng</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_MEM)
                  ? {
                    key: '/tai-san/mau-ma-tai-san/tai-san-phan-mem',
                    label: <Link to="/tai-san/mau-ma-tai-san/tai-san-phan-mem">Mẫu mã phần mềm</Link>,
                  }
                  : null,
              ]
            } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_THIET_BI_THUC_THE)
            ? {
              key: '/tai-san/thiet-bi',
              label: "Thiết bị thực",
              children: [
                authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_CUNG)
                  ? {
                    key: '/tai-san/thiet-bi/danh-sach-thiet-bi-phan-cung',
                    label: <Link to="/tai-san/thiet-bi/danh-sach-thiet-bi-phan-cung">Thiết bị phần cứng</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_MEM)
                  ? {
                    key: '/tai-san/thiet-bi/danh-sach-thiet-bi-phan-mem',
                    label: <Link to="/tai-san/thiet-bi/danh-sach-thiet-bi-phan-mem">Thiết bị phần mềm</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_LINH_KIEN_PHAN_CUNG)
                  ? {
                    key: '/tai-san/thiet-bi/linh-kien-phan-cung',
                    label: <Link to="/tai-san/thiet-bi/linh-kien-phan-cung">Linh kiện phần cứng</Link>,
                  }
                  : null,
              ]
            } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_THUOC_TINH)
            ? {
              key: '/tai-san/danh-muc-thuoc-tinh',
              label: <Link to="/tai-san/danh-muc-thuoc-tinh">Danh mục thuộc tính</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_LAP_RAP_LINH_KIEN)
            ? {
              key: '/tai-san/lap-rap-linh-kien',
              label: <Link to="/tai-san/lap-rap-linh-kien">Lắp ráp linh kiện</Link>,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'],
      }
      : null,
    authStore.kiemTraQuyen([
      QUYEN.NHOM_PHIEU_CAP_PHAT,
      QUYEN.NHOM_PHIEU_THU_HOI,
      QUYEN.NHOM_PHIEU_DIEU_CHUYEN,
      QUYEN.NHOM_PHIEU_THANH_LY
    ])
      ? {
        key: '/vong-doi',
        icon: <FileTextOutlined />,
        label: 'Vòng đời tài sản',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_CAP_PHAT) ? {
            key: '/vong-doi/cap-phat',
            label: 'Phiếu cấp phát',
            onClick: () => navigate('/vong-doi/cap-phat'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_THU_HOI) ? {
            key: '/vong-doi/thu-hoi',
            label: 'Phiếu thu hồi',
            onClick: () => navigate('/vong-doi/thu-hoi'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_DIEU_CHUYEN) ? {
            key: '/vong-doi/dieu-chuyen',
            label: 'Phiếu điều chuyển',
            onClick: () => navigate('/vong-doi/dieu-chuyen'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_THANH_LY) ? {
            key: '/vong-doi/thanh-ly',
            label: 'Phiếu thanh lý',
            onClick: () => navigate('/vong-doi/thanh-ly'),
          } : null,
        ]
      }
      : null,
    authStore.kiemTraQuyen([QUYEN.NHOM_KE_HOACH_BAO_TRI, QUYEN.NHOM_PHIEU_SUA_CHUA])
      ? {
        key: '/bao-tri',
        icon: <ToolOutlined />,
        label: 'Bảo hành và bảo trì',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_KE_HOACH_BAO_TRI)
            ? {
              key: '/bao-tri/ke-hoach',
              label: <Link to="/bao-tri/ke-hoach">Kế hoạch bảo trì</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_SUA_CHUA)
            ? {
              key: '/bao-tri/sua-chua',
              label: <Link to="/bao-tri/sua-chua">Phiếu sửa chữa</Link>,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'],
      }
      : null,
    authStore.kiemTraQuyen([QUYEN.NHOM_DOT_KIEM_KE, QUYEN.NHOM_PHIEU_KIEM_KE])
      ? {
        key: '/kiem-ke',
        icon: <ScanOutlined />,
        label: 'Quản lý kiểm kê',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_DOT_KIEM_KE)
            ? {
              key: '/kiem-ke/dot-kiem-ke',
              label: <Link to="/kiem-ke/dot-kiem-ke">Đợt kiểm kê</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_KIEM_KE)
            ? {
              key: '/kiem-ke/phieu-kiem-ke',
              label: <Link to="/kiem-ke/phieu-kiem-ke">Phiếu kiểm kê</Link>,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'],
      }
      : null,
    // Phân hệ quản lý mua sắm
    authStore.kiemTraQuyen([
      QUYEN.NHOM_NHA_CUNG_CAP,
      QUYEN.NHOM_DON_HANG_MUA_SAM,
      QUYEN.NHOM_PHIEU_NHAP_KHO]) ? {
      key: '/mua-sam',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý mua sắm',
      children: [
        authStore.kiemTraQuyen(QUYEN.NHOM_NHA_CUNG_CAP) ? {
          key: '/mua-sam/nha-cung-cap',
          // icon: <ShopOutlined />,
          label: 'Nhà cung cấp',
          onClick: () => navigate('/mua-sam/nha-cung-cap'),
        } : null,
        authStore.kiemTraQuyen(QUYEN.NHOM_DON_HANG_MUA_SAM) ? {
          key: '/mua-sam/don-hang-mua-sam',
          // icon: <FileDoneOutlined />,
          label: 'Đơn hàng mua sắm',
          onClick: () => navigate('/mua-sam/don-hang-mua-sam'),
        } : null,
        authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_NHAP_KHO) ? {
          key: '/mua-sam/phieu-nhap-tai-san',
          // icon: <InboxOutlined />,
          label: 'Phiếu nhập tài sản',
          onClick: () => navigate('/mua-sam/phieu-nhap-tai-san'),
        } : null,
      ].filter(Boolean),
    } : null,
    authStore.kiemTraQuyen([
      QUYEN.NHOM_QUAN_LY_DON_VI,
      QUYEN.NHOM_QUAN_LY_PHONG_BAN,
      QUYEN.NHOM_QUAN_LY_VI_TRI,
      QUYEN.NHOM_DANH_MUC_CAU_HINH,
      QUYEN.NHOM_CAU_HINH_DON_VI
    ])
      ? {
        key: 'quan-ly-don-vi',
        icon: <BankOutlined />,
        label: 'Quản lý Đơn vị',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_DON_VI)
            ? {
              key: '/quan-ly-don-vi/don-vi',
              label: <Link to="/quan-ly-don-vi/don-vi">Danh sách đơn vị</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_PHONG_BAN)
            ? {
              key: '/quan-ly-don-vi/phong-ban',
              label: <Link to="/quan-ly-don-vi/phong-ban">Phòng ban</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_VI_TRI)
            ? {
              key: '/quan-ly-don-vi/vi-tri',
              label: <Link to="/quan-ly-don-vi/vi-tri">Vị trí & Kho bãi</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_CAU_HINH)
            ? {
              key: '/quan-ly-don-vi/danh-muc',
              label: <Link to="/quan-ly-don-vi/danh-muc">Danh mục hệ thống</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_CAU_HINH_DON_VI)
            ? {
              key: '/quan-ly-don-vi/cau-hinh',
              label: <Link to="/quan-ly-don-vi/cau-hinh">Cấu hình đơn vị</Link>,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'],
      }
      : null,
    // Phân hệ Quản lý Người dùng / Hệ thống bảo mật
    authStore.kiemTraQuyen([QUYEN.NHOM_NGUOI_DUNG, QUYEN.NHOM_VAI_TRO, QUYEN.XEM_NHAT_KY_THAO_TAC])
      ? {
        key: '/quan-ly-nguoi-dung',
        icon: <SettingOutlined />,
        label: 'Người dùng',
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_NGUOI_DUNG)
            ? {
              key: '/quan-ly-nguoi-dung/nguoi-dung',
              label: <Link to="/quan-ly-nguoi-dung/nguoi-dung">Quản lý tài khoản</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_VAI_TRO)
            ? {
              key: '/quan-ly-nguoi-dung/vai-tro',
              label: <Link to="/quan-ly-nguoi-dung/vai-tro">Vai trò & Quyền hạn</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XEM_NHAT_KY_THAO_TAC)
            ? {
              key: '/quan-ly-nguoi-dung/nhat-ky-thao-tac',
              label: <Link to="/quan-ly-nguoi-dung/nhat-ky-thao-tac">Nhật ký thao tác</Link>,
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

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const key = '/' + location.pathname.split('/').filter(Boolean)[0];
    return key ? [key] : [];
  });

  useEffect(() => {
    const firstLevel = '/' + location.pathname.split('/').filter(Boolean)[0];
    if (firstLevel) {
      setOpenKeys(prev => {
        if (prev.includes(firstLevel)) return prev;
        return [firstLevel];
      });
    }
  }, [location.pathname]);

  const rootSubmenuKeys = ['/tai-san', '/vong-doi', '/bao-tri', '/kiem-ke', '/mua-sam', '/quan-ly-don-vi', '/quan-ly-nguoi-dung'];

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(key => !openKeys.includes(key));
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  // Chuyển đổi tên đường dẫn sang tiếng Việt có dấu trên Breadcrumb
  const translatePath = (path: string) => {
    const maps: Record<string, string> = {
      'tai-san': 'Quản lý Tài sản',
      'hang-san-xuat': 'Hãng sản xuất',
      'loai-tai-san': 'Loại tài sản',
      'danh-muc-tai-san': 'Danh mục tài sản',
      'mau-ma-tai-san': 'Mẫu mã tài sản',
      'tai-san-phan-cung': 'Mẫu mã phần cứng',
      'tai-san-phan-mem': 'Mẫu mã phần mềm',
      'danh-sach-thiet-bi-phan-cung': 'Thiết bị phần cứng',
      'danh-sach-thiet-bi-phan-mem': 'Thiết bị phần mềm',
      'linh-kien-phan-cung': 'Linh kiện phần cứng',
      'danh-muc-thuoc-tinh': 'Danh mục thuộc tính',
      'lap-rap-linh-kien': 'Lắp ráp linh kiện',
      'nha-cung-cap': 'Nhà cung cấp',
      'don-hang-mua-sam': 'Đơn hàng mua săm',
      'phieu-nhap-tai-san': 'Phiếu nhập tài sản',
      'nguoi-dung': 'Quản lý tài khoản',
      'vai-tro': 'Vai trò & Quyền hạn',
      'quan-ly-don-vi': 'Quản lý đơn vị',
      'don-vi': 'Đơn vị',
      'phong-ban': 'Phòng ban',
      'vi-tri': 'Vị trí & Kho bãi',
      'danh-muc': 'Danh mục hệ thống',
      'cau-hinh': 'Cấu hình đơn vị',
      'vong-doi': 'Vòng đời tài sản',
      'cap-phat': 'Cấp phát tài sản',
      'thu-hoi': 'Thu hồi tài sản',
      'dieu-chuyen': "Điều chuyển tài sản",
      'thanh-ly': 'Thanh lý tài sản',
      'quan-ly-nguoi-dung': 'Quản lý người dùng',
      'mua-sam': 'Quản lý mua sắm',
      'thiet-bi': 'Thiết bị thực',
      'nhat-ky-thao-tac': 'Nhật ký thao tác',
      'bao-tri': "Bảo hành & bảo trì",
      'ke-hoach': 'Kế hoạch bảo trì',
      'sua-chua': 'Phiếu sửa chữa',
      'kiem-ke': 'Kiểm kê tài sản',
      'dot-kiem-ke': "Đợt kiểm kê",
      'phieu-kiem-ke': 'Phiếu kiểm kê',
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
          theme={isDarkMode ? 'dark' : 'light'}
          trigger={null}
          style={{
            borderRight: isDarkMode ? 'none' : '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? 0 : '0 24px',
              borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0',
            }}
          >
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate("/")}>
                <img
                  src={ItamIcon} // Nhớ trỏ đúng biến import ảnh của cậu nhé
                  alt="ITAM Logo"
                  style={{ width: 32, height: 32, objectFit: 'contain', filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
                />
                <Text strong style={{ fontSize: 24, margin: 0 }}>
                  ITAM
                </Text>
              </div>
            )}
            {collapsed && <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate("/")}>
              <img
                src={ItamIcon} // Nhớ trỏ đúng biến import ảnh của cậu nhé
                alt="ITAM Logo"
                style={{ width: 32, height: 32, objectFit: 'contain', filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
              />
            </div>}
          </div>

          <Menu
            theme={isDarkMode ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={[location.pathname, selectedKey]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={menuItems}
            style={{ borderRight: 0, marginTop: 8 }}
          />
        </Sider>

        <Layout>
          {/* ===== HEADER ===== */}
          <Header
            style={{
              background: isDarkMode ? '#141414' : '#fff',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
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
                  onClick={handleToggleTheme}
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
