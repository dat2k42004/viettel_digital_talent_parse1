package com.example.backend.modules.maintenance.service.interfaces;

import com.example.backend.modules.maintenance.dto.TienDoBaoTriChiTietRequest;
import com.example.backend.modules.maintenance.dto.PhieuSuaChuaBaoTriRequest;
import com.example.backend.modules.maintenance.dto.PhieuSuaChuaBaoTriResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDate;
import java.util.List;

public interface PhieuSuaChuaBaoTriService {
     PhieuSuaChuaBaoTriResponse themMoi(PhieuSuaChuaBaoTriRequest request);

     PhieuSuaChuaBaoTriResponse capNhat(Long id, PhieuSuaChuaBaoTriRequest request);

     void xoaMem(Long id);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     void capNhatTienDoThucHien(Long id, List<TienDoBaoTriChiTietRequest> request);

     PageResponse<PhieuSuaChuaBaoTriResponse> layDanhSach(String trangThai, LocalDate tuNgay, LocalDate denNgay,
               int page, int size, String sort);

     PhieuSuaChuaBaoTriResponse layTheoId(Long id);
}
