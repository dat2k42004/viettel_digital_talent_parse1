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

// Preset các vai trò ảo phục vụ demo Role Selector Widget
export const VAI_TRO_DEMO: Record<string, string[]> = {
  'Super Admin': [QUYEN.XEM_QUAN_TRI_TOAN_SAN, QUYEN.XEM_BAO_CAO, QUYEN.XEM_NGUOI_DUNG, QUYEN.XEM_VAI_TRO, QUYEN.XEM_QUYEN],
  Admin: [QUYEN.XEM_BAO_CAO, QUYEN.THAO_TAC_TAI_SAN, QUYEN.XEM_NGUOI_DUNG, QUYEN.XEM_VAI_TRO, QUYEN.XEM_QUYEN],
  Staff: [QUYEN.THAO_TAC_TAI_SAN],
  'End User': [],
};

class AuthStore {
  isAuthenticated: boolean = true;
  tenNguoiDung: string = 'Nguyen Van Admin';
  maDonVi: string = '1';
  danhSachQuyenHan: string[] = [
    'XEM_QUAN_TRI_TOAN_SAN',
    'XEM_BAO_CAO',
    'XEM_NGUOI_DUNG',
    'XEM_VAI_TRO',
    'XEM_QUYEN',
    'THAO_TAC_TAI_SAN'
  ];
  currentUserProfile: NguoiDungResponse | null = {
    tenDangNhap: 'admin',
    hoNguoiDung: 'Nguyen',
    tenDemNguoiDung: 'Van',
    tenNguoiDung: 'Admin',
    email: 'admin@itam-system.com',
    soDienThoai: '0988888888',
    chucVu: 'Quản trị hệ thống',
    tenPhongBan: 'Phòng CNTT',
    danhSachQuyenPhanGiai: [
      'XEM_QUAN_TRI_TOAN_SAN',
      'XEM_BAO_CAO',
      'XEM_NGUOI_DUNG',
      'XEM_VAI_TRO',
      'XEM_QUYEN',
      'THAO_TAC_TAI_SAN'
    ]
  };

  constructor() {
    makeAutoObservable(this);
    const savedTenant = localStorage.getItem('tenantId');
    if (savedTenant) {
      this.maDonVi = savedTenant;
    }
  }

  // Kiểm tra 1 hoặc nhiều quyền (OR logic — có ít nhất 1 quyền khớp là hợp lệ)
  kiemTraQuyen(quyenYeuCau: string | string[]): boolean {
    const ds = Array.isArray(quyenYeuCau) ? quyenYeuCau : [quyenYeuCau];
    return ds.some((q) => this.danhSachQuyenHan.includes(q));
  }

  // Cập nhật vai trò ảo phục vụ mục đích demo nhanh trên UI
  doiVaiTro(tenVaiTro: string) {
    this.danhSachQuyenHan = VAI_TRO_DEMO[tenVaiTro] ?? [];
    if (this.currentUserProfile) {
      this.currentUserProfile.danhSachQuyenPhanGiai = this.danhSachQuyenHan;
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
  }
}

export const authStore = new AuthStore();
export default authStore;
