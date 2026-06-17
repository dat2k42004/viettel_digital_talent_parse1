package com.example.backend.modules.asset.repository;

import com.example.backend.modules.asset.model.LuaChonGoiY;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LuaChonGoiYRepository extends JpaRepository<LuaChonGoiY, Long> {
    Optional<LuaChonGoiY> findByIdAndThoiGianXoaIsNull(Long id);
    List<LuaChonGoiY> findByDanhMucThuocTinhIdAndThoiGianXoaIsNullOrderByThuTuHienThiAsc(Long thuocTinhId);
    boolean existsByDanhMucThuocTinhIdAndGiaTriAndThoiGianXoaIsNull(Long thuocTinhId, String giaTri);
}
