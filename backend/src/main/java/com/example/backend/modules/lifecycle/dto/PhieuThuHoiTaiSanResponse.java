package com.example.backend.modules.lifecycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin phản hồi của phiếu thu hồi tài sản")
public class PhieuThuHoiTaiSanResponse {
    private Long id;
    private Long idDonVi;
    private String maPhieuThuHoi;
    private Long idNhanVienTra;

    @Schema(description = "Tên nhân viên trả tài sản")
    private String tenNhanVienTra;

    private Long idPhongBanTra;
    private String tenPhongBanTra;

    @Schema(description = "Tên người lập phiếu thu hồi")
    private String tenNguoiLap;

    @Schema(description = "Tên người phê duyệt phiếu thu hồi")
    private String tenNguoiPheDuyet;

    private String lyDoThuHoi;
    private LocalDateTime thoiGianThuHoi;
    private String trangThai;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;

    @Schema(description = "Danh sách chi tiết tài sản thu hồi")
    private List<ChiTietThuHoiGeneralResponse> chiTietTaiSan;
}
