package com.example.backend.shared.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private PageInfo page_info;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageInfo {
        private int current_page;
        private int page_size;
        private long total_elements;
        private int total_pages;
        private boolean is_first;
        private boolean is_last;
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page_info(PageInfo.builder()
                        .current_page(page.getNumber())
                        .page_size(page.getSize())
                        .total_elements(page.getTotalElements())
                        .total_pages(page.getTotalPages())
                        .is_first(page.isFirst())
                        .is_last(page.isLast())
                        .build())
                .build();
    }
}
