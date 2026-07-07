package com.example.backend.shared.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.backend.shared.tenant.DonViContextHolder;

public class SecurityUtils {
    public static boolean laSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        boolean hasAuthority = authentication.getAuthorities().stream()
                .anyMatch(a -> "XEM_QUAN_TRI_TOAN_SAN".equalsIgnoreCase(a.getAuthority()));
        return hasAuthority && DonViContextHolder.getTenantId() == null;
    }
}
