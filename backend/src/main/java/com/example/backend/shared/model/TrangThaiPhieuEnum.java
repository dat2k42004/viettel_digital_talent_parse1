package com.example.backend.shared.model;

import lombok.Getter;

@Getter
public enum TrangThaiPhieuEnum {
    TAO_MOI("TAO_MOI", "Tạo mới"),
    GUI_PHE_DUYET("GUI_PHE_DUYET", "Gửi phê duyệt"),
    DA_PHE_DUYET("DA_PHE_DUYET", "Đã phê duyệt"),
    HOAN_THANH("HOAN_THANH", "Hoàn thành");

    private final String value;
    private final String moTa;

    TrangThaiPhieuEnum(String value, String moTa) {
        this.value = value;
        this.moTa = moTa;
    }

    public static TrangThaiPhieuEnum fromValue(String value) {
        for (TrangThaiPhieuEnum item : TrangThaiPhieuEnum.values()) {
            if (item.value.equalsIgnoreCase(value)) {
                return item;
            }
        }
        throw new IllegalArgumentException("Trạng thái quy trình phiếu không hợp lệ: " + value);
    }

    public boolean canTransitionTo(TrangThaiPhieuEnum nextStatus) {
        if (nextStatus == null)
            return false;

        switch (this) {
            case TAO_MOI:
                return nextStatus == GUI_PHE_DUYET || nextStatus == HOAN_THANH;
            case GUI_PHE_DUYET:
                return nextStatus == DA_PHE_DUYET;
            case DA_PHE_DUYET:
                return nextStatus == HOAN_THANH;
            case HOAN_THANH:
                return false;
            default:
                return false;
        }
    }
}
