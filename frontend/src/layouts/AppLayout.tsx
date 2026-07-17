import { useTranslation } from 'react-i18next';
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
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = observer(() => {
  const { t } = useTranslation();
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
    message.success(t('appLayout.logoutSuccess'));
    navigate('/login');
  };

  // Đổi mật khẩu liên kết API thực tế
  const handleDoiMatKhau = async (values: { matKhauCu: string; matKhauMoi: string }) => {
    try {
      const res = await doiMatKhau({
        matKhauCu: values.matKhauCu,
        matKhauMoi: values.matKhauMoi,
      });
      message.success(res.message || t('appLayout.changePasswordSuccess'));
      setIsPasswordModalOpen(false);
      formDoiMatKhau.resetFields();
    } catch (error: any) {
      const msg = error?.message || t('appLayout.changePasswordFailed');
      message.error(msg);
    }
  };

  // Tạo danh sách menu với tiếng Việt có dấu và lọc dựa trên phân quyền từ AuthStore
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">{t('menu.dashboard')}</Link>,
    },
    authStore.kiemTraQuyen([QUYEN.XEM_BAO_CAO, QUYEN.XEM_QUAN_TRI_TOAN_SAN])
      ? {
        key: '/bao-cao',
        icon: <BarChartOutlined />,
        label: <Link to="/bao-cao">{t('menu.reports')}</Link>,
      }
      : null,
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
        label: t('appLayout.quan_ly_tai_san'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_HANG_SAN_XUAT)
            ? {
              key: '/tai-san/hang-san-xuat',
              label: <Link to="/tai-san/hang-san-xuat">{t('taiSanPhanMemPage.hang_san_xuat')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_LOAI_TAI_SAN)
            ? {
              key: '/tai-san/loai-tai-san',
              label: <Link to="/tai-san/loai-tai-san">{t('baoCaoPage.loai_tai_san')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_TAI_SAN)
            ? {
              key: '/tai-san/danh-muc-tai-san',
              label: <Link to="/tai-san/danh-muc-tai-san">{t('taiSanPhanMemFormModal.danh_muc_tai_san')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_MAU_TAI_SAN)
            ? {
              key: '/tai-san/mau-tai-san',
              label: t('appLayout.mau_tai_san'),
              children: [
                authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_CUNG)
                  ? {
                    key: '/tai-san/mau-ma-tai-san/tai-san-phan-cung',
                    label: <Link to="/tai-san/mau-ma-tai-san/tai-san-phan-cung">{t('menu.hardwareModels')}</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_TAI_SAN_PHAN_MEM)
                  ? {
                    key: '/tai-san/mau-ma-tai-san/tai-san-phan-mem',
                    label: <Link to="/tai-san/mau-ma-tai-san/tai-san-phan-mem">{t('menu.softwareModels')}</Link>,
                  }
                  : null,
              ]
            } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_THIET_BI_THUC_THE)
            ? {
              key: '/tai-san/thiet-bi',
              label: t('menu.actualAssets'),
              children: [
                authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_CUNG)
                  ? {
                    key: '/tai-san/thiet-bi/danh-sach-thiet-bi-phan-cung',
                    label: <Link to="/tai-san/thiet-bi/danh-sach-thiet-bi-phan-cung">{t('phieuSuaChuaFormModal.thiet_bi_phan_cung')}</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_THIET_BI_PHAN_MEM)
                  ? {
                    key: '/tai-san/thiet-bi/danh-sach-thiet-bi-phan-mem',
                    label: <Link to="/tai-san/thiet-bi/danh-sach-thiet-bi-phan-mem">{t('menu.softwareLicenses')}</Link>,
                  }
                  : null,
                authStore.kiemTraQuyen(QUYEN.XEM_LINH_KIEN_PHAN_CUNG)
                  ? {
                    key: '/tai-san/thiet-bi/linh-kien-phan-cung',
                    label: <Link to="/tai-san/thiet-bi/linh-kien-phan-cung">{t('phieuCapPhatFormModal.linh_kien_phan_cung')}</Link>,
                  }
                  : null,
              ]
            } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_THUOC_TINH)
            ? {
              key: '/tai-san/danh-muc-thuoc-tinh',
              label: <Link to="/tai-san/danh-muc-thuoc-tinh">{t('menu.attributes')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_LAP_RAP_LINH_KIEN)
            ? {
              key: '/tai-san/lap-rap-linh-kien',
              label: <Link to="/tai-san/lap-rap-linh-kien">{t('menu.assembly')}</Link>,
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
        label: t('menu.lifecycle'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_CAP_PHAT) ? {
            key: '/vong-doi/cap-phat',
            label: t('appLayout.phieu_cap_phat'),
            onClick: () => navigate('/vong-doi/cap-phat'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_THU_HOI) ? {
            key: '/vong-doi/thu-hoi',
            label: t('appLayout.phieu_thu_hoi'),
            onClick: () => navigate('/vong-doi/thu-hoi'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_DIEU_CHUYEN) ? {
            key: '/vong-doi/dieu-chuyen',
            label: t('appLayout.phieu_dieu_chuyen'),
            onClick: () => navigate('/vong-doi/dieu-chuyen'),
          } : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_THANH_LY) ? {
            key: '/vong-doi/thanh-ly',
            label: t('appLayout.phieu_thanh_ly'),
            onClick: () => navigate('/vong-doi/thanh-ly'),
          } : null,
        ]
      }
      : null,
    authStore.kiemTraQuyen([QUYEN.NHOM_KE_HOACH_BAO_TRI, QUYEN.NHOM_PHIEU_SUA_CHUA])
      ? {
        key: '/bao-tri',
        icon: <ToolOutlined />,
        label: t('appLayout.bao_hanh_va_bao_tri'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_KE_HOACH_BAO_TRI)
            ? {
              key: '/bao-tri/ke-hoach',
              label: <Link to="/bao-tri/ke-hoach">{t('menu.maintenancePlans')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_SUA_CHUA)
            ? {
              key: '/bao-tri/sua-chua',
              label: <Link to="/bao-tri/sua-chua">{t('menu.repairTickets')}</Link>,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'],
      }
      : null,
    authStore.kiemTraQuyen([QUYEN.NHOM_DOT_KIEM_KE, QUYEN.NHOM_PHIEU_KIEM_KE])
      ? {
        key: '/kiem-ke',
        icon: <ScanOutlined />,
        label: t('appLayout.quan_ly_kiem_ke'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_DOT_KIEM_KE)
            ? {
              key: '/kiem-ke/dot-kiem-ke',
              label: <Link to="/kiem-ke/dot-kiem-ke">{t('menu.inventoryRounds')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_KIEM_KE)
            ? {
              key: '/kiem-ke/phieu-kiem-ke',
              label: <Link to="/kiem-ke/phieu-kiem-ke">{t('menu.inventoryTickets')}</Link>,
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
      label: t('menu.procurement'),
      children: [
        authStore.kiemTraQuyen(QUYEN.NHOM_NHA_CUNG_CAP) ? {
          key: '/mua-sam/nha-cung-cap',
          // icon: <ShopOutlined />,
          label: t('donHangMuaSamPage.nha_cung_cap'),
          onClick: () => navigate('/mua-sam/nha-cung-cap'),
        } : null,
        authStore.kiemTraQuyen(QUYEN.NHOM_DON_HANG_MUA_SAM) ? {
          key: '/mua-sam/don-hang-mua-sam',
          // icon: <FileDoneOutlined />,
          label: t('menu.purchaseOrders'),
          onClick: () => navigate('/mua-sam/don-hang-mua-sam'),
        } : null,
        authStore.kiemTraQuyen(QUYEN.NHOM_PHIEU_NHAP_KHO) ? {
          key: '/mua-sam/phieu-nhap-tai-san',
          // icon: <InboxOutlined />,
          label: t('appLayout.phieu_nhap_tai_san'),
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
        label: t('appLayout.quan_ly_don_vi'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_DON_VI)
            ? {
              key: '/quan-ly-don-vi/don-vi',
              label: <Link to="/quan-ly-don-vi/don-vi">{t('appLayout.danh_sach_don_vi')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_PHONG_BAN)
            ? {
              key: '/quan-ly-don-vi/phong-ban',
              label: <Link to="/quan-ly-don-vi/phong-ban">{t('phieuKiemKePage.phong_ban')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_QUAN_LY_VI_TRI)
            ? {
              key: '/quan-ly-don-vi/vi-tri',
              label: <Link to="/quan-ly-don-vi/vi-tri">{t('menu.locations')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_DANH_MUC_CAU_HINH)
            ? {
              key: '/quan-ly-don-vi/danh-muc',
              label: <Link to="/quan-ly-don-vi/danh-muc">{t('menu.systemConfigs')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_CAU_HINH_DON_VI)
            ? {
              key: '/quan-ly-don-vi/cau-hinh',
              label: <Link to="/quan-ly-don-vi/cau-hinh">{t('menu.unitConfigs')}</Link>,
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
        label: t('appLayout.nguoi_dung'),
        children: [
          authStore.kiemTraQuyen(QUYEN.NHOM_NGUOI_DUNG)
            ? {
              key: '/quan-ly-nguoi-dung/nguoi-dung',
              label: <Link to="/quan-ly-nguoi-dung/nguoi-dung">{t('menu.accounts')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.NHOM_VAI_TRO)
            ? {
              key: '/quan-ly-nguoi-dung/vai-tro',
              label: <Link to="/quan-ly-nguoi-dung/vai-tro">{t('menu.roles')}</Link>,
            }
            : null,
          authStore.kiemTraQuyen(QUYEN.XEM_NHAT_KY_THAO_TAC)
            ? {
              key: '/quan-ly-nguoi-dung/nhat-ky-thao-tac',
              label: <Link to="/quan-ly-nguoi-dung/nhat-ky-thao-tac">{t('menu.auditLogs')}</Link>,
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
      label: t('appLayout.profile'),
      onClick: () => setIsProfileModalOpen(true),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: t('appLayout.changePassword'),
      onClick: () => setIsPasswordModalOpen(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('appLayout.logout'),
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
      'tai-san': t('appLayout.quan_ly_tai_san'),
      'hang-san-xuat': t('taiSanPhanMemPage.hang_san_xuat'),
      'loai-tai-san': t('baoCaoPage.loai_tai_san'),
      'danh-muc-tai-san': t('taiSanPhanMemFormModal.danh_muc_tai_san'),
      'mau-ma-tai-san': t('menu.assetModels'),
      'tai-san-phan-cung': t('menu.hardwareModels'),
      'tai-san-phan-mem': t('menu.softwareModels'),
      'danh-sach-thiet-bi-phan-cung': t('phieuSuaChuaFormModal.thiet_bi_phan_cung'),
      'danh-sach-thiet-bi-phan-mem': t('menu.softwareLicenses'),
      'linh-kien-phan-cung': t('phieuCapPhatFormModal.linh_kien_phan_cung'),
      'danh-muc-thuoc-tinh': t('menu.attributes'),
      'lap-rap-linh-kien': t('menu.assembly'),
      'nha-cung-cap': t('donHangMuaSamPage.nha_cung_cap'),
      'don-hang-mua-sam': t('appLayout.don_hang_mua_sam'),
      'phieu-nhap-tai-san': t('appLayout.phieu_nhap_tai_san'),
      'nguoi-dung': t('menu.accounts'),
      'vai-tro': t('menu.roles'),
      'quan-ly-don-vi': t('menu.unitManagement'),
      'don-vi': t('menu.units'),
      'phong-ban': t('phieuKiemKePage.phong_ban'),
      'vi-tri': t('menu.locations'),
      'danh-muc': t('menu.systemConfigs'),
      'cau-hinh': t('menu.unitConfigs'),
      'vong-doi': t('menu.lifecycle'),
      'cap-phat': t('menu.allocation'),
      'thu-hoi': t('menu.revocation'),
      'dieu-chuyen': t('menu.transfer'),
      'thanh-ly': t('menu.liquidation'),
      'quan-ly-nguoi-dung': t('menu.userManagement'),
      'mua-sam': t('menu.procurement'),
      'thiet-bi': t('menu.actualAssets'),
      'nhat-ky-thao-tac': t('menu.auditLogs'),
      'bao-tri': t('menu.warrantyMaintenance'),
      'ke-hoach': t('menu.maintenancePlans'),
      'sua-chua': t('menu.repairTickets'),
      'kiem-ke': t('menu.inventory'),
      'dot-kiem-ke': t('menu.inventoryRounds'),
      'phieu-kiem-ke': t('menu.inventoryTickets'),
      'bao-cao': t('menu.reports'),
    };
    return maps[path] || path;
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <Link to="/">{t('common.home')}</Link> },
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
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
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

        <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
          {/* ===== HEADER ===== */}
          <Header
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              left: collapsed ? 80 : 240,
              zIndex: 99,
              width: `calc(100% - ${collapsed ? 80 : 240}px)`,
              transition: 'left 0.2s, width 0.2s',
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
              <Tooltip title={isDarkMode ? t('common.switch_light') : t('common.switch_dark')}>
                <Button
                  type="text"
                  icon={isDarkMode ? <SunOutlined style={{ color: '#fadb14', fontSize: 16 }} /> : <MoonOutlined style={{ fontSize: 16 }} />}
                  onClick={handleToggleTheme}
                />
              </Tooltip>

              <LanguageSwitcher />

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
              margin: '88px 24px 24px 24px',
              minHeight: 'calc(100vh - 64px - 48px)',
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>

        {/* ===== MODAL: HỒ SƠ CÁ NHÂN (Tiếng Việt) ===== */}
        <Modal
          title={t('appLayout.profileTitle')}
          open={isProfileModalOpen}
          onCancel={() => setIsProfileModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsProfileModalOpen(false)}>
              {t('common.close')}
            </Button>
          ]}
        >
          {authStore.currentUserProfile ? (
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label={t('appLayout.fullName')}>{authStore.tenNguoiDung}</Descriptions.Item>
              <Descriptions.Item label={t('appLayout.email')}>
                {authStore.currentUserProfile.email || t('appLayout.noInfo')}
              </Descriptions.Item>
              <Descriptions.Item label={t('appLayout.phone')}>
                {authStore.currentUserProfile.soDienThoai || t('appLayout.noInfo')}
              </Descriptions.Item>
              <Descriptions.Item label={t('appLayout.title')}>
                {authStore.currentUserProfile.chucVu || t('appLayout.defaultTitle')}
              </Descriptions.Item>
              <Descriptions.Item label={t('appLayout.department')}>
                {authStore.currentUserProfile.tenPhongBan || t('appLayout.defaultDept')}
              </Descriptions.Item>
              <Descriptions.Item label={t('appLayout.roles')}>
                {authStore.danhSachQuyenHan.map((role) => (
                  <Tag color="purple" key={role} style={{ marginBottom: 4 }}>{role}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type="secondary">{t('appLayout.loadFailed')}</Text>
          )}
        </Modal>

        {/* ===== MODAL: ĐỔI MẬT KHẨU (Tiếng Việt) ===== */}
        <Modal
          title={t('appLayout.changePasswordTitle')}
          open={isPasswordModalOpen}
          onCancel={() => setIsPasswordModalOpen(false)}
          footer={null}
        >
          <Form form={formDoiMatKhau} onFinish={handleDoiMatKhau} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="matKhauCu"
              label={t('appLayout.currentPassword')}
              rules={[{ required: true, message: t('appLayout.currentPasswordRequired') }]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder={t('appLayout.currentPasswordPlaceholder')} />
            </Form.Item>
            <Form.Item
              name="matKhauMoi"
              label={t('appLayout.newPassword')}
              rules={[
                { required: true, message: t('appLayout.newPasswordRequired') },
                { min: 6, message: t('appLayout.newPasswordMinLength') }
              ]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder={t('appLayout.newPasswordPlaceholder')} />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setIsPasswordModalOpen(false)}>{t('appLayout.cancel')}</Button>
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
