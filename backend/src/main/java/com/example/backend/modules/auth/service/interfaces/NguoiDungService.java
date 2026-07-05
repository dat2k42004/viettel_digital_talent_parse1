package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.NguoiDungTrangThaiRequest;
import com.example.backend.modules.auth.dto.NguoiDungQuyenUpdateRequest;

import com.example.backend.shared.response.PageResponse;

public interface NguoiDungService {
    PageResponse<NguoiDungResponse> layDanhSach(
            String search,
            String trangThai,
            Long idPhongBan,
            String chucVu,
            String maNguoiDung,
            int page,
            int size);

    NguoiDungResponse themMoi(NguoiDungRequest request);

    NguoiDungResponse capNhat(Long id, NguoiDungRequest request);

    void xoaMem(Long id);

    void capNhatTrangThai(Long id, NguoiDungTrangThaiRequest request);

    void capNhatQuyenTrucTiep(Long id, NguoiDungQuyenUpdateRequest request);

    NguoiDungResponse layTheoId(Long id);

    java.util.List<String> resolveAndCacheUserPermissions(Long userId);

    void thuHoiPhien(Long id);

    java.util.List<com.example.backend.modules.asset.dto.SelectOption> laySelectOptions(Long idPhongBan);
    java.util.List<NguoiDungResponse> layAdminDonVi(Long idDonVi);
    java.util.Map<Long, String> layTenNguoiDungTheoIds(java.util.Collection<Long> ids);
    String layTenNguoiDungTheoId(Long id);
    Long layIdNguoiDungHienTai();
}
