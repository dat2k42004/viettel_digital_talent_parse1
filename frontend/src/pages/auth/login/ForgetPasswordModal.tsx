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
      message.success('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!');
    } catch (error: any) {
      message.error(error?.message || 'Không thể gửi mã OTP, vui lòng kiểm tra lại!');
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
      message.success('Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.');
      onCancel();
      setStep(0);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
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
      title="Khôi phục mật khẩu qua Email OTP"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={450}
    >
      <Steps
        current={step}
        size="small"
        items={[{ title: 'Gửi mã OTP' }, { title: 'Đặt lại mật khẩu' }]}
        style={{ marginBottom: 24, marginTop: 12 }}
      />

      {step === 0 ? (
        <Form form={form} onFinish={handleGuiOtp} layout="vertical">
          <Form.Item
            name="email"
            label="Địa chỉ Email khôi phục"
            rules={[
              { required: true, message: 'Vui lòng nhập email khôi phục tài khoản!' },
              { type: 'email', message: 'Địa chỉ email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="nhanvien@congty.com" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleClose}>Hủy bỏ</Button>
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
            label="Mã xác thực OTP"
            rules={[{ required: true, message: 'Vui lòng nhập mã OTP nhận được!' }]}
          >
            <Input prefix={<SafetyOutlined />} placeholder="Nhập mã OTP 6 ký tự số" />
          </Form.Item>
          <Form.Item
            name="matKhauMoi"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setStep(0)}>Quay lại</Button>
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
