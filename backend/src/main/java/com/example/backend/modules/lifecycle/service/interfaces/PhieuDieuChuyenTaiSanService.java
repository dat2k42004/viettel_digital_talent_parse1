package com.example.backend.modules.lifecycle.service.interfaces;

import com.example.backend.modules.lifecycle.dto.PhieuDieuChuyenTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuDieuChuyenTaiSanResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;

public interface PhieuDieuChuyenTaiSanService {
     PageResponse<PhieuDieuChuyenTaiSanResponse> layDanhSach(String trangThai, Long idNguoiChuyen, Long idNguoiNhan,
               LocalDate tuNgay, LocalDate denNgay, int page, int size, String sort);

     PhieuDieuChuyenTaiSanResponse layTheoId(Long id);

     PhieuDieuChuyenTaiSanResponse themMoi(PhieuDieuChuyenTaiSanRequest request);

     PhieuDieuChuyenTaiSanResponse capNhat(Long id, PhieuDieuChuyenTaiSanRequest request);

     void xoaMem(Long id);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     void hoanThanh(Long id);

     void tuChoiPheDuyet(Long id, String lyDoTuChoi);
}
