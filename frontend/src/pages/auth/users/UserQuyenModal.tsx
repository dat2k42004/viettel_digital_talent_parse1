import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Checkbox, Row, Col, Typography } from 'antd';
import type { NguoiDungResponse } from '../../../api-generated/models/nguoiDungResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { NguoiDungQuyenUpdateRequest } from '../../../api-generated/models/nguoiDungQuyenUpdateRequest';

const { Text } = Typography;

interface UserQuyenModalProps {
  open: boolean;
  onCancel: () => void;
  selectedUser: NguoiDungResponse | null;
  danhSachQuyen: QuyenResponse[];
  onSave: (values: NguoiDungQuyenUpdateRequest) => Promise<void>;
}

export const UserQuyenModal: React.FC<UserQuyenModalProps> = ({
  open,
  onCancel,
  selectedUser,
  danhSachQuyen,
  onSave
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<NguoiDungQuyenUpdateRequest>();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedUser) {
      const existingIds = selectedUser.danhSachQuyen?.map(q => q.id).filter(Boolean) as number[] || [];
      setSelectedPermissionIds(existingIds);
    }
  }, [open, selectedUser]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ danhSachIdQuyen: selectedPermissionIds });
    } finally {
      setLoading(false);
    }
  };

  // Nhóm các quyền hạn
  const extractModule = (maQuyen: string) => {
    if (!maQuyen) return 'KHÁC';
    if (maQuyen.includes('NGUOI_DUNG')) return 'NGƯỜI DÙNG';
    if (maQuyen.includes('VAI_TRO')) return 'VAI TRÒ';
    if (maQuyen.includes('DON_VI')) return t('userQuyenModal.don_vi');
    if (maQuyen.includes('PHONG_BAN')) return 'PHÒNG BAN';
    if (maQuyen.includes('VI_TRI')) return 'VỊ TRÍ';
    if (maQuyen.includes('CAU_HINH')) return 'CẤU HÌNH';
    if (maQuyen.includes('QUYEN')) return 'QUYỀN HẠN';
    return 'KHÁC';
  };

  const groupedPermissions: Record<string, QuyenResponse[]> = {};
  danhSachQuyen.forEach(q => {
    if (q.maQuyen) {
      const group = extractModule(q.maQuyen);
      if (!groupedPermissions[group]) {
        groupedPermissions[group] = [];
      }
      groupedPermissions[group].push(q);
    }
  });

  return (
    <Modal
      title={t('userQuyenModal.cap_quyen_truc_tiep_cho', { tenDangNhap: selectedUser?.tenDangNhap })}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Xác nhận cập nhật
        </Button>
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label={<Text strong>{t('userQuyenModal.ma_tran_quyen_han')}</Text>}>
          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 8, padding: '16px 16px 0 16px' }}>
            {Object.entries(groupedPermissions).map(([groupName, permissions]) => {
              const checkedChildren = permissions.filter(p => selectedPermissionIds.includes(p.id!));
              const isParentChecked = checkedChildren.length > 0;
              const isAllChecked = checkedChildren.length === permissions.length;

              return (
                <div key={groupName} style={{ marginBottom: 20, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                  <div style={{ marginBottom: 10 }}>
                    <Checkbox
                      checked={isParentChecked}
                      indeterminate={isParentChecked && !isAllChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          // Chọn toàn bộ quyền con
                          const toAdd = permissions.map(p => p.id!).filter(id => !selectedPermissionIds.includes(id));
                          setSelectedPermissionIds(prev => [...prev, ...toAdd]);
                        } else {
                          // Bỏ chọn toàn bộ quyền con
                          const toRemove = permissions.map(p => p.id!);
                          setSelectedPermissionIds(prev => prev.filter(id => !toRemove.includes(id)));
                        }
                      }}
                    >
                      <Text strong style={{ color: '#1677ff' }}>
                        Phân hệ {groupName}
                      </Text>
                    </Checkbox>
                  </div>
                  <Row gutter={[16, 12]} style={{ paddingLeft: 24 }}>
                    {permissions.map((p) => (
                      <Col span={12} key={p.id}>
                        <Checkbox
                          checked={selectedPermissionIds.includes(p.id!)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setSelectedPermissionIds(prev => [...prev, p.id!]);
                            } else {
                              setSelectedPermissionIds(prev => prev.filter(id => id !== p.id!));
                            }
                          }}
                        >
                          {p.tenQuyen} ({p.maQuyen})
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            })}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserQuyenModal;
