import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authStore } from '../../../stores/AuthStore';
import { login, getMyProfile } from '../../../api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import { ForgetPasswordModal } from './ForgetPasswordModal';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDangNhap = async (values: { tenDangNhap: string; matKhau: string }) => {
    setLoading(true);
    try {
      const res = await login({
        username: values.tenDangNhap,
        password: values.matKhau,
      });

      if (res.data?.accessToken && res.data?.refreshToken) {
        const idDonViStr = String(res.data.idDonVi || '1');
        authStore.dangNhapThanhCong(res.data.accessToken, res.data.refreshToken, idDonViStr);

        if (res.data.thongTinNguoiDung) {
          authStore.napHoSoCaNhan(res.data.thongTinNguoiDung);
        } else {
          const profileRes = await getMyProfile();
          if (profileRes.data) {
            authStore.napHoSoCaNhan(profileRes.data);
          }
        }

        message.success('Đăng nhập hệ thống ITAM thành công!');
        navigate('/');
      } else {
        message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản!');
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Sai tên đăng nhập hoặc mật khẩu!';
      message.error(errorMsg);
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
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Hệ thống ITAM
          </Title>
          <Text type="secondary">Quản lý vòng đời tài sản CNTT đa doanh nghiệp</Text>
        </div>

        <Form
          form={form}
          name="login_form"
          initialValues={{ tenDangNhap: '' }}
          onFinish={handleDangNhap}
          layout="vertical"
        >
          <Form.Item
            name="tenDangNhap"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên tài khoản hoặc email" />
          </Form.Item>

          <Form.Item
            name="matKhau"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu tài khoản" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <a href="#forgot-password" onClick={(e) => { e.preventDefault(); setIsForgetOpen(true); }}>
            Quên mật khẩu?
          </a>
          <Space>
            <Text type="secondary">Chưa có đơn vị?</Text>
            <a href="#register" onClick={(e) => { e.preventDefault(); message.info('Vui lòng liên hệ Super Admin'); }}>
              Đăng ký
            </a>
          </Space>
        </div>
      </Card>

      <ForgetPasswordModal open={isForgetOpen} onCancel={() => setIsForgetOpen(false)} />
    </div>
  );
};

export default LoginPage;
