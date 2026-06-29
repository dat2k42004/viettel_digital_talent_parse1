package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.VaiTroQuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VaiTroQuyenRepository extends JpaRepository<VaiTroQuyen, Long> {
    
    @Modifying
    @Query("DELETE FROM VaiTroQuyen vq WHERE vq.vaiTro.id = :vaiTroId")
    void deleteByVaiTroId(@Param("vaiTroId") Long vaiTroId);

    List<VaiTroQuyen> findByVaiTroId(Long vaiTroId);
    List<VaiTroQuyen> findByVaiTroIdIn(List<Long> vaiTroIds);
}
