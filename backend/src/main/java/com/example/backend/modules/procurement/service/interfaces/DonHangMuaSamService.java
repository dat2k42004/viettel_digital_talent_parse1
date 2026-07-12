package com.example.backend.modules.procurement.service.interfaces;

import com.example.backend.modules.procurement.dto.DonHangMuaSamRequest;
import com.example.backend.modules.procurement.dto.DonHangMuaSamResponse;
import com.example.backend.modules.procurement.dto.SelectOption;
import com.example.backend.shared.dto.TrangThaiRequest;
import com.example.backend.shared.response.PageResponse;

import java.util.List;

public interface DonHangMuaSamService {
     PageResponse<DonHangMuaSamResponse> layDanhSach(String maDonHang, Long idNhaCungCap, String trangThai, int page,
               int size, String sort);

     DonHangMuaSamResponse layTheoId(Long id);

     List<SelectOption> laySelectOptions(String keyword);

     DonHangMuaSamResponse themMoi(DonHangMuaSamRequest request);

     DonHangMuaSamResponse capNhat(Long id, DonHangMuaSamRequest request);

     void yeuCauPheDuyet(Long id);

     void pheDuyet(Long id);

     void xoaMem(Long id);
}