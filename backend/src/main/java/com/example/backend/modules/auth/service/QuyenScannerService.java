package com.example.backend.modules.auth.service;

import com.example.backend.modules.auth.model.Quyen;
import com.example.backend.modules.auth.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuyenScannerService {

    private final ApplicationContext applicationContext;
    private final QuyenRepository quyenRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void scanAndSavePermissions() {
        log.info("Bắt đầu quét và đồng bộ Quyền từ mã nguồn...");
        Set<String> authorityNames = new HashSet<>();

        // Quét tất cả các Bean được đánh dấu @RestController
        String[] beanNames = applicationContext.getBeanNamesForAnnotation(RestController.class);

        for (String beanName : beanNames) {
            Class<?> beanType = applicationContext.getType(beanName);
            if (beanType != null) {
                // Quét @PreAuthorize ở cấp độ Class
                extractAuthorities(beanType.getAnnotation(PreAuthorize.class), authorityNames);

                // Quét @PreAuthorize ở cấp độ Method
                for (Method method : beanType.getDeclaredMethods()) {
                    extractAuthorities(method.getAnnotation(PreAuthorize.class), authorityNames);
                }
            }
        }

        int newPermissionsAdded = 0;
        for (String maQuyen : authorityNames) {
            if (!quyenRepository.existsByMaQuyen(maQuyen)) {
                Quyen quyen = new Quyen();
                quyen.setMaQuyen(maQuyen);
                quyen.setTenQuyen(generateTenQuyen(maQuyen));
                quyen.setLoaiQuyen("HE_THONG");
                quyenRepository.save(quyen);
                newPermissionsAdded++;
                log.info("Đã chèn thêm Quyền mới vào DB: {}", maQuyen);
            }
        }

        log.info("Quét Quyền hoàn tất. Thêm mới: {} quyền.", newPermissionsAdded);
    }

    private void extractAuthorities(PreAuthorize preAuthorize, Set<String> authorityNames) {
        if (preAuthorize != null) {
            String expression = preAuthorize.value();
            // Regex tìm chuỗi trong ngoặc đơn của hasAuthority, ví dụ:
            // hasAuthority('XEM_QUYEN')
            Pattern pattern = Pattern.compile("hasAuthority\\(\\s*'([^']+)'\\s*\\)");
            Matcher matcher = pattern.matcher(expression);
            while (matcher.find()) {
                authorityNames.add(matcher.group(1));
            }
        }
    }

    private String generateTenQuyen(String maQuyen) {
        String lower = maQuyen.toLowerCase().replace("_", " ");
        if (lower.isEmpty())
            return maQuyen;
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}