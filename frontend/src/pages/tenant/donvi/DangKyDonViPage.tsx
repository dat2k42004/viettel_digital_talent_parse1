import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Card, Form, Input, Button, Steps, Result, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { dangKyDonVi, xacThucOtp } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';
import type { XacThucOtpRequest } from '../../../api-generated/models/xacThucOtpRequest';

const { Title, Paragraph, Text } = Typography;

export const DangKyDonViPage: React.FC = () => {
  const { t } = useTranslation();
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
        message.success(res.message || t('dangKyDonViPage.gui_yeu_cau_dang'));
        setRegisteredEmail(values.emailAdmin);
        setCurrentStep(1);
      } else {
        message.error(res.message || t('dangKyPage.dang_ky_don_vi'));
      }
    } catch (error: any) {
      message.error(error?.message || t('dangKyPage.co_loi_xay_ra'));
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
        message.success(res.message || t('dangKyDonViPage.xac_thuc_otp_va'));
        setCurrentStep(2);
      } else {
        message.error(res.message || t('dangKyDonViPage.ma_otp_khong_hop'));
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
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: currentStep === 0 ? 680 : 520 }}>
        <Card
          style={{
            width: '100%',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Title level={3} style={{ margin: 0 }}>
              {t('dangKyDonViPage.dang_ky_don_vi_saas_moi')}
            </Title>
            <Text type="secondary">{t('dangKyDonViPage.tham_gia_he_thong')}</Text>
          </div>

          <Steps
            current={currentStep}
            style={{ marginBottom: 30 }}
            items={[
              { title: t('dangKyDonViPage.dang_ky_thong_tin') },
              { title: t('dangKyDonViPage.xac_thuc_otp') },
              { title: t('dangKyDonViPage.hoan_tat') },
            ]}
          />

          {currentStep === 0 && (
            <Form
              form={formDangKy}
              layout="vertical"
              onFinish={handleDangKy}
            >
              <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                {t('dangKyDonViPage.1_thong_tin_don_vi')}
              </Title>
              
              <Form.Item
                name="tenPhapLy"
                label={t('donViFormModal.ten_phap_ly_don')}
                rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ten_phap_ly') }]}
              >
                <Input prefix={<BankOutlined />} placeholder={t('donViFormModal.vi_du_cong_ty')} />
              </Form.Item>

              <Form.Item
                name="tenMienHeThong"
                label={t('donViCreateModal.ten_mien_he_thong')}
                rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ten_mien_he_thong') }]}
              >
                <Input placeholder={t('donViFormModal.vi_du_congtyacom')} />
              </Form.Item>

              <Form.Item
                name="maSoThue"
                label={t('donViManagementPage.ma_so_thue')}
              >
                <Input placeholder={t('dangKyDonViPage.nhap_ma_so_thue')} />
              </Form.Item>

              <Form.Item
                name="tenNguoiDaiDien"
                label={t('donViCreateModal.ho_ten_nguoi_dai')}
                rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ho_ten_nguoi_dai_dien') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('dangKyDonViPage.vi_du_nguyen_van_a')} />
              </Form.Item>

            <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 24, marginBottom: 16 }}>
              {t('dangKyDonViPage.2_thong_tin_tai_khoan_admin_don_vi')}
            </Title>

            <Form.Item
              name="tenAdmin"
              label={t('donViCreateModal.ho_ten_admin')}
              rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ho') }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('donViCreateModal.vi_du_nguyen_van')} />
            </Form.Item>

            <Form.Item
              name="emailAdmin"
              label={t('dangKyDonViPage.email_nhan_otp_kich')}
              rules={[
                { required: true, message: t('dangKyDonViPage.vui_long_nhap_email') },
                { type: 'email', message: t('dangKyPage.email_khong_dung_dinh') }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="admin@congtya.com" />
            </Form.Item>

            <Form.Item
              name="tenDangNhapAdmin"
              label={t('donViCreateModal.ten_dang_nhap_admin')}
              rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ten') }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('dangKyDonViPage.vi_du_admincongtya')} />
            </Form.Item>

            <Form.Item
              name="matKhauAdmin"
              label={t('donViCreateModal.mat_khau_tai_khoan')}
              rules={[
                { required: true, message: t('donViCreateModal.vui_long_nhap_mat') },
                { min: 6, message: t('donViCreateModal.mat_khau_phai_chua') }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('donViCreateModal.mat_khau')} />
            </Form.Item>

              <Form.Item style={{ marginTop: 24 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Link to="/login">{t('dangKyPage.quay_lai_dang_nhap')}</Link>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    {t('dangKyDonViPage.gui_yeu_cau_dang_ky')}
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
                label={t('dangKyDonViPage.ma_otp')}
                rules={[
                  { required: true, message: t('xacThucOtpPage.vui_long_nhap_ma') },
                  { len: 6, message: t('dangKyDonViPage.ma_otp_phai_gom') }
                ]}
              >
                <Input
                  prefix={<KeyOutlined />}
                  placeholder={t('dangKyDonViPage.nhap_6_so_ma')}
                  maxLength={6}
                  style={{ letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
                />
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
              title={t('dangKyDonViPage.dang_ky_don_vi')}
              subTitle={t('dangKyDonViPage.don_vi_cua_ban')}
              extra={[
                <Button type="primary" key="login" size="large" onClick={() => navigate('/login')}>
                  Đăng nhập ngay
                </Button>
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default DangKyDonViPage;
