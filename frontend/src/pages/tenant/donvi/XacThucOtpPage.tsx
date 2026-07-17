import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { xacThucOtp } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { XacThucOtpRequest } from '../../../api-generated/models/xacThucOtpRequest';

const { Title, Paragraph, Text } = Typography;

export const XacThucOtpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<XacThucOtpRequest>();
  const [loading, setLoading] = useState(false);

  const emailFromState = location.state?.email || '';

  useEffect(() => {
    form.setFieldsValue({
      email: emailFromState,
    });
  }, [emailFromState, form]);

  const handleXacThuc = async (values: XacThucOtpRequest) => {
    setLoading(true);
    try {
      const res = await xacThucOtp({
        email: values.email,
        otp: values.otp,
      });

      if (res.code === 200) {
        message.success(res.message || t('xacThucOtpPage.xac_thuc_otp_va'));
        navigate('/login');
      } else {
        message.error(res.message || t('xacThucOtpPage.ma_otp_khong_chinh'));
      }
    } catch (error: any) {
      message.error(error?.message || t('xacThucOtpPage.xac_thuc_otp_that'));
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
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: 450,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MailOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 12 }} />
          <Title level={3} style={{ margin: 0 }}>
            {t('xacThucOtpPage.xac_thuc_otp')}
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            Vui lòng nhập mã OTP được gửi tới hòm thư của bạn để kích hoạt đơn vị.
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleXacThuc}
        >
          <Form.Item
            name="email"
            label={t('xacThucOtpPage.dia_chi_email_dang')}
            rules={[
              { required: true, message: t('xacThucOtpPage.vui_long_nhap_email') },
              { type: 'email', message: t('xacThucOtpPage.email_khong_hop_le') }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@congty.com" disabled={!!emailFromState} />
          </Form.Item>

          <Form.Item
            name="otp"
            label={t('xacThucOtpPage.ma_otp_xac_thuc')}
            rules={[
              { required: true, message: t('xacThucOtpPage.vui_long_nhap_ma') },
              { len: 6, message: t('xacThucOtpPage.ma_otp_phai_co') }
            ]}
          >
            <Input prefix={<KeyOutlined />} placeholder={t('xacThucOtpPage.nhap_6_ky_so')} maxLength={6} style={{ letterSpacing: 4, textAlign: 'center', fontSize: 16 }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Kích hoạt đơn vị
            </Button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/dang-ky">{t('xacThucOtpPage.quay_lai_dang_ky')}</Link>
              <Text type="secondary" style={{ margin: '0 8px' }}>|</Text>
              <Link to="/login">{t('xacThucOtpPage.dang_nhap')}</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default XacThucOtpPage;
