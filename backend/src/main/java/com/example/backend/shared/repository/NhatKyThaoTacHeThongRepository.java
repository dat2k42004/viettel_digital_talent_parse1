package com.example.backend.shared.repository;

import com.example.backend.shared.model.NhatKyThaoTacHeThong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NhatKyThaoTacHeThongRepository 
        extends JpaRepository<NhatKyThaoTacHeThong, Long>, JpaSpecificationExecutor<NhatKyThaoTacHeThong> {
}
