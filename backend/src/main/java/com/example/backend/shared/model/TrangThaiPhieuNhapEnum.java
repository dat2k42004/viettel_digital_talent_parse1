package com.example.backend.shared.model;

import lombok.Getter;

@Getter
public enum TrangThaiPhieuNhapEnum {
     TAO_MOI("TAO_MOI", "Tạo mới"),
     HOAN_THANH("HOAN_THANH", "Hoàn thành");

     private final String value;
     private final String moTa;

     TrangThaiPhieuNhapEnum(String value, String moTa) {
          this.value = value;
          this.moTa = moTa;
     }

     public static TrangThaiPhieuNhapEnum fromValue(String value) {
          for (TrangThaiPhieuNhapEnum item : TrangThaiPhieuNhapEnum.values()) {
               if (item.value.equalsIgnoreCase(value)) {
                    return item;
               }
          }
          throw new IllegalArgumentException("Trạng thái quy trình phiếu không hợp lệ: " + value);
     }

     public boolean canTransitionTo(TrangThaiPhieuNhapEnum nextStatus) {
          if (nextStatus == null)
               return false;

          switch (this) {
               case TAO_MOI:
                    return nextStatus == HOAN_THANH;
               case HOAN_THANH:
                    return false;
               default:
                    return false;
          }
     }
}
