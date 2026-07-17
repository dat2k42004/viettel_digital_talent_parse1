import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authStore } from '../../../stores/AuthStore';
import { login, getMyProfile } from '../../../api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import type { DangNhapRequest } from '../../../api-generated/models/dangNhapRequest';
import { ForgetPasswordModal } from './ForgetPasswordModal';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDangNhap = async (values: { tenDangNhap: string; matKhau: string }) => {
    setLoading(true);
    try {
      const loginPayload: DangNhapRequest = {
        username: values.tenDangNhap,
        password: values.matKhau,
      };
      const res = await login(loginPayload);

      if (res.data?.accessToken && res.data?.refreshToken) {
        const idDonViStr = res.data.idDonVi ? String(res.data.idDonVi) : '';
        authStore.dangNhapThanhCong(res.data.accessToken, res.data.refreshToken, idDonViStr);

        if (res.data.thongTinNguoiDung) {
          authStore.napHoSoCaNhan(res.data.thongTinNguoiDung);
        } else {
          const profileRes = await getMyProfile();
          if (profileRes.data) {
            authStore.napHoSoCaNhan(profileRes.data);
          }
        }

        message.success(t('loginPage.dang_nhap_he_thong'));
        navigate('/');
      } else {
        message.error(t('loginPage.dang_nhap_that_bai'));
      }
    } catch (error: any) {
      const errorMsg = error?.message || t('loginPage.sai_ten_dang_nhap');
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
            {t('loginPage.he_thong_itam')}
          </Title>
          <Text type="secondary">{t('loginPage.quan_ly_vong_doi')}</Text>
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
            label={t('donViCreateModal.ten_dang_nhap')}
            rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ten') }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('loginPage.ten_tai_khoan_hoac')} />
          </Form.Item>

          <Form.Item
            name="matKhau"
            label={t('donViCreateModal.mat_khau')}
            rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_mat') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('loginPage.mat_khau_tai_khoan')} />
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
            <Text type="secondary">{t('loginPage.chua_co_don_vi')}</Text>
            <Link to="/dang-ky">{t('loginPage.dang_ky')}</Link>
          </Space>
        </div>
      </Card>

      <ForgetPasswordModal open={isForgetOpen} onCancel={() => setIsForgetOpen(false)} />
    </div>
  );
};

export default LoginPage;
