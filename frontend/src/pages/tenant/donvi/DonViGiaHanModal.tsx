import React from 'react';
import { Modal, Form, DatePicker, Input, Button } from 'antd';
import dayjs from 'dayjs';
import type { GiaHanHopDongRequest } from '../../../api-generated/models/giaHanHopDongRequest';

interface DonViGiaHanModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: GiaHanHopDongRequest) => Promise<void>;
}

export const DonViGiaHanModal: React.FC<DonViGiaHanModalProps> = ({
  open,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm<GiaHanHopDongRequest>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: GiaHanHopDongRequest = {
        ngayHetHanMoi: values.ngayHetHanMoi ? values.ngayHetHanMoi.format('YYYY-MM-DD') : '',
        ghiChuGiaHan: values.ghiChuGiaHan,
      };
      await onSave(payload);
      form.resetFields();
    } catch (e) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title="Gia hạn hợp đồng Đơn vị"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận gia hạn
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="ngayHetHanMoi"
          label="Ngày hết hạn mới"
          rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" minDate={dayjs()} />
        </Form.Item>

        <Form.Item name="ghiChuGiaHan" label="Ghi chú gia hạn">
          <Input.TextArea rows={4} placeholder="Nhập lý do hoặc nội dung ghi chú gia hạn hợp đồng..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DonViGiaHanModal;
