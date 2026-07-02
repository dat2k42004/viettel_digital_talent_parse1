package com.example.backend.shared.repository;

import com.example.backend.shared.model.NhatKyThaoTacHeThong;

import io.lettuce.core.dynamic.annotation.Param;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NhatKyThaoTacHeThongRepository
                extends JpaRepository<NhatKyThaoTacHeThong, Long>, JpaSpecificationExecutor<NhatKyThaoTacHeThong> {

        @Modifying
        @Query("DELETE FROM NhatKyThaoTacHeThong n WHERE n.thoiGianThaoTac < :thoiGianGioiHan")
        int deleteOldLogs(@Param("thoiGianGioiHan") LocalDateTime thoiGianGioiHan);
}
