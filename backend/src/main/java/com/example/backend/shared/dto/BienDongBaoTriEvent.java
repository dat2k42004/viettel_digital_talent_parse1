package com.example.backend.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienDongBaoTriEvent implements Serializable {
     private static final long serialVersionUID = 1L;

     private Long idDonVi;
     private Long idTaiSanCuThe;
     private String loaiTaiSan; // PHAN_CUNG, LINH_KIEN, PHAN_MEM
     private Long idPhieuSuaChua; // ID của PhieuSuaChuaBaoTri gánh chứng từ gốc
     private String maPhieuSuaChua; // Mã chuỗi tĩnh (PSC-...) phục vụ trace cứu đối soát
     private BigDecimal chiPhiThucTe; // Chi phí thực tế phát sinh sau nghiệm thu
     private Integer thoiGianGianDoan; // Số ngày thiết bị bị gián đoạn vận hành (Downtime)
     private String noiDungKhacPhuc; // Nội dung sửa chữa chi tiết của cá thể
     private HanhDongBaoTriEnum hanhDong;
}