import React, { useState } from 'react';
import { Card, Form, Input, Button, Steps, Result, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { dangKyDonVi, xacThucOtp } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';
import type { XacThucOtpRequest } from '../../../api-generated/models/xacThucOtpRequest';

const { Title, Paragraph, Text } = Typography;

export const DangKyDonViPage: React.FC = () => {
  const navigate = useNavigate();
  const [formDangKy] = Form.useForm<DangKyDonViRequest>();
  const [formOtp] = Form.useForm<XacThucOtpRequest>();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
        message.success(res.message || 'Gửi yêu cầu đăng ký đơn vị thành công! Vui lòng kiểm tra mã OTP trong hộp thư email.');
        setRegisteredEmail(values.emailAdmin);
        setCurrentStep(1);
      } else {
        message.error(res.message || 'Đăng ký đơn vị thất bại!');
      }
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  const handleXacThucOtp = async (values: XacThucOtpRequest) => {
    setLoading(true);
    try {
      const res = await xacThucOtp({
        email: registeredEmail,
        otp: values.otp || '',
      });
      if (res.code === 200) {
        message.success(res.message || 'Xác thực OTP và kích hoạt đơn vị thành công!');
        setCurrentStep(2);
      } else {
        message.error(res.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
      }
    } catch (error: any) {
      message.error(error?.message || 'Xác thực OTP thất bại!');
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
          width: currentStep === 0 ? 650 : 500,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={3} style={{ margin: 0 }}>
            Đăng ký Đơn vị SaaS mới
          </Title>
          <Text type="secondary">Tham gia hệ thống quản lý tài sản CNTT đa doanh nghiệp</Text>
        </div>

        <Steps
          current={currentStep}
          style={{ marginBottom: 30 }}
          items={[
            { title: 'Đăng ký thông tin' },
            { title: 'Xác thực OTP' },
            { title: 'Hoàn tất' },
          ]}
        />

        {currentStep === 0 && (
          <Form
            form={formDangKy}
            layout="vertical"
            onFinish={handleDangKy}
          >
            <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
              1. Thông tin Đơn vị
            </Title>
            
            <Form.Item
              name="tenPhapLy"
              label="Tên pháp lý Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập tên pháp lý!' }]}
            >
              <Input prefix={<BankOutlined />} placeholder="Ví dụ: Công ty Cổ phần A" />
            </Form.Item>

            <Form.Item
              name="tenMienHeThong"
              label="Tên miền hệ thống (Domain)"
              rules={[{ required: true, message: 'Vui lòng nhập tên miền hệ thống!' }]}
            >
              <Input placeholder="Ví dụ: congtya.com" />
            </Form.Item>

            <Form.Item
              name="maSoThue"
              label="Mã số thuế"
            >
              <Input placeholder="Nhập mã số thuế doanh nghiệp (nếu có)" />
            </Form.Item>

            <Form.Item
              name="tenNguoiDaiDien"
              label="Họ tên người đại diện pháp luật"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên người đại diện!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 24, marginBottom: 16 }}>
              2. Thông tin Tài khoản Admin Đơn vị
            </Title>

            <Form.Item
              name="tenAdmin"
              label="Họ tên Admin"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên Admin!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn Quản Trị" />
            </Form.Item>

            <Form.Item
              name="emailAdmin"
              label="Email nhận OTP kích hoạt"
              rules={[
                { required: true, message: 'Vui lòng nhập email Admin!' },
                { type: 'email', message: 'Email không đúng định dạng!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="admin@congtya.com" />
            </Form.Item>

            <Form.Item
              name="tenDangNhapAdmin"
              label="Tên đăng nhập Admin"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: admin.congtya" />
            </Form.Item>

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

            <Form.Item style={{ marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/login">Quay lại đăng nhập</Link>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  Gửi yêu cầu đăng ký
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form
            form={formOtp}
            layout="vertical"
            onFinish={handleXacThucOtp}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <MailOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
              <Paragraph>
                Mã xác thực OTP gồm 6 chữ số đã được gửi tới địa chỉ email: <br />
                <Text strong>{registeredEmail}</Text>. Vui lòng kiểm tra và nhập mã xác thực vào ô dưới đây.
              </Paragraph>
            </div>

            <Form.Item
              name="otp"
              label="Mã OTP"
              rules={[
                { required: true, message: 'Vui lòng nhập mã OTP!' },
                { len: 6, message: 'Mã OTP phải gồm 6 ký tự số!' }
              ]}
            >
              <Input prefix={<KeyOutlined />} placeholder="Nhập 6 số mã OTP" maxLength={6} style={{ letterSpacing: 4, textAlign: 'center', fontSize: 18 }} />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Xác thực & Kích hoạt
              </Button>
              <Button type="link" block onClick={() => setCurrentStep(0)} style={{ marginTop: 8 }}>
                Quay lại sửa thông tin đăng ký
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 2 && (
          <Result
            status="success"
            title="Đăng ký Đơn vị thành công!"
            subTitle="Đơn vị của bạn đã được khởi tạo và kích hoạt thành công trên hệ thống ITAM. Bạn có thể sử dụng tài khoản Admin vừa tạo để đăng nhập."
            extra={[
              <Button type="primary" key="login" size="large" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default DangKyDonViPage;
