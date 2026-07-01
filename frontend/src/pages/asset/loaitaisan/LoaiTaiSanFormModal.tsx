import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select } from 'antd';
import type { LoaiTaiSanResponse } from '../../../api-generated/models/loaiTaiSanResponse';
import type { LoaiTaiSanRequest } from '../../../api-generated/models/loaiTaiSanRequest';

interface LoaiTaiSanFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedLoaiTaiSan: LoaiTaiSanResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: LoaiTaiSanRequest) => Promise<void>;
}

export const LoaiTaiSanFormModal: React.FC<LoaiTaiSanFormModalProps> = ({
  open,
  onCancel,
  selectedLoaiTaiSan,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<LoaiTaiSanRequest>();
  const isView = mode === 'view';

  useEffect(() => {
    if (open) {
      if (selectedLoaiTaiSan) {
        form.setFieldsValue({
          maLoai: selectedLoaiTaiSan.maLoai,
          tenLoai: selectedLoaiTaiSan.tenLoai,
          tienToMaThe: selectedLoaiTaiSan.tienToMaThe,
          thoiGianKhauHao: selectedLoaiTaiSan.thoiGianKhauHao,
          ghiChu: selectedLoaiSanXuat(selectedLoaiTaiSan.ghiChu), // Wait, selectedLoaiSanXuat is a typo, it should be selectedLoaiTaiSan.ghiChu directly
          trangThai: selectedLoaiTaiSan.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedLoaiTaiSan, form]);

  // Helper helper
  const selectedLoaiSanXuat = (val: any) => val;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedLoaiTaiSan ? selectedLoaiTaiSan.trangThai : 'HOAT_DONG',
      } as LoaiTaiSanRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết loại tài sản';
    return selectedLoaiTaiSan ? 'Cập nhật loại tài sản' : 'Thêm mới loại tài sản';
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
              name="maLoai"
              label="Mã loại tài sản"
            >
              <Input disabled placeholder="Mã hệ thống tự động sinh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenLoai"
              label="Tên loại tài sản"
              rules={[
                { required: true, message: 'Vui lòng nhập tên loại!' },
                { max: 100, message: 'Tên loại không vượt quá 100 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Nhập tên loại tài sản" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tienToMaThe"
              label="Tiền tố mã thẻ"
              rules={[{ max: 10, message: 'Tiền tố không vượt quá 10 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Ví dụ: TS-PC, TS-PM" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="thoiGianKhauHao"
              label="Thời gian khấu hao (tháng)"
              rules={[
                { type: 'number', min: 0, message: 'Khấu hao phải lớn hơn hoặc bằng 0!' }
              ]}
            >
              <InputNumber disabled={isView} style={{ width: '100%' }} placeholder="Nhập số tháng khấu hao" />
            </Form.Item>
          </Col>
        </Row>

        {isView && (
          <Row gutter={16}>
            <Col span={24}>
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
          </Row>
        )}

        <Form.Item name="ghiChu" label="Ghi chú">
          <Input.TextArea disabled={isView} rows={3} placeholder="Nhập ghi chú (nếu có)..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoaiTaiSanFormModal;
