package com.example.backend.shared.model;

import lombok.Getter;

@Getter
public enum TrangThaiCoBanEnum {
    HOAT_DONG("HOAT_DONG", "Hoạt động"),
    KHOA("KHOA", "Khóa"),
    CHO_XAC_THUC("CHO_XAC_THUC", "Chờ xác thực");

    private final String value;
    private final String moTa;

    TrangThaiCoBanEnum(String value, String moTa) {
        this.value = value;
        this.moTa = moTa;
    }

    public static TrangThaiCoBanEnum fromValue(String value) {
        for (TrangThaiCoBanEnum item : TrangThaiCoBanEnum.values()) {
            if (item.value.equalsIgnoreCase(value)) {
                return item;
            }
        }
        throw new IllegalArgumentException("Trạng thái cơ bản không hợp lệ: " + value);
    }
}
