import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select } from 'antd';
import type { DanhMucTaiSanResponse } from '../../../api-generated/models/danhMucTaiSanResponse';
import type { DanhMucTaiSanRequest } from '../../../api-generated/models/danhMucTaiSanRequest';

interface DanhMucTaiSanFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDanhMucTaiSan: DanhMucTaiSanResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhMucTaiSanRequest) => Promise<void>;
}

export const DanhMucTaiSanFormModal: React.FC<DanhMucTaiSanFormModalProps> = ({
  open,
  onCancel,
  selectedDanhMucTaiSan,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DanhMucTaiSanRequest>();
  const isView = mode === 'view';

  useEffect(() => {
    if (open) {
      if (selectedDanhMucTaiSan) {
        form.setFieldsValue({
          maDanhMuc: selectedDanhMucTaiSan.maDanhMuc,
          tenDanhMuc: selectedDanhMucTaiSan.tenDanhMuc,
          moTa: selectedDanhMucTaiSan.moTa,
          trangThai: selectedDanhMucTaiSan.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedDanhMucTaiSan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedDanhMucTaiSan ? selectedDanhMucTaiSan.trangThai : 'HOAT_DONG',
      } as DanhMucTaiSanRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('danhMucTaiSanFormModal.chi_tiet_danh_muc');
    return selectedDanhMucTaiSan ? t('danhMucTaiSanFormModal.cap_nhat_danh_muc') : t('danhMucTaiSanFormModal.them_moi_danh_muc');
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
              name="maDanhMuc"
              label={t('baoCaoPage.ma_danh_muc')}
            >
              <Input disabled placeholder={t('loaiTaiSanFormModal.ma_he_thong_tu')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenDanhMuc"
              label={t('danhMucTaiSanPage.ten_danh_muc')}
              rules={[
                { required: true, message: t('danhMucTaiSanFormModal.vui_long_nhap_ten') },
                { max: 100, message: t('danhMucTaiSanFormModal.ten_danh_muc_khong') },
              ]}
            >
              <Input disabled={isView} placeholder={t('danhMucTaiSanFormModal.nhap_ten_danh_muc')} />
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

        <Form.Item name="moTa" label={t('danhMucTaiSanFormModal.mo_ta_danh_muc')}>
          <Input.TextArea disabled={isView} rows={3} placeholder={t('danhMucTaiSanFormModal.nhap_mo_ta_chi')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DanhMucTaiSanFormModal;
