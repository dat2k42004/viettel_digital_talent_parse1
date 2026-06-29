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
        message.error('Vui lòng chọn ít nhất một quyền hạn!');
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

  // Nhóm các quyền hạn
  const extractModule = (maQuyen: string) => {
    if (!maQuyen) return 'KHÁC';
    if (maQuyen.includes('NGUOI_DUNG')) return 'NGƯỜI DÙNG';
    if (maQuyen.includes('VAI_TRO')) return 'VAI TRÒ';
    if (maQuyen.includes('DON_VI')) return 'ĐƠN VỊ';
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
      title={selectedRole ? 'Cập nhật thông tin vai trò' : 'Tạo mới vai trò chức năng'}
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
            label="Đơn vị áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị áp dụng!' }]}
          >
            <Select placeholder="Chọn đơn vị áp dụng..." showSearch optionFilterProp="children">
              <Select.Option value="he_thong">Hệ thống (Toàn sàn)</Select.Option>
              {danhSachDonVi.map(d => (
                <Select.Option key={d.id} value={d.id}>{d.tenPhapLy}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedRole && (
          <Form.Item
            name="maVaiTro"
            label="Mã vai trò"
          >
            <Input disabled placeholder="Mã vai trò" />
          </Form.Item>
        )}

        <Form.Item
          name="tenVaiTro"
          label="Tên vai trò hiển thị"
          rules={[{ required: true, message: 'Vui lòng nhập tên vai trò hiển thị!' }]}
        >
          <Input placeholder="Ví dụ: Thủ kho tổng" />
        </Form.Item>

        <Form.Item name="moTa" label="Mô tả tóm tắt chức năng">
          <Input.TextArea rows={3} placeholder="Mô tả tóm tắt các quyền năng hoặc vị trí của vai trò này..." />
        </Form.Item>

        <Form.Item label={<Text strong>Ma trận quyền hạn phân bổ</Text>} required>
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
