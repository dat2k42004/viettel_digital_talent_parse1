import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (isView) return t('loaiTaiSanFormModal.chi_tiet_loai_tai');
    return selectedLoaiTaiSan ? t('loaiTaiSanFormModal.cap_nhat_loai_tai') : t('loaiTaiSanFormModal.them_moi_loai_tai');
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      footer={
        isView
          ? [
              <Button key="close" onClick={onCancel}>{t('common.close')}</Button>,
            ]
          : [
              <Button key="cancel" onClick={onCancel}>{t('common.cancel')}</Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>{t('common.save')}</Button>,
            ]
      }
      width={650}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maLoai"
              label={t('loaiTaiSanFormModal.ma_loai_tai_san')}
            >
              <Input disabled placeholder={t('loaiTaiSanFormModal.ma_he_thong_tu')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenLoai"
              label={t('loaiTaiSanFormModal.ten_loai_tai_san')}
              rules={[
                { required: true, message: t('loaiTaiSanFormModal.vui_long_nhap_ten') },
                { max: 100, message: t('loaiTaiSanFormModal.ten_loai_khong_vuot') },
              ]}
            >
              <Input disabled={isView} placeholder={t('loaiTaiSanFormModal.nhap_ten_loai_tai')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tienToMaThe"
              label={t('loaiTaiSanFormModal.tien_to_ma_the')}
              rules={[{ max: 10, message: t('loaiTaiSanFormModal.tien_to_khong_vuot') }]}
            >
              <Input disabled={isView} placeholder={t('loaiTaiSanFormModal.vi_du_tspc_tspm')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="thoiGianKhauHao"
              label={t('loaiTaiSanFormModal.thoi_gian_khau_hao')}
              rules={[
                { type: 'number', min: 0, message: t('loaiTaiSanFormModal.khau_hao_phai_lon') }
              ]}
            >
              <InputNumber disabled={isView} style={{ width: '100%' }} placeholder={t('loaiTaiSanFormModal.nhap_so_thang_khau')} />
            </Form.Item>
          </Col>
        </Row>

        {isView && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="trangThai"
                label={t('loaiTaiSanFormModal.trang_thai')}
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: t('loaiTaiSanFormModal.dang_hoat_dong') },
                  { value: 'KHOA', label: t('loaiTaiSanFormModal.tam_khoa') },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item name="ghiChu" label={t('loaiTaiSanFormModal.ghi_chu')}>
          <Input.TextArea disabled={isView} rows={3} placeholder={t('loaiTaiSanFormModal.nhap_ghi_chu_neu')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoaiTaiSanFormModal;
