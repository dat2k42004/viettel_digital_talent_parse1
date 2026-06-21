package com.example.backend.modules.lifecycle.service.interfaces;

import com.example.backend.modules.lifecycle.dto.ActiveAllocationResponse;
import com.example.backend.modules.lifecycle.dto.PhieuThuHoiTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuThuHoiTaiSanResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;

public interface PhieuThuHoiTaiSanService {
    PageResponse<PhieuThuHoiTaiSanResponse> layDanhSach(
            String trangThai,
            Long idPhongBan,
            LocalDate tuNgay,
            LocalDate denNgay,
            int page,
            int size,
            String sort
    );

    PhieuThuHoiTaiSanResponse layTheoId(Long id);

    ActiveAllocationResponse layAllocationsCuaNhanVien(Long idNhanVien);

    PhieuThuHoiTaiSanResponse themMoi(PhieuThuHoiTaiSanRequest request);

    PhieuThuHoiTaiSanResponse capNhat(Long id, PhieuThuHoiTaiSanRequest request);

    void xoaMem(Long id);

    void yeuCauPheDuyet(Long id);

    void pheDuyet(Long id);

    void hoanThanh(Long id);
}
