package com.example.backend.modules.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackfillResult {
    private int totalDispatched;
    private Map<String, Integer> detailsByType;
    private String message;
    private LocalDateTime triggeredAt;
}
