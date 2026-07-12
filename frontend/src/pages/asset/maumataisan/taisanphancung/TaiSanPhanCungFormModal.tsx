import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Switch, message, Upload } from 'antd';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import type { TaiSanPhanCungResponse } from '../../../../api-generated/models/taiSanPhanCungResponse';
import type { TaiSanPhanCungRequest } from '../../../../api-generated/models/taiSanPhanCungRequest';
import { laySelectOptions9 } from '../../../../api-generated/endpoints/hang-san-xuat-controller/hang-san-xuat-controller';
import { laySelectOptions7 } from '../../../../api-generated/endpoints/loai-tai-san-controller/loai-tai-san-controller';
import { laySelectOptions11 } from '../../../../api-generated/endpoints/danh-muc-tai-san-controller/danh-muc-tai-san-controller';
import { useSearchableSelect } from '../../../../hooks/useSearchableSelect';

interface TaiSanPhanCungFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedTaiSanPhanCung: TaiSanPhanCungResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: TaiSanPhanCungRequest) => Promise<void>;
}

export const TaiSanPhanCungFormModal: React.FC<TaiSanPhanCungFormModalProps> = ({
  open,
  onCancel,
  selectedTaiSanPhanCung,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TaiSanPhanCungRequest>();
  const isView = mode === 'view';

  const hang = useSearchableSelect(laySelectOptions9 as any);
  const loai = useSearchableSelect(laySelectOptions7 as any);
  const danhmuc = useSearchableSelect(laySelectOptions11 as any);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (open) {
      Promise.all([
        hang.fetchOptions(),
        loai.fetchOptions(),
        danhmuc.fetchOptions(),
      ]).catch(() => {
        message.error(t('taiSanPhanMemFormModal.khong_the_tai_danh'));
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedTaiSanPhanCung) {
        form.setFieldsValue({
          idDanhMucTaiSan: selectedTaiSanPhanCung.idDanhMucTaiSan,
          idLoaiTaiSan: selectedTaiSanPhanCung.idLoaiTaiSan,
          idHangSanXuat: selectedTaiSanPhanCung.idHangSanXuat,
          maMau: selectedTaiSanPhanCung.maMau,
          tenMau: selectedTaiSanPhanCung.tenMau,
          hinhAnh: selectedTaiSanPhanCung.hinhAnh,
          coTheThaoLap: selectedTaiSanPhanCung.coTheThaoLap ?? false,
          moTa: selectedTaiSanPhanCung.moTa,
          trangThai: selectedTaiSanPhanCung.trangThai || 'HOAT_DONG',
        });
        setImageUrl(selectedTaiSanPhanCung.hinhAnh || '');
      } else {
        form.resetFields();
        form.setFieldsValue({ coTheThaoLap: false, trangThai: 'HOAT_DONG' });
        setImageUrl('');
      }
    }
  }, [open, selectedTaiSanPhanCung, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedTaiSanPhanCung ? selectedTaiSanPhanCung.trangThai : 'HOAT_DONG',
      } as TaiSanPhanCungRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('taiSanPhanCungFormModal.chi_tiet_mau_tai');
    return selectedTaiSanPhanCung ? t('taiSanPhanCungFormModal.cap_nhat_mau_tai') : t('taiSanPhanCungFormModal.them_moi_mau_tai');
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
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenMau"
              label={t('linhKienPhanCungPage.ten_mau_thiet_bi')}
              rules={[
                { required: true, message: t('taiSanPhanMemFormModal.vui_long_nhap_ten') },
                { max: 150, message: t('taiSanPhanMemFormModal.ten_mau_khong_vuot') },
              ]}
            >
              <Input disabled={isView} placeholder={t('taiSanPhanCungFormModal.vi_du_latitude_5520')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maMau"
              label={t('taiSanPhanCungFormModal.ma_mau_thiet_bi')}
            >
              <Input disabled placeholder={t('loaiTaiSanFormModal.ma_he_thong_tu')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="idHangSanXuat"
              label={t('taiSanPhanMemPage.hang_san_xuat')}
              rules={[{ required: true, message: t('taiSanPhanMemFormModal.vui_long_chon_hang') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('taiSanPhanMemFormModal.chon_hang')}
                showSearch
                filterOption={false}
                onSearch={hang.handleSearch}
                loading={hang.loading}
                options={hang.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idLoaiTaiSan"
              label={t('baoCaoPage.loai_tai_san')}
              rules={[{ required: true, message: t('taiSanPhanMemFormModal.vui_long_chon_loai') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('taiSanPhanMemFormModal.chon_loai')}
                showSearch
                filterOption={false}
                onSearch={loai.handleSearch}
                loading={loai.loading}
                options={loai.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idDanhMucTaiSan"
              label={t('taiSanPhanMemFormModal.danh_muc_tai_san')}
              rules={[{ required: true, message: t('taiSanPhanMemFormModal.vui_long_chon_danh') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('taiSanPhanMemFormModal.chon_danh_muc')}
                showSearch
                filterOption={false}
                onSearch={danhmuc.handleSearch}
                loading={danhmuc.loading}
                options={danhmuc.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="coTheThaoLap" label={t('taiSanPhanCungFormModal.co_the_thao_lap_linh')} valuePropName="checked">
              <Switch disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="moTa" label={t('donViFormModal.mo_ta')}>
              <Input.TextArea disabled={isView} rows={3} placeholder={t('taiSanPhanCungFormModal.nhap_mo_ta_chi_tiet')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaiSanPhanCungFormModal;
