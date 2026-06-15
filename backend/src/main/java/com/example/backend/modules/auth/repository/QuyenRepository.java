package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.Quyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuyenRepository extends JpaRepository<Quyen, Long> {

    @Query("SELECT DISTINCT q FROM Quyen q " +
           "LEFT JOIN VaiTroQuyen vq ON q.id = vq.quyen.id " +
           "LEFT JOIN NguoiDungVaiTro nv ON vq.vaiTro.id = nv.vaiTro.id " +
           "LEFT JOIN NguoiDungQuyen nq ON q.id = nq.quyen.id " +
           "WHERE (nv.nguoiDung.id = :userId OR nq.nguoiDung.id = :userId) AND q.thoiGianXoa IS NULL")
    List<Quyen> findAllByNguoiDungId(@Param("userId") Long userId);

    boolean existsByMaQuyen(String maQuyen);
    List<Quyen> findByLoaiQuyenAndTrangThaiAndThoiGianXoaIsNull(String loaiQuyen, String trangThai);
    List<Quyen> findByThoiGianXoaIsNull();
}
