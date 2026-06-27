import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Instance gốc kết nối Backend Spring Boot
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
});

// Interceptor ngầm: tự gắn Bearer Token + X-Tenant-ID vào mọi request
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  // Đúng tên header theo BaoMatConfig.java: X-Tenant-ID
  const tenantId = localStorage.getItem('tenantId') ?? '1';

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  config.headers['X-Tenant-ID'] = tenantId;

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Hàm bọc (mutator) mà Orval yêu cầu — chỉ trả .data, không wrap thêm
export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> =>
  axiosInstance(config).then((res: AxiosResponse<T>) => res.data);
