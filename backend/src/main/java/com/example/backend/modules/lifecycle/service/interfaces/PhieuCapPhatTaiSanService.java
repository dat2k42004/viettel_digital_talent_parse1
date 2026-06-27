package com.example.backend.modules.lifecycle.service.interfaces;

import com.example.backend.modules.lifecycle.dto.PhieuCapPhatTaiSanRequest;
import com.example.backend.modules.lifecycle.dto.PhieuCapPhatTaiSanResponse;
import com.example.backend.shared.response.PageResponse;

import java.time.LocalDate;

public interface PhieuCapPhatTaiSanService {
    PageResponse<PhieuCapPhatTaiSanResponse> layDanhSach(
            String trangThai,
            Long idPhongBan,
            LocalDate tuNgayBanGiao,
            LocalDate denNgayBanGiao,
            int page,
            int size,
            String sort
    );

    PhieuCapPhatTaiSanResponse layTheoId(Long id);

    PhieuCapPhatTaiSanResponse themMoi(PhieuCapPhatTaiSanRequest request);

    PhieuCapPhatTaiSanResponse capNhat(Long id, PhieuCapPhatTaiSanRequest request);

    void xoaMem(Long id);

    void yeuCauPheDuyet(Long id);

    void pheDuyet(Long id);

    void hoanThanh(Long id);

    void tuChoiPheDuyet(Long id, String lyDoTuChoi);
}
