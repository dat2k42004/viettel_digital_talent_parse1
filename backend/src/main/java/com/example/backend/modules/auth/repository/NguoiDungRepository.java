package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.example.backend.shared.model.TrangThaiCoBanEnum;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long>, JpaSpecificationExecutor<NguoiDung> {
    Optional<NguoiDung> findByTenDangNhapOrEmail(String tenDangNhap, String email);

    List<NguoiDung> findAllByTenDangNhap(String tenDangNhap);

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    Optional<NguoiDung> findByTenDangNhapAndThoiGianXoaIsNull(String tenDangNhap);

    Optional<NguoiDung> findByEmailAndThoiGianXoaIsNull(String email);

    Optional<NguoiDung> findByIdAndThoiGianXoaIsNull(Long id);

    List<NguoiDung> findByIdDonViIsNullAndThoiGianXoaIsNull();

    List<NguoiDung> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

    List<NguoiDung> findAllByIdInAndThoiGianXoaIsNull(Set<Long> ids);

    boolean existsByTenDangNhapAndThoiGianXoaIsNull(String tenDangNhap);

    boolean existsByEmailAndThoiGianXoaIsNull(String email);

    @Modifying
    @Query("UPDATE NguoiDung n SET n.trangThai = :trangThai WHERE n.idDonVi = :idDonVi AND n.thoiGianXoa IS NULL")
    void updateTrangThaiByIdDonVi(Long idDonVi, TrangThaiCoBanEnum trangThai);

    @Modifying
    @Query("UPDATE NguoiDung n SET n.thoiGianXoa = :thoiGianXoa, n.lyDoXoa = :lyDoXoa WHERE n.idDonVi = :idDonVi AND n.thoiGianXoa IS NULL")
    void softDeleteByIdDonVi(Long idDonVi, LocalDateTime thoiGianXoa, String lyDoXoa);
}
