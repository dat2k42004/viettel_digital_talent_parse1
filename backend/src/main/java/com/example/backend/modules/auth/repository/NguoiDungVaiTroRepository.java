package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.NguoiDungVaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NguoiDungVaiTroRepository extends JpaRepository<NguoiDungVaiTro, Long> {
    @Modifying
    @Query("DELETE FROM NguoiDungVaiTro nv WHERE nv.nguoiDung.id = :nguoiDungId")
    void deleteByNguoiDungId(@Param("nguoiDungId") Long nguoiDungId);

    List<NguoiDungVaiTro> findByNguoiDungId(Long nguoiDungId);
}
