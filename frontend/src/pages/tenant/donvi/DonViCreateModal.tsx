import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title={t('donViCreateModal.them_moi_don_vi')}
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
              <Input placeholder={t('donViCreateModal.nhap_ma_so_thue')} />
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

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          2. Khởi tạo tài khoản Quản trị Đơn vị (Admin)
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
              label={t('donViCreateModal.email_nhan_ma_otp')}
              rules={[
                { required: true, message: t('xacThucOtpPage.vui_long_nhap_email') },
                { type: 'email', message: t('xacThucOtpPage.email_khong_hop_le') }
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
                { min: 6, message: t('donViCreateModal.mat_khau_phai_chua') }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('donViCreateModal.mat_khau')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DonViCreateModal;
