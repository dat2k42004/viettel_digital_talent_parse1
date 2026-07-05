package com.example.backend.shared.config;

import com.example.backend.shared.event.NhatKyThaoTacEvent;
import com.example.backend.shared.service.interfaces.CurrentUserProvider;
import com.example.backend.shared.model.BaseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.event.spi.*;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class HibernateAuditEventListener implements PostInsertEventListener, PostUpdateEventListener, PostDeleteEventListener {

    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    private final CurrentUserProvider currentUserProvider;

    @Override
    public void onPostInsert(PostInsertEvent event) {
        Object entity = event.getEntity();
        if (shouldSkip(entity)) return;

        try {
            Long recordId = event.getId() instanceof Long ? (Long) event.getId() : null;
            String entityName = event.getPersister().getEntityName();
            entityName = entityName.substring(entityName.lastIndexOf('.') + 1);

            String duLieuSau = getJsonState(event.getPersister().getPropertyNames(), event.getState());

            publishEvent("POST", entityName, recordId, null, duLieuSau);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý post-insert audit log: ", e);
        }
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        Object entity = event.getEntity();
        if (shouldSkip(entity)) return;

        try {
            Long recordId = event.getId() instanceof Long ? (Long) event.getId() : null;
            String entityName = event.getPersister().getEntityName();
            entityName = entityName.substring(entityName.lastIndexOf('.') + 1);

            String duLieuTruoc = getJsonState(event.getPersister().getPropertyNames(), event.getOldState());
            String duLieuSau = getJsonState(event.getPersister().getPropertyNames(), event.getState());

            publishEvent("PUT", entityName, recordId, duLieuTruoc, duLieuSau);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý post-update audit log: ", e);
        }
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {
        Object entity = event.getEntity();
        if (shouldSkip(entity)) return;

        try {
            Long recordId = event.getId() instanceof Long ? (Long) event.getId() : null;
            String entityName = event.getPersister().getEntityName();
            entityName = entityName.substring(entityName.lastIndexOf('.') + 1);

            String duLieuTruoc = getJsonState(event.getPersister().getPropertyNames(), event.getDeletedState());

            publishEvent("DELETE", entityName, recordId, duLieuTruoc, null);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý post-delete audit log: ", e);
        }
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return true;
    }

    private boolean shouldSkip(Object entity) {
        String className = entity.getClass().getSimpleName();
        return className.contains("NhatKyThaoTacHeThong") || className.contains("NhatKyDangNhap");
    }

    private String getJsonState(String[] propertyNames, Object[] state) {
        if (state == null || propertyNames == null) {
            return null;
        }
        try {
            Map<String, Object> map = new HashMap<>();
            for (int i = 0; i < propertyNames.length; i++) {
                Object val = state[i];
                map.put(propertyNames[i], simplifyValue(val));
            }
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.warn("Không thể chuyển đổi trạng thái thực thể sang JSON: {}", e.getMessage());
            return "{\"error\":\"Serialization failed\"}";
        }
    }

    private Object simplifyValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BaseEntity baseEntity) {
            Map<String, Object> ref = new HashMap<>();
            ref.put("id", baseEntity.getId());
            ref.put("entityClass", baseEntity.getClass().getSimpleName());
            return ref;
        }
        if (value.getClass().isAnnotationPresent(jakarta.persistence.Entity.class)) {
            return value.toString();
        }
        if (value instanceof java.util.Collection<?>) {
            return "[Collection: size=" + ((java.util.Collection<?>) value).size() + "]";
        }
        if (value instanceof java.util.Map<?, ?>) {
            return "[Map: size=" + ((java.util.Map<?, ?>) value).size() + "]";
        }
        return value;
    }

    private void publishEvent(String defaultMethod, String entityName, Long recordId, String duLieuTruoc, String duLieuSau) {
        HttpServletRequest request = getCurrentRequest();
        String method = defaultMethod;
        String uri = "SYSTEM_PROCESS";
        String ip = "127.0.0.1";

        if (request != null) {
            method = request.getMethod();
            uri = request.getRequestURI();
            ip = getClientIp(request);
        }

        Long userId = getCurrentUserId();

        NhatKyThaoTacEvent auditEvent = NhatKyThaoTacEvent.builder()
                .idTaiKhoanThaoTac(userId)
                .phuongThucApi(method)
                .endpointApi(uri)
                .thucTheTacDong(entityName)
                .idBanGhi(recordId)
                .duLieuTruoc(duLieuTruoc)
                .duLieuSau(duLieuSau)
                .diaChiIp(ip)
                .thoiGianThaoTac(LocalDateTime.now())
                .build();

        eventPublisher.publishEvent(auditEvent);
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private Long getCurrentUserId() {
        return currentUserProvider.getCurrentUserId();
    }
}
