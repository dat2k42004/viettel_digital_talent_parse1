package com.example.backend.shared.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class DonViInterceptor implements HandlerInterceptor {
    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // LƯU Ý: Do dự án áp dụng PHÂN QUYỀN ĐỘNG (Dynamic RBAC), ta không check Role cứng (như "SUPER_ADMIN").
        // Thay vào đó, ta dựa vào việc User có cờ "Global Access" hay không (sau này trích xuất từ JWT).
        
        String isGlobal = request.getHeader("X-Is-Global"); 
        if ("true".equalsIgnoreCase(isGlobal)) {
            // Người dùng có quyền truy cập toàn cục (quản trị hệ thống) thì Tenant là null
            DonViContextHolder.setTenantId(null);
            return true;
        }

        // Đối với user thuộc đơn vị, lấy Tenant ID từ header (sau này sẽ lấy từ JWT payload để bảo mật)
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId != null && !tenantId.isEmpty()) {
            try {
                DonViContextHolder.setTenantId(Long.parseLong(tenantId));
            } catch (NumberFormatException e) {
                // Bỏ qua hoặc bắn lỗi tùy logic hệ thống
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Dọn dẹp để tránh memory leak và lỗi tenant chéo giữa các thread
        DonViContextHolder.clear();
    }
}
