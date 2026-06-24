package com.example.backend.modules.inventory.service.interfaces;

import com.example.backend.modules.inventory.dto.DotKiemKeRequest;
import com.example.backend.modules.inventory.dto.DotKiemKeResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;

public interface DotKiemKeService {
     DotKiemKeResponse themMoi(DotKiemKeRequest request);

     DotKiemKeResponse capNhat(Long id, DotKiemKeRequest request);

     void xoaMem(Long id);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     PageResponse<DotKiemKeResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay, int page,
               int size, String sort);

     DotKiemKeResponse layTheoId(Long id);
}
