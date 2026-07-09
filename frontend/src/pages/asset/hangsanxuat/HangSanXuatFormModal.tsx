import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (isView) return t('hangSanXuatFormModal.chi_tiet_hang_san');
    return selectedHangSanXuat ? t('hangSanXuatFormModal.cap_nhat_hang_san') : t('hangSanXuatFormModal.them_moi_hang_san');
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
              label={t('hangSanXuatFormModal.ma_hang_san_xuat')}
            >
              <Input disabled placeholder={t('loaiTaiSanFormModal.ma_he_thong_tu')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenHang"
              label={t('hangSanXuatPage.ten_hang_san_xuat')}
              rules={[
                { required: true, message: t('hangSanXuatFormModal.vui_long_nhap_ten') },
                { max: 100, message: t('hangSanXuatFormModal.ten_hang_khong_vuot') },
              ]}
            >
              <Input disabled={isView} placeholder={t('hangSanXuatFormModal.nhap_ten_hang_san')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="websiteHoTro"
              label={t('hangSanXuatPage.website_ho_tro')}
              rules={[{ max: 255, message: t('hangSanXuatFormModal.website_khong_vuot_qua') }]}
            >
              <Input disabled={isView} placeholder={t('hangSanXuatFormModal.vi_du_httpsdellcom')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="hotlineHoTro"
              label={t('hangSanXuatFormModal.hotline_ho_tro')}
              rules={[{ max: 20, message: t('hangSanXuatFormModal.hotline_khong_vuot_qua') }]}
            >
              <Input disabled={isView} placeholder={t('hangSanXuatFormModal.vi_du_1800xxxx')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 12 : 24}>
            <Form.Item
              name="emailHoTro"
              label={t('hangSanXuatPage.email_ho_tro')}
              rules={[
                { type: 'email', message: t('hangSanXuatFormModal.email_ho_tro_khong') },
                { max: 100, message: t('hangSanXuatFormModal.email_khong_vuot_qua') },
              ]}
            >
              <Input disabled={isView} placeholder={t('hangSanXuatFormModal.vi_du_supportdellcom')} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={12}>
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
          )}
        </Row>

        <Form.Item name="ghiChu" label={t('loaiTaiSanFormModal.ghi_chu')}>
          <Input.TextArea disabled={isView} rows={3} placeholder={t('loaiTaiSanFormModal.nhap_ghi_chu_neu')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HangSanXuatFormModal;
