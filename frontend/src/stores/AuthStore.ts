import { makeAutoObservable } from 'mobx';
import type { NguoiDungResponse } from '../api-generated/models/nguoiDungResponse';

// Mapping nhóm quyền FE -> các @PreAuthorize string thực tế trên Backend
export const QUYEN = {
  XEM_BAO_CAO: 'XEM_BAO_CAO',
  THAO_TAC_TAI_SAN: 'THAO_TAC_TAI_SAN',
  XEM_QUAN_TRI_TOAN_SAN: 'XEM_QUAN_TRI_TOAN_SAN',
  XEM_NGUOI_DUNG: 'XEM_NGUOI_DUNG',
  XEM_VAI_TRO: 'XEM_VAI_TRO',
  XEM_QUYEN: 'XEM_QUYEN',
} as const;

export type QuyenHanKey = (typeof QUYEN)[keyof typeof QUYEN] | string;



class AuthStore {
  isAuthenticated: boolean = false;
  tenNguoiDung: string = '';
  maDonVi: string = '1';
  danhSachQuyenHan: string[] = [];
  currentUserProfile: NguoiDungResponse | null = null;

  constructor() {
    makeAutoObservable(this);
    const savedTenant = localStorage.getItem('tenantId');
    if (savedTenant) {
      this.maDonVi = savedTenant;
    }
    
    // Restore profile and permissions from localStorage on refresh
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        this.currentUserProfile = profile;
        this.isAuthenticated = true;
        const parts = [profile.hoNguoiDung, profile.tenDemNguoiDung, profile.tenNguoiDung];
        this.tenNguoiDung = parts.filter(Boolean).join(' ') || profile.tenDangNhap || '';
        this.maDonVi = String(profile.idDonVi ?? '1');
        this.danhSachQuyenHan = profile.danhSachQuyenPhanGiai ?? [];
      } catch (e) {
        console.error('Failed to parse cached profile', e);
      }
    }
  }

  get laSuperAdmin(): boolean {
    return this.danhSachQuyenHan.includes('XEM_QUAN_TRI_TOAN_SAN');
  }

  get laAdminDonVi(): boolean {
    return this.danhSachQuyenHan.includes('XEM_NGUOI_DUNG') && !this.danhSachQuyenHan.includes('XEM_QUAN_TRI_TOAN_SAN');
  }

  get laNhanVien(): boolean {
    return !this.laSuperAdmin && !this.laAdminDonVi;
  }

  // Kiểm tra 1 hoặc nhiều quyền (OR logic — có ít nhất 1 quyền khớp là hợp lệ)
  kiemTraQuyen(quyenYeuCau: string | string[]): boolean {
    const ds = Array.isArray(quyenYeuCau) ? quyenYeuCau : [quyenYeuCau];
    return ds.some((q) => this.danhSachQuyenHan.includes(q));
  }

  // Cập nhật mảng quyền hạn trực tiếp từ danh sách quyền của Vai trò lấy từ BE
  doiVaiTroTrucTiep(quyenHanMoi: string[]) {
    this.danhSachQuyenHan = quyenHanMoi;
    if (this.currentUserProfile) {
      this.currentUserProfile.danhSachQuyenPhanGiai = quyenHanMoi;
    }
  }

  capNhatMaDonVi(maDonVi: string) {
    this.maDonVi = maDonVi;
    localStorage.setItem('tenantId', maDonVi);
  }

  // Nạp toàn bộ hồ sơ cá nhân nhận về từ API /api/auth/me
  napHoSoCaNhan(profile: NguoiDungResponse) {
    this.currentUserProfile = profile;
    this.isAuthenticated = true;
    
    // Nối họ tên đệm và tên người dùng
    const parts = [profile.hoNguoiDung, profile.tenDemNguoiDung, profile.tenNguoiDung];
    this.tenNguoiDung = parts.filter(Boolean).join(' ') || profile.tenDangNhap || '';
    
    this.maDonVi = String(profile.idDonVi ?? '1');
    this.danhSachQuyenHan = profile.danhSachQuyenPhanGiai ?? [];
    
    // Cache the profile to survive page reload (F5)
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  dangNhapThanhCong(token: string, refreshToken: string, tenantId: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tenantId', tenantId);
    this.maDonVi = tenantId;
    this.isAuthenticated = true;
  }

  dangXuat() {
    this.isAuthenticated = false;
    this.danhSachQuyenHan = [];
    this.currentUserProfile = null;
    this.tenNguoiDung = '';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('userProfile');
  }
}

export const authStore = new AuthStore();
export default authStore;
