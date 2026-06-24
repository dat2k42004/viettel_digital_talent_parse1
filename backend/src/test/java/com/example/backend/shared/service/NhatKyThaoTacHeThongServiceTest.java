package com.example.backend.shared.service;

import com.example.backend.shared.dto.NhatKyThaoTacHeThongResponse;
import com.example.backend.shared.model.NhatKyThaoTacHeThong;
import com.example.backend.shared.repository.NhatKyThaoTacHeThongRepository;
import com.example.backend.shared.response.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NhatKyThaoTacHeThongServiceTest {

    @Mock
    private NhatKyThaoTacHeThongRepository repository;

    @InjectMocks
    private NhatKyThaoTacHeThongServiceImpl service;

    private NhatKyThaoTacHeThong sampleLog;

    @BeforeEach
    void setUp() {
        sampleLog = NhatKyThaoTacHeThong.builder()
                .id(1L)
                .idTaiKhoanThaoTac(100L)
                .phuongThucApi("POST")
                .endpointApi("/api/v1/assets")
                .thucTheTacDong("Asset")
                .idBanGhi(50L)
                .duLieuTruoc(null)
                .duLieuSau("{\"name\":\"Asset A\"}")
                .diaChiIp("127.0.0.1")
                .thoiGianThaoTac(LocalDateTime.now())
                .build();
    }

    @Test
    void testLayDanhSach_Success() {
        // Arrange
        List<NhatKyThaoTacHeThong> logs = Collections.singletonList(sampleLog);
        Page<NhatKyThaoTacHeThong> page = new PageImpl<>(logs, PageRequest.of(0, 10), 1);
        
        when(repository.findAll(any(Specification.class), any(PageRequest.of(0, 10).getClass())))
                .thenReturn(page);

        // Act
        PageResponse<NhatKyThaoTacHeThongResponse> response = service.layDanhSach(
                100L, "POST", "Asset", null, null, 0, 10);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        
        NhatKyThaoTacHeThongResponse responseDto = response.getContent().getFirst();
        assertEquals(sampleLog.getId(), responseDto.getId());
        assertEquals(sampleLog.getIdTaiKhoanThaoTac(), responseDto.getIdTaiKhoanThaoTac());
        assertEquals(sampleLog.getPhuongThucApi(), responseDto.getPhuongThucApi());
        assertEquals(sampleLog.getEndpointApi(), responseDto.getEndpointApi());
        assertEquals(sampleLog.getThucTheTacDong(), responseDto.getThucTheTacDong());
        assertEquals(sampleLog.getIdBanGhi(), responseDto.getIdBanGhi());
        assertEquals(sampleLog.getDuLieuTruoc(), responseDto.getDuLieuTruoc());
        assertEquals(sampleLog.getDuLieuSau(), responseDto.getDuLieuSau());
        assertEquals(sampleLog.getDiaChiIp(), responseDto.getDiaChiIp());

        verify(repository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
    }
}
