import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Button, Space, Typography, message } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { quenMatKhau, datLaiMatKhau } from '../../../api-generated/endpoints/xac-thuc-controller/xac-thuc-controller';
import type { QuenMatKhauRequest } from '../../../api-generated/models/quenMatKhauRequest';
import type { DatLaiMatKhauRequest } from '../../../api-generated/models/datLaiMatKhauRequest';

const { Paragraph } = Typography;

interface ForgetPasswordModalProps {
  open: boolean;
  onCancel: () => void;
}

export const ForgetPasswordModal: React.FC<ForgetPasswordModalProps> = ({ open, onCancel }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [form] = Form.useForm<QuenMatKhauRequest & DatLaiMatKhauRequest>();
  const [loading, setLoading] = useState(false);

  const handleGuiOtp = async (values: QuenMatKhauRequest) => {
    setLoading(true);
    try {
      await quenMatKhau(values);
      setEmail(values.email || '');
      setStep(1);
      message.success(t('forgetPasswordModal.ma_otp_khoi_phuc'));
    } catch (error: any) {
      message.error(error?.message || t('forgetPasswordModal.khong_the_gui_ma'));
    } finally {
      setLoading(false);
    }
  };

  const handleDatLaiMatKhau = async (values: Pick<DatLaiMatKhauRequest, 'maOtp' | 'matKhauMoi'>) => {
    setLoading(true);
    try {
      await datLaiMatKhau({
        email: email,
        maOtp: values.maOtp,
        matKhauMoi: values.matKhauMoi,
      });
      message.success(t('forgetPasswordModal.dat_lai_mat_khau_thanh'));
      onCancel();
      setStep(0);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || t('xacThucOtpPage.ma_otp_khong_chinh'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onCancel();
    setStep(0);
    form.resetFields();
  };

  return (
    <Modal
      title={t('forgetPasswordModal.khoi_phuc_mat_khau')}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={450}
    >
      <Steps
        current={step}
        size="small"
        items={[{ title: t('forgetPasswordModal.gui_ma_otp') }, { title: t('forgetPasswordModal.dat_lai_mat_khau') }]}
        style={{ marginBottom: 24, marginTop: 12 }}
      />

      {step === 0 ? (
        <Form form={form} onFinish={handleGuiOtp} layout="vertical">
          <Form.Item
            name="email"
            label={t('forgetPasswordModal.dia_chi_email_khoi')}
            rules={[
              { required: true, message: t('forgetPasswordModal.vui_long_nhap_email') },
              { type: 'email', message: t('forgetPasswordModal.dia_chi_email_khong') }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="nhanvien@congty.com" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleClose}>{t('appLayout.cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi mã xác thực
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <Form form={form} onFinish={handleDatLaiMatKhau} layout="vertical">
          <Paragraph>
            Mã OTP đã được hệ thống gửi đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
          </Paragraph>
          <Form.Item
            name="maOtp"
            label={t('forgetPasswordModal.ma_xac_thuc_otp')}
            rules={[{ required: true, message: t('forgetPasswordModal.vui_long_nhap_ma') }]}
          >
            <Input prefix={<SafetyOutlined />} placeholder={t('forgetPasswordModal.nhap_ma_otp_6')} />
          </Form.Item>
          <Form.Item
            name="matKhauMoi"
            label={t('appLayout.newPassword')}
            rules={[
              { required: true, message: t('appLayout.newPasswordRequired') },
              { min: 6, message: t('forgetPasswordModal.mat_khau_phai_co') }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('appLayout.newPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setStep(0)}>{t('forgetPasswordModal.quay_lai')}</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ForgetPasswordModal;
