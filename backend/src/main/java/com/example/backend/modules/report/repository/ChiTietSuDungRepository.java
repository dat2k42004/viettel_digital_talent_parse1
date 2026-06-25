     package com.example.backend.modules.report.repository;

     import com.example.backend.modules.report.model.ChiTietSuDung;
     import org.springframework.data.jpa.repository.JpaRepository;
     import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
     import org.springframework.stereotype.Repository;
     import java.util.List;
     import java.util.Optional;

     @Repository
     public interface ChiTietSuDungRepository
               extends JpaRepository<ChiTietSuDung, Long>, JpaSpecificationExecutor<ChiTietSuDung> {

          // Lấy danh sách lịch sử bàn giao chi tiết thuộc một bản ghi tổng hợp cấp phát
          // cha
          List<ChiTietSuDung> findByBaoCaoCapPhatIdAndThoiGianXoaIsNull(Long baoCaoCapPhatId);

          // Bốc nhanh lịch sử bàn giao của một cá thể máy vật lý cụ thể để phục vụ việc
          // cập nhật tình trạng hoặc thu hồi
          Optional<ChiTietSuDung> findByIdDonViAndIdTaiSanCuTheAndLoaiTaiSanAndThoiGianXoaIsNull(
                    Long idDonVi, Long idTaiSanCuThe, String loaiTaiSan);
     }