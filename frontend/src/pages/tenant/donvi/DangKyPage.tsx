import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { dangKyDonVi } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';

const { Title, Text } = Typography;

export const DangKyPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<DangKyDonViRequest>();
  const [loading, setLoading] = useState(false);

  const handleDangKy = async (values: DangKyDonViRequest) => {
    setLoading(true);
    try {
      const payload: DangKyDonViRequest = {
        tenPhapLy: values.tenPhapLy,
        tenMienHeThong: values.tenMienHeThong,
        maSoThue: values.maSoThue,
        tenNguoiDaiDien: values.tenNguoiDaiDien,
        tenDangNhapAdmin: values.tenDangNhapAdmin,
        matKhauAdmin: values.matKhauAdmin,
        tenAdmin: values.tenAdmin,
        emailAdmin: values.emailAdmin,
      };

      const res = await dangKyDonVi(payload);
      if (res.code === 200) {
        message.success(res.message || 'Đăng ký thông tin đơn vị thành công! Chuyển tới màn hình xác thực OTP.');
        navigate('/xac-thuc-otp', { state: { email: values.emailAdmin } });
      } else {
        message.error(res.message || 'Đăng ký đơn vị thất bại!');
      }
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        padding: '40px 20px',
      }}
    >
      <Card
        style={{
          width: 600,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Đăng ký Đơn vị
          </Title>
          <Text type="secondary">Cung cấp thông tin để khởi tạo đơn vị mới trên hệ thống ITAM</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleDangKy}
        >
          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
            1. Thông tin Đơn vị
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
                <Input placeholder="Mã số thuế doanh nghiệp" />
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

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 12, marginBottom: 16 }}>
            2. Thông tin Tài khoản Admin Đơn vị
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
                label="Email nhận OTP"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
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
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login">Quay lại đăng nhập</Link>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Tiếp tục đăng ký
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DangKyPage;
