import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { dangKyDonVi } from '../../../api-generated/endpoints/don-vi-controller/don-vi-controller';
import type { DangKyDonViRequest } from '../../../api-generated/models/dangKyDonViRequest';

const { Title, Text } = Typography;

export const DangKyPage: React.FC = () => {
  const { t } = useTranslation();
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
        message.success(res.message || t('dangKyPage.dang_ky_thong_tin'));
        navigate('/xac-thuc-otp', { state: { email: values.emailAdmin } });
      } else {
        message.error(res.message || t('dangKyPage.dang_ky_don_vi'));
      }
    } catch (error: any) {
      message.error(error?.message || t('dangKyPage.co_loi_xay_ra'));
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
            {t('dangKyPage.dang_ky_don_vi_1')}
          </Title>
          <Text type="secondary">{t('dangKyPage.cung_cap_thong_tin')}</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleDangKy}
        >
          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
            {t('dangKyDonViPage.1_thong_tin_don_vi')}
          </Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenPhapLy"
                label={t('donViFormModal.ten_phap_ly_don')}
                rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ten_phap_ly') }]}
              >
                <Input prefix={<BankOutlined />} placeholder={t('donViFormModal.vi_du_cong_ty')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tenMienHeThong"
                label={t('donViCreateModal.ten_mien_he_thong')}
                rules={[{ required: true, message: t('dangKyPage.vui_long_nhap_ten_mien') }]}
              >
                <Input placeholder={t('donViFormModal.vi_du_congtyacom')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maSoThue"
                label={t('donViManagementPage.ma_so_thue')}
              >
                <Input placeholder={t('dangKyPage.ma_so_thue_doanh')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tenNguoiDaiDien"
                label={t('donViCreateModal.ho_ten_nguoi_dai')}
                rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ho_ten_nguoi_dai_dien') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('dangKyDonViPage.vi_du_nguyen_van_a')} />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 12, marginBottom: 16 }}>
            {t('dangKyDonViPage.2_thong_tin_tai_khoan_admin_don_vi')}
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenAdmin"
                label={t('donViCreateModal.ho_ten_admin')}
                rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ho') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('donViCreateModal.vi_du_nguyen_van')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emailAdmin"
                label={t('dangKyPage.email_nhan_otp')}
                rules={[
                  { required: true, message: t('xacThucOtpPage.vui_long_nhap_email') },
                  { type: 'email', message: t('dangKyPage.email_khong_dung_dinh') }
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
                label={t('donViCreateModal.ten_dang_nhap_admin')}
                rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ten') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('donViCreateModal.ten_dang_nhap')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="matKhauAdmin"
                label={t('donViCreateModal.mat_khau_tai_khoan')}
                rules={[
                  { required: true, message: t('donViCreateModal.vui_long_nhap_mat') },
                  { min: 6, message: t('dangKyPage.mat_khau_phai_tu') }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder={t('donViCreateModal.mat_khau')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login">{t('dangKyPage.quay_lai_dang_nhap')}</Link>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {t('dangKyPage.tiep_tuc_dang_ky')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DangKyPage;
