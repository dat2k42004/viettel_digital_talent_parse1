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
public class BienDongTonKhoEvent implements Serializable {
     private static final long serialVersionUID = 1L;

     private Long idDonVi;
     private Long idTaiSanCuThe;
     private String loaiTaiSan; // PHAN_CUNG, LINH_KIEN, PHAN_MEM
     private Long idViTriKho; // ID phân khu phòng kho lưu trữ vật lý
     private String viTriKhoChiTiet; // Mô tả ô kệ / tủ chứa vật lý cụ thể
     private String trangThaiMoi; // MOI_NHAP_KHO, DA_THANH_LY
     private Long idChungTuGoc; // ID của PhieuNhapTaiSan hoặc PhieuThanhLyTaiSan
     private String maChungTuGoc; // Mã chứng từ tương ứng (PN-... hoặc PTL-...)
     private HanhDongTonKhoEnum hanhDong;
}