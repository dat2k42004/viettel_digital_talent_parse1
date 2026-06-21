package com.example.backend.shared.model;

import lombok.Getter;

@Getter
public enum TrangThaiVanHanhEnum {
    KHOA("KHOA", "Khóa"),
    HOAT_DONG("HOAT_DONG", "Hoạt động - Trống, sẵn sàng cấp phát"),
    CAP_PHAT("CAP_PHAT", "Đang cấp phát");

    private final String value;
    private final String moTa;

    TrangThaiVanHanhEnum(String value, String moTa) {
        this.value = value;
        this.moTa = moTa;
    }

    public static TrangThaiVanHanhEnum fromValue(String value) {
        for (TrangThaiVanHanhEnum item : TrangThaiVanHanhEnum.values()) {
            if (item.value.equalsIgnoreCase(value)) {
                return item;
            }
        }
        throw new IllegalArgumentException("Trạng thái vận hành không hợp lệ: " + value);
    }
}
