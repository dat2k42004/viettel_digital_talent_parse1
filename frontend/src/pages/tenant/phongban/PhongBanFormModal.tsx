import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import type { PhongBanResponse } from '../../../api-generated/models/phongBanResponse';
import type { PhongBanRequest } from '../../../api-generated/models/phongBanRequest';

interface PhongBanFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedPhongBan: PhongBanResponse | null;
  onSave: (values: PhongBanRequest) => Promise<void>;
}

export const PhongBanFormModal: React.FC<PhongBanFormModalProps> = ({
  open,
  onCancel,
  selectedPhongBan,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<PhongBanRequest>();

  useEffect(() => {
    if (open) {
      if (selectedPhongBan) {
        form.setFieldsValue({
          maPhongBan: selectedPhongBan.maPhongBan,
          tenPhongBan: selectedPhongBan.tenPhongBan,
          tenVietTat: selectedPhongBan.tenVietTat,
          emailNhom: selectedPhongBan.emailNhom,
          soHotlinePhong: selectedPhongBan.soHotlinePhong,
          moTaChucNang: selectedPhongBan.moTaChucNang,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedPhongBan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as PhongBanRequest);
    } catch (e) {
      // Validation failed
    }
  };

  return (
    <Modal
      title={selectedPhongBan ? t('phongBanFormModal.cap_nhat_phong_ban') : t('phongBanFormModal.them_moi_phong_ban')}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>{t('common.cancel')}</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>{t('common.save')}</Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {selectedPhongBan && (
          <Form.Item name="maPhongBan" label={t('phongBanFormModal.ma_phong_ban')}>
            <Input disabled placeholder={t('phongBanFormModal.ma_phong_ban_tu')} />
          </Form.Item>
        )}

        <Form.Item
          name="tenPhongBan"
          label={t('phongBanManagementPage.ten_phong_ban')}
          rules={[{ required: true, message: t('phongBanFormModal.vui_long_nhap_ten') }]}
        >
          <Input placeholder={t('phongBanFormModal.vi_du_phong_phat')} />
        </Form.Item>

        <Form.Item name="tenVietTat" label={t('phongBanManagementPage.ten_viet_tat')}>
          <Input placeholder={t('phongBanFormModal.vi_du_ptpm')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="emailNhom" label={t('phongBanManagementPage.email_nhom')}>
              <Input type="email" placeholder="dev-team@congty.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soHotlinePhong" label={t('phongBanFormModal.so_hotline_phong')}>
              <Input placeholder={t('phongBanFormModal.vi_du_024xxxxxx')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="moTaChucNang" label={t('phongBanFormModal.mo_ta_chuc_nang')}>
          <Input.TextArea rows={3} placeholder={t('phongBanFormModal.mo_ta_tom_tat')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PhongBanFormModal;
