package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.service.interfaces.QuyenService;

import com.example.backend.modules.auth.dto.QuyenResponse;
import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuyenServiceImpl implements QuyenService {
    
    private final QuyenRepository quyenRepository;

    public List<QuyenResponse> layDanhSachQuyen() {
        return quyenRepository.findAll().stream()
                .filter(q -> q.getThoiGianXoa() == null) // B? qua quyẤn đã xóa
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QuyenResponse mapToResponse(Quyen quyen) {
        return QuyenResponse.builder()
                .id(quyen.getId())
                .maQuyen(quyen.getMaQuyen())
                .tenQuyen(quyen.getTenQuyen())
                .build();
    }
}

