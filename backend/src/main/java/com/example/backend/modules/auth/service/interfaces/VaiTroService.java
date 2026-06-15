package com.example.backend.modules.auth.service.interfaces;

import com.example.backend.modules.auth.dto.VaiTroRequest;
import com.example.backend.modules.auth.dto.VaiTroResponse;
import com.example.backend.modules.auth.dto.VaiTroQuyenUpdateRequest;
import com.example.backend.shared.dto.TrangThaiRequest;

import com.example.backend.shared.response.PageResponse;

public interface VaiTroService {
    PageResponse<VaiTroResponse> layDanhSach(String tenVaiTro, String maVaiTro, String trangThai, int page, int size);
    VaiTroResponse themMoi(VaiTroRequest request);
    VaiTroResponse capNhat(Long id, VaiTroRequest request);
    void xoaMem(Long id);
    void capNhatQuyen(Long id, VaiTroQuyenUpdateRequest request);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    VaiTroResponse layTheoId(Long id);
    java.util.List<com.example.backend.modules.auth.dto.VaiTroDropdownResponse> layDropdown();
}

