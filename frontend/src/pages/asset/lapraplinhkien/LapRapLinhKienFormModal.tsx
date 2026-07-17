import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, message } from 'antd';
import type { LapRapLinhKienRequest } from '../../../api-generated/models/lapRapLinhKienRequest';
import { laySelectOptions1 } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions8 } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import { useSearchableSelect } from '../../../hooks/useSearchableSelect';

interface LapRapFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: LapRapLinhKienRequest) => Promise<void>;
}

export const LapRapFormModal: React.FC<LapRapFormModalProps> = ({
  open,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<LapRapLinhKienRequest>();

  const thietBi = useSearchableSelect(laySelectOptions1 as any);
  const linhKien = useSearchableSelect(laySelectOptions8 as any);

  useEffect(() => {
    if (open) {
      Promise.all([
        thietBi.fetchOptions(),
        linhKien.fetchOptions()
      ]).catch(() => {
        message.error(t('lapRapLinhKienFormModal.khong_the_tai_danh'));
      });
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as LapRapLinhKienRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const loading = thietBi.loading || linhKien.loading;

  return (
    <Modal
      title={t('lapRapLinhKienFormModal.thuc_hien_lap_rap')}
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>{t('common.cancel')}</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Xác nhận lắp ráp
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="thietBiPhanCungId"
              label={t('lapRapLinhKienFormModal.chon_thiet_bi_phan_cung')}
              rules={[{ required: true, message: t('lapRapLinhKienFormModal.vui_long_chon_thiet') }]}
            >
              <Select
                placeholder={t('lapRapLinhKienFormModal.chon_thiet_bi_phan')}
                showSearch
                filterOption={false}
                onSearch={thietBi.handleSearch}
                loading={thietBi.loading}
                options={thietBi.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="linhKienPhanCungId"
              label={t('lapRapLinhKienFormModal.chon_linh_kien_phan')}
              rules={[{ required: true, message: t('lapRapLinhKienFormModal.vui_long_chon_linh') }]}
            >
              <Select
                placeholder={t('lapRapLinhKienFormModal.chon_linh_kien_co')}
                showSearch
                filterOption={false}
                onSearch={linhKien.handleSearch}
                loading={linhKien.loading}
                options={linhKien.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="ghiChu" label={t('lapRapLinhKienFormModal.ghi_chu_lap_rap')}>
          <Input.TextArea rows={3} placeholder={t('lapRapLinhKienFormModal.nhap_ly_do_ghi')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LapRapFormModal;
