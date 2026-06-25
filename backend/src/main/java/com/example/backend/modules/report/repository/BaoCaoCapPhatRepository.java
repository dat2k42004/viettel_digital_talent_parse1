package com.example.backend.modules.report.repository;

import com.example.backend.modules.report.model.BaoCaoCapPhat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BaoCaoCapPhatRepository
          extends JpaRepository<BaoCaoCapPhat, Long>, JpaSpecificationExecutor<BaoCaoCapPhat> {

     // Tìm danh sách tổng hợp phân bổ tài sản của một Đơn vị chủ quản
     List<BaoCaoCapPhat> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

     // Tìm danh sách tổng hợp phân bổ tài sản riêng biệt của một phòng ban cơ sở
     List<BaoCaoCapPhat> findByIdDonViAndIdPhongBanAndThoiGianXoaIsNull(Long idDonVi, Long idPhongBan);

     // Bốc bản ghi tổng hợp duy nhất để phục vụ cộng dồn số lượng & giá trị tiền
     // (VND) khi hoàn thành chứng từ bàn giao
     Optional<BaoCaoCapPhat> findByIdDonViAndIdPhongBanAndIdTaiSanDanhMucAndLoaiTaiSanAndThoiGianXoaIsNull(
               Long idDonVi, Long idPhongBan, Long idTaiSanDanhMuc, String loaiTaiSan);
}