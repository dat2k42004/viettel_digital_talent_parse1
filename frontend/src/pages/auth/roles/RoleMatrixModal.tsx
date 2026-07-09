import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Collapse, Checkbox, Row, Col, Tooltip, Typography } from 'antd';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { VaiTroQuyenUpdateRequest } from '../../../api-generated/models/vaiTroQuyenUpdateRequest';

const { Text, Paragraph } = Typography;

interface RoleMatrixModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRole: VaiTroResponse | null;
  maTranQuyen: Record<string, QuyenResponse[]>;
  onSave: (values: VaiTroQuyenUpdateRequest) => Promise<void>;
}

export const RoleMatrixModal: React.FC<RoleMatrixModalProps> = ({
  open,
  onCancel,
  selectedRole,
  maTranQuyen,
  onSave
}) => {
  const { t } = useTranslation();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedRole) {
      const existingIds = selectedRole.danhSachQuyen?.map(q => q.id).filter(Boolean) as number[] || [];
      setSelectedPermissionIds(existingIds);
    }
  }, [open, selectedRole]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ danhSachIdQuyen: selectedPermissionIds });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('roleMatrixModal.thiet_lap_ma_tran_quyen', { tenVaiTro: selectedRole?.tenVaiTro })}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={t('roleMatrixModal.luu_cau_hinh')}
      cancelText={t('appLayout.cancel')}
      width={700}
    >
      <Paragraph type="secondary" style={{ marginTop: 12 }}>
        Lựa chọn phân chia quyền năng hệ thống theo nhóm chức năng. Tích chọn để trao quyền và bỏ tích để thu hồi quyền ngay lập tức.
      </Paragraph>

      <Collapse defaultActiveKey={Object.keys(maTranQuyen)} style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}>
        {Object.entries(maTranQuyen).map(([tenNhom, danhSachQuyenCon]) => {
          const checkedChildren = danhSachQuyenCon.filter(p => selectedPermissionIds.includes(p.id!));
          const isParentChecked = checkedChildren.length > 0;
          const isAllChecked = checkedChildren.length === danhSachQuyenCon.length;

          return (
            <Collapse.Panel
              header={
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'inline-block' }}>
                  <Checkbox
                    checked={isParentChecked}
                    indeterminate={isParentChecked && !isAllChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        // Chọn toàn bộ quyền con
                        const toAdd = danhSachQuyenCon.map(p => p.id!).filter(id => !selectedPermissionIds.includes(id));
                        setSelectedPermissionIds(prev => [...prev, ...toAdd]);
                      } else {
                        // Bỏ chọn toàn bộ quyền con
                        const toRemove = danhSachQuyenCon.map(p => p.id!);
                        setSelectedPermissionIds(prev => prev.filter(id => !toRemove.includes(id)));
                      }
                    }}
                  >
                    <Text strong style={{ textTransform: 'uppercase', color: '#1677ff' }}>
                      Phân hệ {tenNhom}
                    </Text>
                  </Checkbox>
                </div>
              }
              key={tenNhom}
            >
              <Row gutter={[16, 12]}>
                {danhSachQuyenCon.map((quyen: QuyenResponse) => {
                  if (!quyen.id) return null;
                  return (
                    <Col span={12} key={quyen.id}>
                      <Checkbox
                        checked={selectedPermissionIds.includes(quyen.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            setSelectedPermissionIds(prev => [...prev, quyen.id!]);
                          } else {
                            setSelectedPermissionIds(prev => prev.filter(id => id !== quyen.id!));
                          }
                        }}
                      >
                        <Tooltip title={quyen.maQuyen}>
                          <span>{quyen.tenQuyen || quyen.maQuyen}</span>
                        </Tooltip>
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </Modal>
  );
};

export default RoleMatrixModal;
