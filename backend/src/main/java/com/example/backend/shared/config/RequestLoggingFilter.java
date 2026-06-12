package com.example.backend.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;
import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            String method = requestWrapper.getMethod();
            String url = requestWrapper.getRequestURI();
            String queryString = requestWrapper.getQueryString();
            if (queryString != null) {
                url += "?" + queryString;
            }
            
            String payload = getPayload(requestWrapper);
            int status = responseWrapper.getStatus();

            log.info("HTTP Request: Method=[{}], URL=[{}], Payload=[{}], Status=[{}], Duration=[{}ms]",
                    method, url, payload, status, duration);

            responseWrapper.copyBodyToResponse();
        }
    }

    private String getPayload(ContentCachingRequestWrapper wrapper) {
        byte[] buf = wrapper.getContentAsByteArray();
        if (buf.length > 0) {
            try {
                String payload = new String(buf, 0, buf.length, wrapper.getCharacterEncoding());
                return payload.replaceAll("\\s+", " ");
            } catch (Exception e) {
                return "[Lỗi đọc payload]";
            }
        }
        return "[Trống]";
    }
}
