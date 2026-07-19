import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authStore } from '../stores/AuthStore';
import { message } from 'antd';
import i18n from '../config/i18n';

// Instance gốc kết nối Backend Spring Boot
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // Lấy tenantId từ localStorage
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  // Kiểm tra nếu là Super Admin thì gửi X-Is-Global
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      const isSuperAdmin = profile.danhSachQuyenPhanGiai?.includes('XEM_QUAN_TRI_TOAN_SAN');
      if (isSuperAdmin) {
        config.headers['X-Is-Global'] = 'true';
      }
    } catch (e) {
      console.error('Failed to parse userProfile in axios interceptor', e);
    }
  }

  // Tự động làm phẳng tham số 'request' lồng nhau cho Spring Boot binding
  if (config.params && typeof config.params === 'object') {
    if (config.params.request && typeof config.params.request === 'object') {
      const requestParams = config.params.request;
      delete config.params.request;
      config.params = { ...config.params, ...requestParams };
    }
  }
  // Gửi locale hiện tại lên backend qua header Accept-Language
  const currentLang = localStorage.getItem('language') || 'vi';
  config.headers = config.headers || {};
  config.headers['Accept-Language'] = currentLang;

  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const requestUrl = error.config ? error.config.url || '' : '';

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
        message.error(i18n.t('common.session_expired'));
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error(i18n.t('common.no_permission'));
    }

    return Promise.reject(error);
  }
);

// Hàm bọc (mutator) mà Orval yêu cầu — chỉ trả .data, không wrap thêm
export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance(config).then((response) => response.data);
};
