import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';

const { Title } = Typography;

interface DonViCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: DangKyDonViRequest) => Promise<void>;
  loading: boolean;
}

export const DonViCreateModal: React.FC<DonViCreateModalProps> = ({
  open,
  onCancel,
  onSave,
  loading,
}) => {
  const [form] = Form.useForm<DangKyDonViRequest>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as DangKyDonViRequest);
    } catch (e) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title="Thêm mới Đơn vị (SaaS Tenant)"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Xác nhận tạo
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
          1. Thông tin pháp lý đơn vị
        </Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenPhapLy"
              label="Tên pháp lý Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập tên pháp lý!' }]}
            >
              <Input prefix={<BankOutlined />} placeholder="Ví dụ: Công ty Cổ phần A" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenMienHeThong"
              label="Tên miền hệ thống (Domain)"
              rules={[{ required: true, message: 'Vui lòng nhập tên miền!' }]}
            >
              <Input placeholder="Ví dụ: congtya.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maSoThue"
              label="Mã số thuế"
            >
              <Input placeholder="Nhập mã số thuế" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenNguoiDaiDien"
              label="Họ tên người đại diện pháp luật"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên người đại diện!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          2. Khởi tạo tài khoản Quản trị Đơn vị (Admin)
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenAdmin"
              label="Họ tên Admin"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên Admin!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn Quản Trị" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="emailAdmin"
              label="Email nhận mã OTP kích hoạt"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="admin@congtya.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenDangNhapAdmin"
              label="Tên đăng nhập Admin"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="matKhauAdmin"
              label="Mật khẩu tài khoản Admin"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải chứa ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DonViCreateModal;
