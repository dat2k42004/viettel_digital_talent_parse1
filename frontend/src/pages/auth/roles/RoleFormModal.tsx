import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import type { VaiTroResponse } from '../../../api-generated/models/vaiTroResponse';
import type { VaiTroRequest } from '../../../api-generated/models/vaiTroRequest';

interface RoleFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRole: VaiTroResponse | null;
  onSave: (values: VaiTroRequest) => Promise<void>;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  open,
  onCancel,
  selectedRole,
  onSave
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        form.setFieldsValue({
          maVaiTro: selectedRole.maVaiTro,
          tenVaiTro: selectedRole.tenVaiTro,
          moTa: selectedRole.moTa,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedRole, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as VaiTroRequest);
    } catch (e) {
      // Báo lỗi validation
    }
  };

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
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="maVaiTro"
          label="Mã vai trò (STATIC KEY)"
          rules={[{ required: true, message: 'Vui lòng nhập mã định danh vai trò!' }]}
        >
          <Input disabled={!!selectedRole} placeholder="Ví dụ: ADMIN_KHO" />
        </Form.Item>

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
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
