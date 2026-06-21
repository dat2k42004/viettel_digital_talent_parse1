package com.example.backend.modules.lifecycle.service.interfaces;

import com.example.backend.modules.lifecycle.dto.PhieuThanhLyTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuThanhLyTaiSanResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;

public interface PhieuThanhLyTaiSanService {
     PageResponse<PhieuThanhLyTaiSanResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page,
               int size, String sort);

     PhieuThanhLyTaiSanResponse layTheoId(Long id);

     PhieuThanhLyTaiSanResponse themMoi(PhieuThanhLyTaiSanRequest request);

     PhieuThanhLyTaiSanResponse capNhat(Long id, PhieuThanhLyTaiSanRequest request);

     void xoaMem(Long id);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     void hoanThanh(Long id);
}
