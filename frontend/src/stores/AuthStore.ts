import { makeAutoObservable } from 'mobx';
import type { NguoiDungResponse } from '../api-generated/models/nguoiDungResponse';

export const QUYEN = {
  XEM_BAO_CAO: 'XEM_BAO_CAO',
  THAO_TAC_TAI_SAN: 'THAO_TAC_TAI_SAN',
  XEM_QUAN_TRI_TOAN_SAN: 'XEM_QUAN_TRI_TOAN_SAN',

  // Quyền người dùng
  NHOM_NGUOI_DUNG: 'NHOM_NGUOI_DUNG',
  XEM_NGUOI_DUNG: 'XEM_NGUOI_DUNG',
  SUA_NGUOI_DUNG: 'SUA_NGUOI_DUNG',
  CAP_NHAT_QUYEN_NGUOI_DUNG: 'CAP_NHAT_QUYEN_NGUOI_DUNG',
  CAP_NHAT_TRANG_THAI_NGUOI_DUNG: 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG',
  XOA_NGUOI_DUNG: 'XOA_NGUOI_DUNG',

  // Quyên vai trò
  NHOM_VAI_TRO: 'NHOM_VAI_TRO',
  XEM_VAI_TRO: 'XEM_VAI_TRO',
  THEM_VAI_TRO: 'THEM_VAI_TRO',
  SUA_VAI_TRO: 'SUA_VAI_TRO',
  XOA_VAI_TRO: 'XOA_VAI_TRO',
  CAP_NHAT_QUYEN_VAI_TRO: 'CAP_NHAT_QUYEN_VAI_TRO',

  XEM_QUYEN: 'XEM_QUYEN',
  // Quyền quản lý Đơn vị (Tenant)
  NHOM_QUAN_LY_DON_VI: 'NHOM_QUAN_LY_DON_VI',
  XEM_DON_VI: 'XEM_DON_VI',
  SUA_DON_VI: 'SUA_DON_VI',
  KHOA_DON_VI: 'KHOA_DON_VI',
  XOA_DON_VI: 'XOA_DON_VI',
  GIA_HAN_DON_VI: 'GIA_HAN_DON_VI',
  // Quyền Phòng ban
  NHOM_QUAN_LY_PHONG_BAN: 'NHOM_QUAN_LY_PHONG_BAN',
  XEM_PHONG_BAN: 'XEM_PHONG_BAN',
  THEM_PHONG_BAN: 'THEM_PHONG_BAN',
  SUA_PHONG_BAN: 'SUA_PHONG_BAN',
  XOA_PHONG_BAN: 'XOA_PHONG_BAN',
  CAP_NHAT_TRANG_THAI_PHONG_BAN: 'CAP_NHAT_TRANG_THAI_PHONG_BAN',
  // Quyền Vị trí
  NHOM_QUAN_LY_VI_TRI: 'NHOM_QUAN_LY_VI_TRI',
  XEM_VI_TRI: 'XEM_VI_TRI',
  THEM_VI_TRI: 'THEM_VI_TRI',
  SUA_VI_TRI: 'SUA_VI_TRI',
  XOA_VI_TRI: 'XOA_VI_TRI',
  CAP_NHAT_TRANG_THAI_VI_TRI: 'CAP_NHAT_TRANG_THAI_VI_TRI',
  // Quyền Danh mục cấu hình hệ thống (Super Admin)
  NHOM_DANH_MUC_CAU_HINH: 'NHOM_DANH_MUC_CAU_HINH',
  XEM_DANH_MUC_CAU_HINH: 'XEM_DANH_MUC_CAU_HINH',
  THEM_DANH_MUC_CAU_HINH: 'THEM_DANH_MUC_CAU_HINH',
  SUA_DANH_MUC_CAU_HINH: 'SUA_DANH_MUC_CAU_HINH',
  XOA_DANH_MUC_CAU_HINH: 'XOA_DANH_MUC_CAU_HINH',
  // Quyền Cấu hình đơn vị
  NHOM_CAU_HINH_DON_VI: 'NHOM_CAU_HINH_DON_VI',
  XEM_CAU_HINH_DON_VI: 'XEM_CAU_HINH_DON_VI',
  THEM_CAU_HINH_DON_VI: 'THEM_CAU_HINH_DON_VI',
  SUA_CAU_HINH_DON_VI: 'SUA_CAU_HINH_DON_VI',
  XOA_CAU_HINH_DON_VI: 'XOA_CAU_HINH_DON_VI',

  // ── Hãng sản xuất ──────────────────────────────
  NHOM_HANG_SAN_XUAT: 'NHOM_HANG_SAN_XUAT',
  XEM_HANG_SAN_XUAT: 'XEM_HANG_SAN_XUAT',
  THEM_HANG_SAN_XUAT: 'THEM_HANG_SAN_XUAT',
  SUA_HANG_SAN_XUAT: 'SUA_HANG_SAN_XUAT',
  CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT: 'CAP_NHAT_TRANG_THAI_HANG_SAN_XUAT',
  XOA_HANG_SAN_XUAT: 'XOA_HANG_SAN_XUAT',

  // ── Loại tài sản ───────────────────────────────
  NHOM_LOAI_TAI_SAN: 'NHOM_LOAI_TAI_SAN',
  XEM_LOAI_TAI_SAN: 'XEM_LOAI_TAI_SAN',
  THEM_LOAI_TAI_SAN: 'THEM_LOAI_TAI_SAN',
  SUA_LOAI_TAI_SAN: 'SUA_LOAI_TAI_SAN',
  CAP_NHAT_TRANG_THAI_LOAI_TAI_SAN: 'CAP_NHAT_TRANG_THAI_LOAI_TAI_SAN',
  XOA_LOAI_TAI_SAN: 'XOA_LOAI_TAI_SAN',

  // ── Danh mục tài sản ───────────────────────────
  NHOM_DANH_MUC_TAI_SAN: 'NHOM_DANH_MUC_TAI_SAN',
  XEM_DANH_MUC_TAI_SAN: 'XEM_DANH_MUC_TAI_SAN',
  THEM_DANH_MUC_TAI_SAN: 'THEM_DANH_MUC_TAI_SAN',
  SUA_DANH_MUC_TAI_SAN: 'SUA_DANH_MUC_TAI_SAN',
  CAP_NHAT_TRANG_THAI_DANH_MUC_TAI_SAN: 'CAP_NHAT_TRANG_THAI_DANH_MUC_TAI_SAN',
  XOA_DANH_MUC_TAI_SAN: 'XOA_DANH_MUC_TAI_SAN',

  // ── Mẫu mã phần cứng ───────────────────────────
  NHOM_MAU_TAI_SAN: 'NHOM_MAU_TAI_SAN',
  XEM_TAI_SAN_PHAN_CUNG: 'XEM_TAI_SAN_PHAN_CUNG',
  THEM_TAI_SAN_PHAN_CUNG: 'THEM_TAI_SAN_PHAN_CUNG',
  SUA_TAI_SAN_PHAN_CUNG: 'SUA_TAI_SAN_PHAN_CUNG',
  CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG: 'CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_CUNG',
  XOA_TAI_SAN_PHAN_CUNG: 'XOA_TAI_SAN_PHAN_CUNG',

  // ── Mẫu mã phần mềm ────────────────────────────
  XEM_TAI_SAN_PHAN_MEM: 'XEM_TAI_SAN_PHAN_MEM',
  THEM_TAI_SAN_PHAN_MEM: 'THEM_TAI_SAN_PHAN_MEM',
  SUA_TAI_SAN_PHAN_MEM: 'SUA_TAI_SAN_PHAN_MEM',
  CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM: 'CAP_NHAT_TRANG_THAI_TAI_SAN_PHAN_MEM',
  XOA_TAI_SAN_PHAN_MEM: 'XOA_TAI_SAN_PHAN_MEM',

  // ── Thiết bị phần cứng (thực thể) ──────────────
  NHOM_THIET_BI_THUC_THE: 'NHOM_THIET_BI_THUC_THE',
  XEM_THIET_BI_PHAN_CUNG: 'XEM_THIET_BI_PHAN_CUNG',
  THEM_THIET_BI_PHAN_CUNG: 'THEM_THIET_BI_PHAN_CUNG',
  SUA_THIET_BI_PHAN_CUNG: 'SUA_THIET_BI_PHAN_CUNG',
  CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG: 'CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_CUNG',
  XOA_THIET_BI_PHAN_CUNG: 'XOA_THIET_BI_PHAN_CUNG',

  // ── Key bản quyền phần mềm (thực thể) ───────────────
  XEM_THIET_BI_PHAN_MEM: 'XEM_THIET_BI_PHAN_MEM',
  THEM_THIET_BI_PHAN_MEM: 'THEM_THIET_BI_PHAN_MEM',
  SUA_THIET_BI_PHAN_MEM: 'SUA_THIET_BI_PHAN_MEM',
  CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM: 'CAP_NHAT_TRANG_THAI_THIET_BI_PHAN_MEM',
  XOA_THIET_BI_PHAN_MEM: 'XOA_THIET_BI_PHAN_MEM',

  // ── Linh kiện phần cứng (thực thể) ─────────────
  XEM_LINH_KIEN_PHAN_CUNG: 'XEM_LINH_KIEN_PHAN_CUNG',
  THEM_LINH_KIEN_PHAN_CUNG: 'THEM_LINH_KIEN_PHAN_CUNG',
  SUA_LINH_KIEN_PHAN_CUNG: 'SUA_LINH_KIEN_PHAN_CUNG',
  CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG: 'CAP_NHAT_TRANG_THAI_LINH_KIEN_PHAN_CUNG',
  XOA_LINH_KIEN_PHAN_CUNG: 'XOA_LINH_KIEN_PHAN_CUNG',

  // ── Danh mục thuộc tính động ────────────────────
  NHOM_DANH_MUC_THUOC_TINH: 'NHOM_DANH_MUC_THUOC_TINH',
  XEM_DANH_MUC_THUOC_TINH: 'XEM_DANH_MUC_THUOC_TINH',
  THEM_DANH_MUC_THUOC_TINH: 'THEM_DANH_MUC_THUOC_TINH',
  SUA_DANH_MUC_THUOC_TINH: 'SUA_DANH_MUC_THUOC_TINH',
  CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH: 'CAP_NHAT_TRANG_THAI_DANH_MUC_THUOC_TINH',
  XOA_DANH_MUC_THUOC_TINH: 'XOA_DANH_MUC_THUOC_TINH',

  // ── Giá trị thuộc tính ─────────────────────────
  XEM_GIA_TRI_THUOC_TINH: 'XEM_GIA_TRI_THUOC_TINH',
  LUU_GIA_TRI_THUOC_TINH: 'LUU_GIA_TRI_THUOC_TINH',

  // ── Lắp ráp linh kiện ──────────────────────────
  NHOM_LAP_RAP_LINH_KIEN: 'NHOM_LAP_RAP_LINH_KIEN',
  XEM_LAP_RAP_LINH_KIEN: 'XEM_LAP_RAP_LINH_KIEN',
  THEM_LAP_RAP_LINH_KIEN: 'THEM_LAP_RAP_LINH_KIEN',
  SUA_LAP_RAP_LINH_KIEN: 'SUA_LAP_RAP_LINH_KIEN',

  // ── Nhà cung cấp ──────────────────────────
  NHOM_NHA_CUNG_CAP: 'NHOM_NHA_CUNG_CAP',
  XEM_NHA_CUNG_CAP: 'XEM_NHA_CUNG_CAP',
  THEM_NHA_CUNG_CAP: 'THEM_NHA_CUNG_CAP',
  SUA_NHA_CUNG_CAP: 'SUA_NHA_CUNG_CAP',
  XOA_NHA_CUNG_CAP: 'XOA_NHA_CUNG_CAP',
  CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP: 'CAP_NHAT_TRANG_THAI_NHA_CUNG_CAP',

  // ── Đơn hàng mua sắm ──────────────────────────
  NHOM_DON_HANG_MUA_SAM: 'NHOM_DON_HANG_MUA_SAM',
  XEM_DON_HANG_MUA_SAM: 'XEM_DON_HANG_MUA_SAM',
  THEM_DON_HANG_MUA_SAM: 'THEM_DON_HANG_MUA_SAM',
  SUA_DON_HANG_MUA_SAM: 'SUA_DON_HANG_MUA_SAM',
  XOA_DON_HANG_MUA_SAM: 'XOA_DON_HANG_MUA_SAM',
  YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM: 'YEU_CAU_PHE_DUYET_DON_HANG_MUA_SAM',
  PHE_DUYET_DON_HANG_MUA_SAM: 'PHE_DUYET_DON_HANG_MUA_SAM',

  // ── Phiếu nhập tài sản ──────────────────────────
  NHOM_PHIEU_NHAP_KHO: 'NHOM_PHIEU_NHAP_KHO',
  XEM_PHIEU_NHAP_TAI_SAN: 'XEM_PHIEU_NHAP_TAI_SAN',
  THEM_PHIEU_NHAP_TAI_SAN: 'THEM_PHIEU_NHAP_TAI_SAN',
  SUA_PHIEU_NHAP_TAI_SAN: 'SUA_PHIEU_NHAP_TAI_SAN',
  XOA_PHIEU_NHAP_TAI_SAN: 'XOA_PHIEU_NHAP_TAI_SAN',
  CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN: 'CAP_NHAT_TRANG_THAI_PHIEU_NHAP_TAI_SAN',

  // ── Phiếu cấp phát tài sản ──────────────────────────
  NHOM_PHIEU_CAP_PHAT: 'NHOM_PHIEU_CAP_PHAT',
  XEM_PHIEU_CAP_PHAT: 'XEM_PHIEU_CAP_PHAT',
  THEM_PHIEU_CAP_PHAT: 'THEM_PHIEU_CAP_PHAT',
  SUA_PHIEU_CAP_PHAT: 'SUA_PHIEU_CAP_PHAT',
  XOA_PHIEU_CAP_PHAT: 'XOA_PHIEU_CAP_PHAT',
  YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT: 'YEU_CAU_PHE_DUYET_PHIEU_CAP_PHAT',
  PHE_DUYET_PHIEU_CAP_PHAT: 'PHE_DUYET_PHIEU_CAP_PHAT',
  HOAN_THANH_PHIEU_CAP_PHAT: 'HOAN_THANH_PHIEU_CAP_PHAT',

  // ── Phiếu thu hồi tài sản ──────────────────────────
  NHOM_PHIEU_THU_HOI: 'NHOM_PHIEU_THU_HOI',
  XEM_PHIEU_THU_HOI_TAI_SAN: 'XEM_PHIEU_THU_HOI_TAI_SAN',
  THEM_PHIEU_THU_HOI_TAI_SAN: 'THEM_PHIEU_THU_HOI_TAI_SAN',
  SUA_PHIEU_THU_HOI_TAI_SAN: 'SUA_PHIEU_THU_HOI_TAI_SAN',
  XOA_PHIEU_THU_HOI_TAI_SAN: 'XOA_PHIEU_THU_HOI_TAI_SAN',
  YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN: 'YEU_CAU_PHE_DUYET_PHIEU_THU_HOI_TAI_SAN',
  PHE_DUYET_PHIEU_THU_HOI_TAI_SAN: 'PHE_DUYET_PHIEU_THU_HOI_TAI_SAN',
  HOAN_THANH_PHIEU_THU_HOI_TAI_SAN: 'HOAN_THANH_PHIEU_THU_HOI_TAI_SAN',

  // ── Phiếu điều chuyển tài sản ──────────────────────────
  NHOM_PHIEU_THANH_LY: 'NHOM_PHIEU_THANH_LY',
  NHOM_PHIEU_DIEU_CHUYEN: 'NHOM_PHIEU_DIEU_CHUYEN',
  XEM_PHIEU_DIEU_CHUYEN: 'XEM_PHIEU_DIEU_CHUYEN',
  THEM_PHIEU_DIEU_CHUYEN: 'THEM_PHIEU_DIEU_CHUYEN',
  SUA_PHIEU_DIEU_CHUYEN: 'SUA_PHIEU_DIEU_CHUYEN',
  XOA_PHIEU_DIEU_CHUYEN: 'XOA_PHIEU_DIEU_CHUYEN',
  YEU_CAU_PHE_DUYET_DIEU_CHUYEN: 'YEU_CAU_PHE_DUYET_DIEU_CHUYEN',
  PHE_DUYET_DIEU_CHUYEN: 'PHE_DUYET_DIEU_CHUYEN',
  HOAN_THANH_DIEU_CHUYEN: 'HOAN_THANH_DIEU_CHUYEN',

  // ── Phiếu thanh lý tài sản ──────────────────────────
  XEM_PHIEU_THANH_LY: 'XEM_PHIEU_THANH_LY',
  THEM_PHIEU_THANH_LY: 'THEM_PHIEU_THANH_LY',
  SUA_PHIEU_THANH_LY: 'SUA_PHIEU_THANH_LY',
  XOA_PHIEU_THANH_LY: 'XOA_PHIEU_THANH_LY',
  YEU_CAU_PHE_DUYET_THANH_LY: 'YEU_CAU_PHE_DUYET_THANH_LY',
  PHE_DUYET_THANH_LY: 'PHE_DUYET_THANH_LY',
  HOAN_THANH_THANH_LY: 'HOAN_THANH_THANH_LY',
  TAI_LEN_FILE: 'TAI_LEN_FILE',
} as const;

export type QuyenHanKey = (typeof QUYEN)[keyof typeof QUYEN] | string;



class AuthStore {
  isAuthenticated: boolean = false;
  tenNguoiDung: string = '';
  maDonVi: string | null = null;
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
        this.maDonVi = profile.idDonVi ? String(profile.idDonVi) : '';
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
    if (maDonVi) {
      localStorage.setItem('tenantId', maDonVi);
    } else {
      localStorage.removeItem('tenantId');
    }
  }

  // Nạp toàn bộ hồ sơ cá nhân nhận về từ API /api/auth/me
  napHoSoCaNhan(profile: NguoiDungResponse) {
    this.currentUserProfile = profile;
    this.isAuthenticated = true;

    // Nối họ tên đệm và tên người dùng
    const parts = [profile.hoNguoiDung, profile.tenDemNguoiDung, profile.tenNguoiDung];
    this.tenNguoiDung = parts.filter(Boolean).join(' ') || profile.tenDangNhap || '';

    this.maDonVi = profile.idDonVi ? String(profile.idDonVi) : '';
    if (this.maDonVi) {
      localStorage.setItem('tenantId', this.maDonVi);
    } else {
      localStorage.removeItem('tenantId');
    }
    this.danhSachQuyenHan = profile.danhSachQuyenPhanGiai ?? [];

    // Cache the profile to survive page reload (F5)
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  dangNhapThanhCong(token: string, refreshToken: string, tenantId: string) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    if (tenantId) {
      localStorage.setItem('tenantId', tenantId);
      this.maDonVi = tenantId;
    } else {
      localStorage.removeItem('tenantId');
      this.maDonVi = '';
    }
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
