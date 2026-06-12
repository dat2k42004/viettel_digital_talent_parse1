package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.NguoiDungRequest;
import com.example.backend.modules.auth.dto.NguoiDungResponse;
import com.example.backend.modules.auth.dto.NguoiDungTrangThaiRequest;
import com.example.backend.modules.auth.dto.NguoiDungQuyenUpdateRequest;

import com.example.backend.shared.response.PageResponse;

public interface NguoiDungService {
    PageResponse<NguoiDungResponse> layDanhSach(String search, String trangThai, int page, int size);
    NguoiDungResponse themMoi(NguoiDungRequest request);
    NguoiDungResponse capNhat(Long id, NguoiDungRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, NguoiDungTrangThaiRequest request);
    void capNhatQuyenTrucTiep(Long id, NguoiDungQuyenUpdateRequest request);
    NguoiDungResponse layTheoId(Long id);
}

