package com.example.backend.modules.report.repository;

import com.example.backend.modules.report.model.BaoCaoBaoTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BaoCaoBaoTriRepository
          extends JpaRepository<BaoCaoBaoTri, Long>, JpaSpecificationExecutor<BaoCaoBaoTri> {

     // Lấy toàn bộ tổng hợp chi phí bảo trì sửa chữa của một Đơn vị để render lên
     // báo cáo tài chính CNTT
     List<BaoCaoBaoTri> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

     // Tìm bản ghi tổng hợp duy nhất của một dòng sản phẩm để cộng dồn chi phí thực
     // tế phát sinh sau nghiệm thu bảo dưỡng
     Optional<BaoCaoBaoTri> findByIdDonViAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
               Long idDonVi, Long idTaiSanDanhMuc, String loaiTaiSan);
}