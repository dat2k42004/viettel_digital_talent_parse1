package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.NguoiDungQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NguoiDungQuyenRepository extends JpaRepository<NguoiDungQuyen, Long> {
    List<NguoiDungQuyen> findByNguoiDungId(Long nguoiDungId);

    @Modifying
    @Query("DELETE FROM NguoiDungQuyen nq WHERE nq.nguoiDung.id = :nguoiDungId")
    void deleteByNguoiDungId(Long nguoiDungId);
}
