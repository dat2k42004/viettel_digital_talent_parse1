package com.example.backend.modules.auth.repository;

import com.example.backend.modules.auth.model.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VaiTroRepository extends JpaRepository<VaiTro, Long> {
    // Nếu idDonVi = null (Hệ thống)
    List<VaiTro> findByIdDonViIsNullAndThoiGianXoaIsNull();
    
    // Nếu idDonVi != null (Đơn vị)
    List<VaiTro> findByIdDonViAndThoiGianXoaIsNull(Long idDonVi);

    Optional<VaiTro> findByIdAndThoiGianXoaIsNull(Long id);

    boolean existsByMaVaiTroAndIdDonViAndThoiGianXoaIsNull(String maVaiTro, Long idDonVi);
    boolean existsByMaVaiTroAndIdDonViIsNullAndThoiGianXoaIsNull(String maVaiTro);
}
