import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Checkbox, Row, Col, Typography, message, Select } from 'antd';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import { authStore } from '../../../stores/AuthStore';
import type { DonViResponse } from '../../../api-generated/models/donViResponse';

const { Text } = Typography;

interface RoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRole: VaiTroResponse | null;
  danhSachQuyen: QuyenResponse[];
  danhSachDonVi: DonViResponse[];
  onSave: (values: any) => Promise<void>;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  open,
  onCancel,
  selectedRole,
  danhSachQuyen,
  danhSachDonVi,
  onSave
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<any>();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        form.setFieldsValue({
          maVaiTro: selectedRole.maVaiTro,
          tenVaiTro: selectedRole.tenVaiTro,
          moTa: selectedRole.moTa,
          idDonVi: selectedRole.idDonVi || 'he_thong',
        });
        const existingIds = selectedRole.danhSachQuyen?.map(q => q.id).filter(Boolean) as number[] || [];
        setSelectedPermissionIds(existingIds);
      } else {
        form.resetFields();
        form.setFieldsValue({
          idDonVi: 'he_thong'
        });
        setSelectedPermissionIds([]);
      }
    }
  }, [open, selectedRole, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedPermissionIds.length === 0) {
        message.error(t('roleFormModal.vui_long_chon_it'));
        return;
      }
      await onSave({
        ...values,
        idDonVi: values.idDonVi === 'he_thong' ? null : values.idDonVi,
        danhSachIdQuyen: selectedPermissionIds
      });
    } catch (e) {
      // Báo lỗi validation
    }
  };

  // Nhóm các quyền hạn động dựa trên loaiQuyen và idQuyenCha
  const parentMap = new Map<number, string>();
  danhSachQuyen.forEach(q => {
    if (q.id && q.loaiQuyen === 'NHOM_QUYEN') {
      parentMap.set(q.id, q.tenQuyen || q.maQuyen || '');
    }
  });

  const groupedPermissions: Record<string, QuyenResponse[]> = {};
  danhSachQuyen.forEach(q => {
    if (q.id && q.loaiQuyen === 'THAO_TAC') {
      let groupName = 'Quyền dành cho Super Admin';
      if (q.idQuyenCha !== null && q.idQuyenCha !== undefined) {
        groupName = parentMap.get(q.idQuyenCha) || 'KHÁC';
      }
      if (!groupedPermissions[groupName]) {
        groupedPermissions[groupName] = [];
      }
      groupedPermissions[groupName].push(q);
    }
  });

  return (
    <Modal
      title={selectedRole ? t('roleFormModal.cap_nhat_thong_tin') : t('roleFormModal.tao_moi_vai_tro')}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận lưu
        </Button>
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {authStore.laSuperAdmin && (
          <Form.Item
            name="idDonVi"
            label={t('roleManagementPage.don_vi_ap_dung')}
            rules={[{ required: true, message: t('roleFormModal.vui_long_chon_don') }]}
          >
            <Select placeholder={t('roleFormModal.chon_don_vi_ap')} showSearch optionFilterProp="children">
              <Select.Option value="he_thong">{t('roleManagementPage.he_thong_toan_san')}</Select.Option>
              {danhSachDonVi.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.tenPhapLy}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedRole && (
          <Form.Item
            name="maVaiTro"
            label={t('roleFormModal.ma_vai_tro')}
          >
            <Input disabled placeholder={t('roleFormModal.ma_vai_tro')} />
          </Form.Item>
        )}

        <Form.Item
          name="tenVaiTro"
          label={t('roleManagementPage.ten_vai_tro_hien')}
          rules={[{ required: true, message: t('roleFormModal.vui_long_nhap_ten') }]}
        >
          <Input placeholder={t('roleFormModal.vi_du_thu_kho')} />
        </Form.Item>

        <Form.Item name="moTa" label={t('roleFormModal.mo_ta_tom_tat_chuc_nang')}>
          <Input.TextArea rows={3} placeholder={t('roleFormModal.mo_ta_tom_tat')} />
        </Form.Item>

        <Form.Item label={<Text strong>{t('roleFormModal.ma_tran_quyen_han')}</Text>} required>
          <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 8, padding: '16px 16px 0 16px' }}>
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

export default RoleFormModal;
