package com.example.backend.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienDongCapPhatEvent implements Serializable {
     private static final long serialVersionUID = 1L;

     private Long idDonVi;
     private Long idTaiSanCuThe;
     private String loaiTaiSan; // PHAN_CUNG, LINH_KIEN, PHAN_MEM
     private Long idPhongBanCu; // null nếu là cấp phát mới từ kho bãi
     private Long idPhongBanMoi; // null nếu là thu hồi giải phóng về kho bãi
     private Long idNhanVienTiepNhan; // ID nhân viên trực tiếp ký nhận sở hữu máy
     private Long idChungTuGoc; // ID phiếu giao dịch Core gánh chịu trách nhiệm kiểm toán
     private String maChungTuGoc; // Mã chứng từ tương ứng (PCP-..., PTH-..., PDC-...)
     private String tinhTrangBanGiao; // Tình trạng vật lý kỹ thuật bàn giao sang tay
     private HanhDongCapPhatEnum hanhDong;
}