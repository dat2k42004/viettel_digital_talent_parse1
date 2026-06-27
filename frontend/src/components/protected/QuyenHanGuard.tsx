import React from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../stores/AuthStore';
import type { QuyenHanKey } from '../../stores/AuthStore';

interface QuyenHanGuardProps {
  quyenYeuCau: QuyenHanKey | QuyenHanKey[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// observer lắng nghe thay đổi danhSachQuyenHan trong AuthStore để re-render UI ngay tức khắc
export const QuyenHanGuard: React.FC<QuyenHanGuardProps> = observer(
  ({ quyenYeuCau, children, fallback = null }) => {
    if (!authStore.kiemTraQuyen(quyenYeuCau)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  },
);

export default QuyenHanGuard;
