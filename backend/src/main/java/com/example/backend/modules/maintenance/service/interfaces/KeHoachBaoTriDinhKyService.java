package com.example.backend.modules.maintenance.service.interfaces;

import com.example.backend.modules.maintenance.dto.KeHoachBaoTriDinhKyRequest;
import com.example.backend.modules.maintenance.dto.KeHoachBaoTriDinhKyResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;

public interface KeHoachBaoTriDinhKyService {
     KeHoachBaoTriDinhKyResponse themMoi(KeHoachBaoTriDinhKyRequest request);

     KeHoachBaoTriDinhKyResponse capNhat(Long id, KeHoachBaoTriDinhKyRequest request);

     void xoaMem(Long id);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     PageResponse<KeHoachBaoTriDinhKyResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page,
               int size, String sort);

     KeHoachBaoTriDinhKyResponse layTheoId(Long id);
}