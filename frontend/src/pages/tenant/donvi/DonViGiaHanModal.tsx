import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [form] = Form.useForm<GiaHanHopDongRequest>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: GiaHanHopDongRequest = {
        ngayHetHanMoi: values.ngayHetHanMoi ? (values.ngayHetHanMoi as any).format('YYYY-MM-DD') : '',
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
      title={t('donViGiaHanModal.gia_han_hop_dong')}
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
          label={t('donViGiaHanModal.ngay_het_han_moi')}
          rules={[{ required: true, message: t('donViGiaHanModal.vui_long_chon_ngay') }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" minDate={dayjs()} />
        </Form.Item>

        <Form.Item name="ghiChuGiaHan" label={t('donViGiaHanModal.ghi_chu_gia_han')}>
          <Input.TextArea rows={4} placeholder={t('donViGiaHanModal.nhap_ly_do_hoac')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DonViGiaHanModal;
