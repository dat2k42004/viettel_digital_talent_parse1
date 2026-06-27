import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import TenantPage from './pages/tenant/TenantPage';
import UserManagementPage from './pages/auth/users/UserManagementPage';
import RoleManagementPage from './pages/auth/roles/RoleManagementPage';
import { getMyProfile } from './api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import { authStore } from './stores/AuthStore';
import './App.css';

const ProtectedRoute = observer(({ children }: { children: React.ReactNode }) => {
  // Cho phép đi qua trực tiếp để trải nghiệm hệ thống không cần tài khoản đăng nhập
  return <>{children}</>;
});

const router = createBrowserRouter([
  // Tuyến đường tự do bên ngoài
  {
    path: '/login',
    element: <LoginPage />,
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
        path: 'tenants',
        element: <TenantPage />,
      },
      {
        path: 'nguoi-dung',
        element: <UserManagementPage />,
      },
      {
        path: 'vai-tro',
        element: <RoleManagementPage />,
      },
    ],
  },
]);

export const App = observer(() => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    // Tự động gọi API /api/auth/me nếu có token, nếu không thì giữ nguyên chế độ mock admin sandbox
    getMyProfile()
      .then((res) => {
        if (res.data) {
          authStore.napHoSoCaNhan(res.data);
        }
      })
      .catch(() => {
        // Bỏ qua lỗi kết nối API để tránh bị log out ngoài ý muốn
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
