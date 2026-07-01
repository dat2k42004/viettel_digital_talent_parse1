import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select } from 'antd';
import type { HangSanXuatResponse } from '../../../api-generated/models/hangSanXuatResponse';
import type { HangSanXuatRequest } from '../../../api-generated/models/hangSanXuatRequest';

interface HangSanXuatFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedHangSanXuat: HangSanXuatResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: HangSanXuatRequest) => Promise<void>;
}

export const HangSanXuatFormModal: React.FC<HangSanXuatFormModalProps> = ({
  open,
  onCancel,
  selectedHangSanXuat,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<HangSanXuatRequest>();
  const isView = mode === 'view';

  useEffect(() => {
    if (open) {
      if (selectedHangSanXuat) {
        form.setFieldsValue({
          maHang: selectedHangSanXuat.maHang,
          tenHang: selectedHangSanXuat.tenHang,
          websiteHoTro: selectedHangSanXuat.websiteHoTro,
          hotlineHoTro: selectedHangSanXuat.hotlineHoTro,
          emailHoTro: selectedHangSanXuat.emailHoTro,
          ghiChu: selectedHangSanXuat.ghiChu,
          trangThai: selectedHangSanXuat.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedHangSanXuat, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedHangSanXuat ? selectedHangSanXuat.trangThai : 'HOAT_DONG',
      } as HangSanXuatRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết hãng sản xuất';
    return selectedHangSanXuat ? 'Cập nhật hãng sản xuất' : 'Thêm mới hãng sản xuất';
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      footer={
        isView
          ? [
              <Button key="close" onClick={onCancel}>
                Đóng
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onCancel}>
                Hủy bỏ
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>
                Xác nhận lưu
              </Button>,
            ]
      }
      width={650}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maHang"
              label="Mã hãng sản xuất"
            >
              <Input disabled placeholder="Mã hệ thống tự động sinh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenHang"
              label="Tên hãng sản xuất"
              rules={[
                { required: true, message: 'Vui lòng nhập tên hãng!' },
                { max: 100, message: 'Tên hãng không vượt quá 100 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Nhập tên hãng sản xuất" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="websiteHoTro"
              label="Website hỗ trợ"
              rules={[{ max: 255, message: 'Website không vượt quá 255 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: https://dell.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="hotlineHoTro"
              label="Hotline hỗ trợ"
              rules={[{ max: 20, message: 'Hotline không vượt quá 20 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: 1800-xxxx" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 12 : 24}>
            <Form.Item
              name="emailHoTro"
              label="Email hỗ trợ"
              rules={[
                { type: 'email', message: 'Email hỗ trợ không đúng định dạng!' },
                { max: 100, message: 'Email không vượt quá 100 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Ví dụ: support@dell.com" />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={12}>
              <Form.Item
                name="trangThai"
                label="Trạng thái"
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                  { value: 'KHOA', label: 'Tạm khóa' },
                ]} />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item name="ghiChu" label="Ghi chú">
          <Input.TextArea disabled={isView} rows={3} placeholder="Nhập ghi chú (nếu có)..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HangSanXuatFormModal;
