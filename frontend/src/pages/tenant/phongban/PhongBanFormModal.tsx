import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import type { PhongBanResponse } from '../../../api-generated/models/phongBanResponse';
import type { PhongBanRequest } from '../../../api-generated/models/phongBanRequest';

interface PhongBanFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedPhongBan: PhongBanResponse | null;
  onSave: (values: PhongBanRequest) => Promise<void>;
}

export const PhongBanFormModal: React.FC<PhongBanFormModalProps> = ({
  open,
  onCancel,
  selectedPhongBan,
  onSave,
}) => {
  const [form] = Form.useForm<PhongBanRequest>();

  useEffect(() => {
    if (open) {
      if (selectedPhongBan) {
        form.setFieldsValue({
          maPhongBan: selectedPhongBan.maPhongBan,
          tenPhongBan: selectedPhongBan.tenPhongBan,
          tenVietTat: selectedPhongBan.tenVietTat,
          emailNhom: selectedPhongBan.emailNhom,
          soHotlinePhong: selectedPhongBan.soHotlinePhong,
          moTaChucNang: selectedPhongBan.moTaChucNang,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedPhongBan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as PhongBanRequest);
    } catch (e) {
      // Validation failed
    }
  };

  return (
    <Modal
      title={selectedPhongBan ? 'Cập nhật phòng ban' : 'Thêm mới phòng ban'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận lưu
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {selectedPhongBan && (
          <Form.Item name="maPhongBan" label="Mã phòng ban">
            <Input disabled placeholder="Mã phòng ban tự động" />
          </Form.Item>
        )}

        <Form.Item
          name="tenPhongBan"
          label="Tên phòng ban"
          rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}
        >
          <Input placeholder="Ví dụ: Phòng Phát triển Phần mềm" />
        </Form.Item>

        <Form.Item name="tenVietTat" label="Tên viết tắt">
          <Input placeholder="Ví dụ: PTPM" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="emailNhom" label="Email nhóm">
              <Input type="email" placeholder="dev-team@congty.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soHotlinePhong" label="Số Hotline phòng">
              <Input placeholder="Ví dụ: 024-xxx-xxx" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="moTaChucNang" label="Mô tả chức năng nhiệm vụ">
          <Input.TextArea rows={3} placeholder="Mô tả tóm tắt chức năng phòng ban..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PhongBanFormModal;
