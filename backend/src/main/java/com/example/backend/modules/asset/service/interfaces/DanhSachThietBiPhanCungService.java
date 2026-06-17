package com.example.backend.modules.asset.service.interfaces;

import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungRequest;
import com.example.backend.modules.asset.dto.DanhSachThietBiPhanCungResponse;
import com.example.backend.modules.asset.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.time.LocalDate;
import java.util.List;

public interface DanhSachThietBiPhanCungService {
    PageResponse<DanhSachThietBiPhanCungResponse> layDanhSach(
            String keyword,
            String trangThai,
            LocalDate tuNgayMua,
            LocalDate denNgayMua,
            String trangThaiKho,
            int page,
            int size,
            String sort
    );
    DanhSachThietBiPhanCungResponse layTheoId(Long id);
    DanhSachThietBiPhanCungResponse themMoi(DanhSachThietBiPhanCungRequest request);
    DanhSachThietBiPhanCungResponse capNhat(Long id, DanhSachThietBiPhanCungRequest request);
    void xoaMem(Long id);
    void capNhatTrangThai(Long id, TrangThaiRequest request);
    List<SelectOption> laySelectOptions();
}
