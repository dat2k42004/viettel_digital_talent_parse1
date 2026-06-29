import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authStore } from '../stores/AuthStore';
import { message } from 'antd';

// Instance gốc kết nối Backend Spring Boot
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  const tenantId = localStorage.getItem('tenantId');

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Chỉ gửi X-Tenant-ID nếu người dùng thuộc một Đơn vị cụ thể
  // Nếu là Super Admin (tenantId rỗng hoặc null/"null"), không gửi header này đi
  if (tenantId && tenantId !== 'null' && tenantId !== 'undefined' && tenantId.trim() !== '') {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor tự động xử lý đăng xuất khi gặp lỗi 401/403
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Trích xuất câu thông báo lỗi nghiệp vụ chi tiết từ backend (ApiResponse)
    if (error.response?.data && typeof error.response.data === 'object') {
      const apiResponse = error.response.data as any;
      if (apiResponse.message) {
        error.message = apiResponse.message;
      }
    }

    if (status === 401) {
      if (!requestUrl.includes('/api/auth/login')) {
        authStore.dangXuat();
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Bạn không có quyền thực hiện tác vụ này!');
    }

    return Promise.reject(error);
  }
);

// Hàm bọc (mutator) mà Orval yêu cầu — chỉ trả .data, không wrap thêm
export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> =>
  axiosInstance(config).then((res: AxiosResponse<T>) => res.data);
