import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { observer } from 'mobx-react-lite';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HangSanXuatPage from './pages/asset/hangsanxuat/HangSanXuatPage';
import LoaiTaiSanPage from './pages/asset/loaitaisan/LoaiTaiSanPage';
import DanhMucTaiSanPage from './pages/asset/danhmuctaisan/DanhMucTaiSanPage';
import TaiSanPhanCungPage from './pages/asset/maumataisan/taisanphancung/TaiSanPhanCungPage';
import TaiSanPhanMemPage from './pages/asset/maumataisan/taisanphanmem/TaiSanPhanMemPage';
import DanhSachThietBiPhanCungPage from './pages/asset/taisan/danhsachthietbiphancung/DanhSachThietBiPhanCungPage';
import DanhSachThietBiPhanMemPage from './pages/asset/taisan/danhsachthietbiphanmem/DanhSachThietBiPhanMemPage';
import LinhKienPhanCungPage from './pages/asset/taisan/linhkienphancung/LinhKienPhanCungPage';
import DanhMucThuocTinhPage from './pages/asset/danhmucthuoctinh/DanhMucThuocTinhPage';
import LapRapLinhKienPage from './pages/asset/lapraplinhkien/LapRapLinhKienPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import InventoryPage from './pages/inventory/InventoryPage';
import ReportPage from './pages/report/ReportPage';
import UserManagementPage from './pages/auth/users/UserManagementPage';
import RoleManagementPage from './pages/auth/roles/RoleManagementPage';
import { getMyProfile } from './api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import { authStore, QUYEN } from './stores/AuthStore';
import DangKyDonViPage from './pages/tenant/donvi/DangKyDonViPage';
import DonViManagementPage from './pages/tenant/donvi/DonViManagementPage';
import DangKyPage from './pages/tenant/donvi/DangKyPage';
import XacThucOtpPage from './pages/tenant/donvi/XacThucOtpPage';
import PhongBanManagementPage from './pages/tenant/phongban/PhongBanManagementPage';
import ViTriManagementPage from './pages/tenant/vitri/ViTriManagementPage';
import DanhMucCauHinhPage from './pages/tenant/danhmuc/DanhMucCauHinhPage';
import CauHinhDonViPage from './pages/tenant/cauhinhdonvi/CauHinhDonViPage';
import NhaCungCapPage from './pages/procurement/nhacungcap/NhaCungCapPage';
import DonHangMuaSamPage from './pages/procurement/donhangmuasam/DonHangMuaSamPage';
import PhieuNhapTaiSanPage from './pages/procurement/phieunhaptaisan/PhieuNhapTaiSanPage';
import './App.css';
import PhieuCapPhatPage from './pages/lifecycle/capphat/PhieuCapPhatPage';
import PhieuThuHoiPage from './pages/lifecycle/thuhoi/PhieuThuHoiPage';
import PhieuDieuChuyenPage from './pages/lifecycle/dieuchuyen/PhieuDieuChuyenPage';
import PhieuThanhLyPage from './pages/lifecycle/thanhly/PhieuThanhLyPage';

const AccessDenied = () => (
  <Result
    status="403"
    title="403"
    subTitle="Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ."
    extra={
      <Button type="primary" onClick={() => window.location.href = '/'}>
        Quay lại trang chủ
      </Button>
    }
  />
);

const PermittedRoute = observer(({ element, quyen }: { element: React.ReactNode; quyen: string | string[] }) => {
  if (!authStore.kiemTraQuyen(quyen)) {
    return <AccessDenied />;
  }
  return <>{element}</>;
});

const ProtectedRoute = observer(({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (!authStore.isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
});

const GuestRoute = observer(({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (authStore.isAuthenticated || token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
});

const router = createBrowserRouter([
  // Tuyến đường tự do bên ngoài
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dang-ky-don-vi',
    element: (
      <GuestRoute>
        <DangKyDonViPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dang-ky',
    element: (
      <GuestRoute>
        <DangKyPage />
      </GuestRoute>
    ),
  },
  {
    path: '/xac-thuc-otp',
    element: (
      <GuestRoute>
        <XacThucOtpPage />
      </GuestRoute>
    ),
  },
  // Tuyến đường nội bộ bọc qua bộ bảo vệ ProtectedRoute và AppLayout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'tai-san/hang-san-xuat',
        element: <PermittedRoute element={<HangSanXuatPage />} quyen={QUYEN.NHOM_HANG_SAN_XUAT} />,
      },
      {
        path: 'tai-san/loai-tai-san',
        element: <PermittedRoute element={<LoaiTaiSanPage />} quyen={QUYEN.NHOM_LOAI_TAI_SAN} />,
      },
      {
        path: 'tai-san/danh-muc-tai-san',
        element: <PermittedRoute element={<DanhMucTaiSanPage />} quyen={QUYEN.NHOM_DANH_MUC_TAI_SAN} />,
      },
      {
        path: 'tai-san/mau-ma-tai-san/tai-san-phan-cung',
        element: <PermittedRoute element={<TaiSanPhanCungPage />} quyen={QUYEN.XEM_TAI_SAN_PHAN_CUNG} />,
      },
      {
        path: 'tai-san/mau-ma-tai-san/tai-san-phan-mem',
        element: <PermittedRoute element={<TaiSanPhanMemPage />} quyen={QUYEN.XEM_TAI_SAN_PHAN_MEM} />,
      },
      {
        path: 'tai-san/thiet-bi/danh-sach-thiet-bi-phan-cung',
        element: <PermittedRoute element={<DanhSachThietBiPhanCungPage />} quyen={QUYEN.XEM_THIET_BI_PHAN_CUNG} />,
      },
      {
        path: 'tai-san/thiet-bi/danh-sach-thiet-bi-phan-mem',
        element: <PermittedRoute element={<DanhSachThietBiPhanMemPage />} quyen={QUYEN.XEM_THIET_BI_PHAN_MEM} />,
      },
      {
        path: 'tai-san/thiet-bi/linh-kien-phan-cung',
        element: <PermittedRoute element={<LinhKienPhanCungPage />} quyen={QUYEN.XEM_LINH_KIEN_PHAN_CUNG} />,
      },
      {
        path: 'tai-san/danh-muc-thuoc-tinh',
        element: <PermittedRoute element={<DanhMucThuocTinhPage />} quyen={QUYEN.NHOM_DANH_MUC_THUOC_TINH} />,
      },
      {
        path: 'tai-san/lap-rap-linh-kien',
        element: <PermittedRoute element={<LapRapLinhKienPage />} quyen={QUYEN.NHOM_LAP_RAP_LINH_KIEN} />,
      },
      {
        path: 'maintenance',
        element: <PermittedRoute element={<MaintenancePage />} quyen={QUYEN.THAO_TAC_TAI_SAN} />,
      },
      {
        path: 'inventory',
        element: <PermittedRoute element={<InventoryPage />} quyen={QUYEN.THAO_TAC_TAI_SAN} />,
      },
      {
        path: 'reports',
        element: <PermittedRoute element={<ReportPage />} quyen={QUYEN.XEM_BAO_CAO} />,
      },
      {
        path: 'quan-ly-nguoi-dung/nguoi-dung',
        element: <PermittedRoute element={<UserManagementPage />} quyen={QUYEN.NHOM_NGUOI_DUNG} />,
      },
      {
        path: 'quan-ly-nguoi-dung/vai-tro',
        element: <PermittedRoute element={<RoleManagementPage />} quyen={QUYEN.NHOM_VAI_TRO} />,
      },
      {
        path: 'quan-ly-don-vi/don-vi',
        element: <PermittedRoute element={<DonViManagementPage />} quyen={QUYEN.NHOM_QUAN_LY_DON_VI} />,
      },
      {
        path: 'quan-ly-don-vi/phong-ban',
        element: <PermittedRoute element={<PhongBanManagementPage />} quyen={QUYEN.NHOM_QUAN_LY_PHONG_BAN} />,
      },
      {
        path: 'quan-ly-don-vi/vi-tri',
        element: <PermittedRoute element={<ViTriManagementPage />} quyen={QUYEN.NHOM_QUAN_LY_VI_TRI} />,
      },
      {
        path: 'quan-ly-don-vi/danh-muc',
        element: <PermittedRoute element={<DanhMucCauHinhPage />} quyen={QUYEN.NHOM_DANH_MUC_CAU_HINH} />,
      },
      {
        path: 'quan-ly-don-vi/cau-hinh',
        element: <PermittedRoute element={<CauHinhDonViPage />} quyen={QUYEN.NHOM_CAU_HINH_DON_VI} />,
      },
      {
        path: 'mua-sam/nha-cung-cap',
        element: <PermittedRoute element={<NhaCungCapPage />} quyen={QUYEN.NHOM_NHA_CUNG_CAP} />,
      },
      {
        path: 'mua-sam/don-hang-mua-sam',
        element: <PermittedRoute element={<DonHangMuaSamPage />} quyen={QUYEN.NHOM_DON_HANG_MUA_SAM} />,
      },
      {
        path: 'mua-sam/phieu-nhap-tai-san',
        element: <PermittedRoute element={<PhieuNhapTaiSanPage />} quyen={QUYEN.NHOM_PHIEU_NHAP_KHO} />,
      },
      {
        path: 'vong-doi/cap-phat',
        element: <PermittedRoute element={<PhieuCapPhatPage />} quyen={QUYEN.NHOM_PHIEU_CAP_PHAT} />
      },
      {
        path: 'vong-doi/thu-hoi',
        element: <PermittedRoute element={<PhieuThuHoiPage />} quyen={QUYEN.NHOM_PHIEU_THU_HOI} />
      },
      {
        path: 'vong-doi/dieu-chuyen',
        element: <PermittedRoute element={<PhieuDieuChuyenPage />} quyen={QUYEN.NHOM_PHIEU_DIEU_CHUYEN} />
      },
      {
        path: 'vong-doi/thanh-ly',
        element: <PermittedRoute element={<PhieuThanhLyPage />} quyen={QUYEN.NHOM_PHIEU_THANH_LY} />
      }
    ],
  },
]);

export const App = observer(() => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      authStore.dangXuat();
      setLoading(false);
      return;
    }

    // Tự động gọi API /api/auth/me để khôi phục phiên làm việc khi F5 trình duyệt
    getMyProfile()
      .then((res) => {
        if (res.data) {
          authStore.napHoSoCaNhan(res.data);
        }
      })
      .catch((err) => {
        console.error('Không thể cập nhật hồ sơ cá nhân khi F5:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f3f4f6',
        }}
      >
        <Spin size="large" tip="Đang đồng bộ cấu hình phân quyền hệ thống..." />
      </div>
    );
  }

  return <RouterProvider router={router} />;
});

export default App;
