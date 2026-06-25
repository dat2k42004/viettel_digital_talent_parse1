package com.example.backend.modules.report.repository;

import com.example.backend.modules.report.model.ChiTietTonKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietTonKhoRepository
          extends JpaRepository<ChiTietTonKho, Long>, JpaSpecificationExecutor<ChiTietTonKho> {

     // Tìm danh sách tất cả cá thể máy cụ thể nằm trong một bản ghi tổng hợp tồn kho
     // cha
     List<ChiTietTonKho> findByBaoCaoTonKhoIdAndThoiGianXoaIsNull(Long baoCaoTonKhoId);

     // Truy vết nhanh một cá thể tài sản vật lý cụ thể xem đang nằm ở báo cáo tồn
     // kho nào
     Optional<ChiTietTonKho> findByIdDonViAndIdTaiSanCuTheAndLoaiTaiSanAndThoiGianXoaIsNull(
               Long idDonVi, Long idTaiSanCuThe, String loaiTaiSan);
}