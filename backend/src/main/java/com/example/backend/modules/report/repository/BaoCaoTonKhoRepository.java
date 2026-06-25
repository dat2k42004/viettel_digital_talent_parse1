package com.example.backend.modules.report.repository;

import com.example.backend.modules.report.model.BaoCaoTonKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BaoCaoTonKhoRepository
          extends JpaRepository<BaoCaoTonKho, Long>, JpaSpecificationExecutor<BaoCaoTonKho> {

     // Tìm danh sách tổng hợp tồn kho của một đơn vị Tenant
     List<BaoCaoTonKho> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

     // Tìm danh sách tổng hợp tồn kho phân vùng cụ thể theo Vị trí (Kho) chứa
     List<BaoCaoTonKho> findByIdDonViAndIdViTriAndThoiGianXoaIsNull(Long idDonVi, Long idViTri);

     // Bốc bản ghi tổng hợp duy nhất để phục vụ cộng dồn/trừ bớt số lượng khi nhập
     // kho hoặc xuất kho vật lý
     Optional<BaoCaoTonKho> findByIdDonViAndIdViTriAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
               Long idDonVi, Long idViTri, Long idTaiSanDanhMuc, String loaiTaiSan);
}