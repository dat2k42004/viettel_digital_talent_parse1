package com.example.backend.modules.maintenance.model;

import lombok.Getter;

@Getter
public enum TrangThaiPhieuSuaChuaBaoTriEnum {
     TAO_MOI("TAO_MOI", "Tạo mới"),
     GUI_PHE_DUYET("GUI_PHE_DUYET", "Gửi phê duyệt"),
     DA_PHE_DUYET("DA_PHE_DUYET", "Đã phê duyệt"),
     DANG_THUC_HIEN("DANG_THUC_HIEN", "Đang thực hiện"),
     HOAN_THANH("HOAN_THANH", "Hoàn thành");

     private final String value;
     private final String moTa;

     TrangThaiPhieuSuaChuaBaoTriEnum(String value, String moTa) {
          this.value = value;
          this.moTa = moTa;
     }

     public static TrangThaiPhieuSuaChuaBaoTriEnum fromValue(String value) {
          for (TrangThaiPhieuSuaChuaBaoTriEnum item : TrangThaiPhieuSuaChuaBaoTriEnum.values()) {
               if (item.value.equalsIgnoreCase(value)) {
                    return item;
               }
          }
          throw new IllegalArgumentException("Trạng thái phiếu sửa chữa bảo trì không hợp lệ: " + value);
     }

     public boolean canTransitionTo(TrangThaiPhieuSuaChuaBaoTriEnum nextStatus) {
          if (nextStatus == null)
               return false;

          switch (this) {
               case TAO_MOI:
                    return nextStatus == GUI_PHE_DUYET;
               case GUI_PHE_DUYET:
                    return nextStatus == DA_PHE_DUYET;
               case DA_PHE_DUYET:
                    return nextStatus == DANG_THUC_HIEN || nextStatus == HOAN_THANH;
               case DANG_THUC_HIEN:
                    return nextStatus == HOAN_THANH;
               case HOAN_THANH:
                    return false;
               default:
                    return false;
          }
     }
}
