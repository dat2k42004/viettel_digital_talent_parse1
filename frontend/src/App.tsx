import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { observer } from 'mobx-react-lite';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AssetListPage from './pages/asset/AssetListPage';
import LifecyclePage from './pages/lifecycle/LifecyclePage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import InventoryPage from './pages/inventory/InventoryPage';
import ReportPage from './pages/report/ReportPage';
import UserManagementPage from './pages/auth/users/UserManagementPage';
import RoleManagementPage from './pages/auth/roles/RoleManagementPage';
import { getMyProfile } from './api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import { authStore } from './stores/AuthStore';
import DangKyDonViPage from './pages/tenant/donvi/DangKyDonViPage';
import DonViManagementPage from './pages/tenant/donvi/DonViManagementPage';
import DangKyPage from './pages/tenant/donvi/DangKyPage';
import XacThucOtpPage from './pages/tenant/donvi/XacThucOtpPage';
import PhongBanManagementPage from './pages/tenant/phongban/PhongBanManagementPage';
import ViTriManagementPage from './pages/tenant/vitri/ViTriManagementPage';
import DanhMucCauHinhPage from './pages/tenant/danhmuc/DanhMucCauHinhPage';
import CauHinhDonViPage from './pages/tenant/cauhinhdonvi/CauHinhDonViPage';
import './App.css';

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
        path: 'assets',
        element: <AssetListPage />,
      },
      {
        path: 'lifecycle',
        element: <LifecyclePage />,
      },
      {
        path: 'maintenance',
        element: <MaintenancePage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'reports',
        element: <ReportPage />,
      },
      {
        path: 'nguoi-dung/nguoi-dung',
        element: <UserManagementPage />,
      },
      {
        path: 'nguoi-dung/vai-tro',
        element: <RoleManagementPage />,
      },
      {
        path: 'don-vi/don-vi',
        element: <DonViManagementPage />,
      },
      {
        path: 'don-vi/phong-ban',
        element: <PhongBanManagementPage />,
      },
      {
        path: 'don-vi/vi-tri',
        element: <ViTriManagementPage />,
      },
      {
        path: 'don-vi/danh-muc',
        element: <DanhMucCauHinhPage />,
      },
      {
        path: 'don-vi/cau-hinh',
        element: <CauHinhDonViPage />,
      },
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
