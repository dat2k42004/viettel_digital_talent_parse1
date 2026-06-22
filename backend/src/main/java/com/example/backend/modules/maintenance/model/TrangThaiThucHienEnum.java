package com.example.backend.modules.maintenance.model;

import lombok.Getter;

@Getter
public enum TrangThaiThucHienEnum {
     CHUA_GUI_DI("CHUA_GUI_DI", "Chưa gửi đi"),
     DA_GUI_DI("DA_GUI_DI", "Đã gửi đi"),
     DA_THU_LAI("DA_THU_LAI", "Đã thu lại");

     private final String value;
     private final String moTa;

     TrangThaiThucHienEnum(String value, String moTa) {
          this.value = value;
          this.moTa = moTa;
     }

     public static TrangThaiThucHienEnum fromValue(String value) {
          for (TrangThaiThucHienEnum item : TrangThaiThucHienEnum.values()) {
               if (item.value.equalsIgnoreCase(value)) {
                    return item;
               }
          }
          throw new IllegalArgumentException("Trạng thái thực hiện chi tiết không hợp lệ: " + value);
     }

     public boolean canTransitionTo(TrangThaiThucHienEnum nextStatus) {
          if (nextStatus == null)
               return false;

          switch (this) {
               case CHUA_GUI_DI:
                    return nextStatus == DA_GUI_DI || nextStatus == DA_THU_LAI;
               case DA_GUI_DI:
                    return nextStatus == DA_THU_LAI;
               case DA_THU_LAI:
                    return false;
               default:
                    return false;
          }
     }
}
