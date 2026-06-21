package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.backend.shared.model.TrangThaiCoBanEnum;

public interface VaiTroRepository extends JpaRepository<VaiTro, Long>, JpaSpecificationExecutor<VaiTro> {
    // Nếu idDonVi = null (Hệ thống)
    List<VaiTro> findByIdDonViIsNullAndThoiGianXoaIsNull();
    
    // Nếu idDonVi != null (Đơn vị)
    List<VaiTro> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

    List<VaiTro> findByIdDonViAndTrangThaiAndThoiGianXoaIsNull(Long idDonVi, TrangThaiCoBanEnum trangThai);
    List<VaiTro> findByIdDonViIsNullAndTrangThaiAndThoiGianXoaIsNull(TrangThaiCoBanEnum trangThai);

    Optional<VaiTro> findByIdAndThoiGianXoaIsNull(Long id);

    boolean existsByMaVaiTroAndIdDonViAndThoiGianXoaIsNull(String maVaiTro, Long idDonVi);
    boolean existsByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull(String maVaiTro);

    @Modifying
    @Query("UPDATE VaiTro v SET v.trangThai = :trangThai WHERE v.idDonVi = :idDonVi AND v.thoiGianXoa IS NULL")
    void updateTrangThaiByIdDonVi(Long idDonVi, TrangThaiCoBanEnum trangThai);

    @Modifying
    @Query("UPDATE VaiTro v SET v.thoiGianXoa = :thoiGianXoa, v.lyDoXoa = :lyDoXoa WHERE v.idDonVi = :idDonVi AND v.thoiGianXoa IS NULL")
    void softDeleteByIdDonVi(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
