import React, { useEffect } from 'react';
import { Modal, Form, Select, Button } from 'antd';
import type { NguoiDungResponse } from '../../../api-generated/models/nguoiDungResponse';
import type { QuyenResponse } from '../../../api-generated/models/quyenResponse';
import type { NguoiDungQuyenUpdateRequest } from '../../../api-generated/models/nguoiDungQuyenUpdateRequest';

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
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && selectedUser) {
      form.setFieldsValue({
        danhSachIdQuyen: selectedUser.danhSachQuyen?.map(q => q.id).filter(Boolean) || [],
      });
    }
  }, [open, selectedUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as NguoiDungQuyenUpdateRequest);
    } catch (e) {
      // Báo lỗi validation
    }
  };

  return (
    <Modal
      title={`Cấp quyền trực tiếp cho tài khoản: ${selectedUser?.tenDangNhap}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận cập nhật
        </Button>
      ]}
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="danhSachIdQuyen"
          label="Lựa chọn các quyền trực tiếp (Override Role Permissions)"
        >
          <Select
            mode="multiple"
            placeholder="Tìm kiếm và chọn quyền cần gán trực tiếp..."
            style={{ width: '100%' }}
            options={danhSachQuyen.map(q => ({
              value: q.id,
              label: `${q.maQuyen} - ${q.tenQuyen || 'Không có tên mô tả'}`
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserQuyenModal;
