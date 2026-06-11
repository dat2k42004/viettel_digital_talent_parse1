package com.example.backend.shared.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "thoi_gian_tao", updatable = false)
    private LocalDateTime thoiGianTao;

    @LastModifiedDate
    @Column(name = "thoi_gian_cap_nhat")
    private LocalDateTime thoiGianCapNhat;

    @Column(name = "thoi_gian_xoa")
    private LocalDateTime thoiGianXoa;

    @Column(name = "ly_do_xoa", columnDefinition = "TEXT")
    private String lyDoXoa;
}
