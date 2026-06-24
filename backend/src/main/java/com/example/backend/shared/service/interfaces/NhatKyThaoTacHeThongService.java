package com.example.backend.shared.service.interfaces;

import com.example.backend.shared.dto.NhatKyThaoTacHeThongResponse;
import com.example.backend.shared.response.PageResponse;
import java.time.LocalDateTime;

public interface NhatKyThaoTacHeThongService {
    PageResponse<NhatKyThaoTacHeThongResponse> layDanhSach(
            Long idTaiKhoanThaoTac,
            String phuongThucApi,
            String thucTheTacDong,
            LocalDateTime tuNgay,
            LocalDateTime denNgay,
            int page,
            int size
    );
}
