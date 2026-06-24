package com.example.backend.modules.inventory.model;

import lombok.Getter;

@Getter
public enum TrangThaiPhieuKiemKeEnum {
     TAO_MOI("TAO_MOI", "Tạo mới"),
     DANG_THUC_HIEN("DANG_THUC_HIEN", "Đang thực hiện"),
     DA_GUI("DA_GUI", "Đã gửi"),
     XAC_NHAN("XAC_NHAN", "Xác nhận");

     private final String value;
     private final String moTa;

     TrangThaiPhieuKiemKeEnum(String value, String moTa) {
          this.value = value;
          this.moTa = moTa;
     }

     public static TrangThaiPhieuKiemKeEnum fromValue(String value) {
          for (TrangThaiPhieuKiemKeEnum item : TrangThaiPhieuKiemKeEnum.values()) {
               if (item.value.equalsIgnoreCase(value)) {
                    return item;
               }
          }
          throw new IllegalArgumentException("Trạng thái quy trình phiếu kiểm kê không hợp lệ: " + value);
     }

     public boolean canTransitionTo(TrangThaiPhieuKiemKeEnum nextStatus) {
          if (nextStatus == null)
               return false;

          switch (this) {
               case TAO_MOI:
                    return nextStatus == DANG_THUC_HIEN;
               case DANG_THUC_HIEN:
                    return nextStatus == DA_GUI;
               case DA_GUI:
                    return nextStatus == XAC_NHAN;
               case XAC_NHAN:
                    return false;
               default:
                    return false;
          }
     }
}