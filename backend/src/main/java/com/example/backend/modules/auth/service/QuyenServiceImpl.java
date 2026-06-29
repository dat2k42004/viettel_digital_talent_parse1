package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.QuyenService;
import com.example.backend.shared.model.TrangThaiCoBanEnum;
import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class QuyenServiceImpl implements QuyenService {

    private final QuyenRepository quyenRepository;

    @Override
    public List<QuyenResponse> layDanhSachQuyen() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return java.util.Collections.emptyList();
        }

        boolean laSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));

        List<Quyen> allQuyens = quyenRepository.findByThoiGianXoaIsNull();

        if (laSuperAdmin) {
            return allQuyens.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            Long userId = null;
            if (authentication.getPrincipal() instanceof com.example.backend.modules.auth.security.NguoiDungUserDetails userDetails) {
                userId = userDetails.getNguoiDung().getId();
            }

            java.util.Set<String> userAuthorities;
            if (userId != null) {
                userAuthorities = quyenRepository.findAllByNguoiDungId(userId).stream()
                        .map(Quyen::getMaQuyen)
                        .collect(Collectors.toSet());
            } else {
                userAuthorities = java.util.Collections.emptySet();
            }

            return allQuyens.stream()
                    .filter(q -> userAuthorities.contains(q.getMaQuyen()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public Map<String, List<QuyenResponse>> layDanhSachQuyenPhanNhom() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return java.util.Collections.emptyMap();
        }

        boolean laSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));

        List<Quyen> activePermissions = quyenRepository.findByThoiGianXoaIsNull().stream()
                .filter(q -> q.getTrangThai() == TrangThaiCoBanEnum.HOAT_DONG)
                .collect(Collectors.toList());

        if (laSuperAdmin) {
            return activePermissions.stream()
                    .collect(Collectors.groupingBy(
                            q -> extractModule(q.getMaQuyen()),
                            Collectors.mapping(this::mapToResponse, Collectors.toList())
                    ));
        } else {
            Long userId = null;
            if (authentication.getPrincipal() instanceof com.example.backend.modules.auth.security.NguoiDungUserDetails userDetails) {
                userId = userDetails.getNguoiDung().getId();
            }

            java.util.Set<String> userAuthorities;
            if (userId != null) {
                userAuthorities = quyenRepository.findAllByNguoiDungId(userId).stream()
                        .map(Quyen::getMaQuyen)
                        .collect(Collectors.toSet());
            } else {
                userAuthorities = java.util.Collections.emptySet();
            }

            return activePermissions.stream()
                    .filter(q -> userAuthorities.contains(q.getMaQuyen()))
                    .collect(Collectors.groupingBy(
                            q -> extractModule(q.getMaQuyen()),
                            Collectors.mapping(this::mapToResponse, Collectors.toList())
                    ));
        }
    }

    private String extractModule(String maQuyen) {
        if (maQuyen == null) return "OTHERS";
        if (maQuyen.contains("NGUOI_DUNG")) return "NGUOI_DUNG";
        if (maQuyen.contains("VAI_TRO")) return "VAI_TRO";
        if (maQuyen.contains("DON_VI")) return "DON_VI";
        if (maQuyen.contains("PHONG_BAN")) return "PHONG_BAN";
        if (maQuyen.contains("VI_TRI")) return "VI_TRI";
        if (maQuyen.contains("CAU_HINH")) return "CAU_HINH";
        if (maQuyen.contains("QUYEN")) return "QUYEN";
        return "OTHERS";
    }

    private QuyenResponse mapToResponse(Quyen quyen) {
        return QuyenResponse.builder()
                .id(quyen.getId())
                .maQuyen(quyen.getMaQuyen())
                .tenQuyen(quyen.getTenQuyen())
                .build();
    }
}
