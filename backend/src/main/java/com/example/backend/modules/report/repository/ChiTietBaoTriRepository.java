package com.example.backend.modules.report.repository;

import com.example.backend.modules.report.model.ChiTietBaoTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietBaoTriRepository
          extends JpaRepository<ChiTietBaoTri, Long>, JpaSpecificationExecutor<ChiTietBaoTri> {

     // Lấy danh sách tất cả các lượt sửa chữa chi tiết thuộc một bản ghi tổng hợp
     // chi phí cha
     List<ChiTietBaoTri> findByBaoCaoBaoTriIdAndThoiGianXoaIsNull(Long baoCaoBaoTriId);

     // Truy vấn nhanh toàn bộ các dòng sửa chữa thiết bị/linh kiện liên kết với một
     // phiếu sửa chữa gốc cụ thể
     List<ChiTietBaoTri> findByIdDonViAndIdPhieuSuaChuaAndThoiGianXoaIsNull(Long idDonVi, Long idPhieuSuaChua);
}