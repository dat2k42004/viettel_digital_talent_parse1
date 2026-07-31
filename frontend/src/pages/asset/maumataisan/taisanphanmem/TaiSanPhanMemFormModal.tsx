import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, message, Upload } from 'antd';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import type { TaiSanPhanMemResponse } from '../../../../api-generated/models/taiSanPhanMemResponse';
import type { TaiSanPhanMemRequest } from '../../../../api-generated/models/taiSanPhanMemRequest';
import { laySelectOptions9 } from '../../../../api-generated/endpoints/hang-san-xuat-controller/hang-san-xuat-controller';
import { laySelectOptions7 } from '../../../../api-generated/endpoints/loai-tai-san-controller/loai-tai-san-controller';
import { laySelectOptions11 } from '../../../../api-generated/endpoints/danh-muc-tai-san-controller/danh-muc-tai-san-controller';
import { useSearchableSelect } from '../../../../hooks/useSearchableSelect';

interface TaiSanPhanMemFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedTaiSanPhanMem: TaiSanPhanMemResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: TaiSanPhanMemRequest) => Promise<void>;
}

export const TaiSanPhanMemFormModal: React.FC<TaiSanPhanMemFormModalProps> = ({
  open,
  onCancel,
  selectedTaiSanPhanMem,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<TaiSanPhanMemRequest>();
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
      if (selectedTaiSanPhanMem) {
        form.setFieldsValue({
          idDanhMucTaiSan: selectedTaiSanPhanMem.idDanhMucTaiSan,
          idLoaiTaiSan: selectedTaiSanPhanMem.idLoaiTaiSan,
          idHangSanXuat: selectedTaiSanPhanMem.idHangSanXuat,
          maMau: selectedTaiSanPhanMem.maMau,
          tenMau: selectedTaiSanPhanMem.tenMau,
          hinhAnh: selectedTaiSanPhanMem.hinhAnh,
          hinhThucTrienKhai: selectedTaiSanPhanMem.hinhThucTrienKhai,
          nenTangHoTro: selectedTaiSanPhanMem.nenTangHoTro,
          hinhThucCapPhep: selectedTaiSanPhanMem.hinhThucCapPhep,
          moTa: selectedTaiSanPhanMem.moTa,
          trangThai: selectedTaiSanPhanMem.trangThai || 'HOAT_DONG',
        });
        setImageUrl(selectedTaiSanPhanMem.hinhAnh || '');
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
        setImageUrl('');
      }
    }
  }, [open, selectedTaiSanPhanMem, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedTaiSanPhanMem ? selectedTaiSanPhanMem.trangThai : 'HOAT_DONG',
      } as TaiSanPhanMemRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('taiSanPhanMemFormModal.chi_tiet_mau_tai');
    return selectedTaiSanPhanMem ? t('taiSanPhanMemFormModal.cap_nhat_mau_tai') : t('taiSanPhanMemFormModal.them_moi_mau_tai');
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
      width={700}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenMau"
              label={t('danhSachThietBiPhanMemPage.ten_mau_phan_mem')}
              rules={[
                { required: true, message: t('taiSanPhanMemFormModal.vui_long_nhap_ten') },
                { max: 150, message: t('taiSanPhanMemFormModal.ten_mau_khong_vuot') },
              ]}
            >
              <Input disabled={isView} placeholder={t('taiSanPhanMemFormModal.vi_du_office_365')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maMau"
              label={t('taiSanPhanMemFormModal.ma_mau_phan_mem')}
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
            <Form.Item
              name="hinhThucTrienKhai"
              label={t('taiSanPhanMemPage.hinh_thuc_trien_khai')}
              rules={[{ max: 50, message: t('taiSanPhanMemFormModal.hinh_thuc_trien_khai') }]}
            >
              <Input disabled={isView} placeholder={t('taiSanPhanMemFormModal.vi_du_cloud_onpremise')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nenTangHoTro"
              label={t('taiSanPhanMemPage.nen_tang_ho_tro')}
              rules={[{ max: 100, message: t('taiSanPhanMemFormModal.nen_tang_ho_tro') }]}
            >
              <Input disabled={isView} placeholder={t('taiSanPhanMemFormModal.vi_du_windows_macos')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="hinhThucCapPhep"
              label={t('taiSanPhanMemPage.hinh_thuc_cap_phep')}
              rules={[{ max: 100, message: t('taiSanPhanMemFormModal.hinh_thuc_cap_phep') }]}
            >
              <Input disabled={isView} placeholder={t('taiSanPhanMemFormModal.vi_du_vinh_vien_theo')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="moTa" label={t('donViFormModal.mo_ta')}>
              <Input.TextArea disabled={isView} rows={3} placeholder={t('taiSanPhanMemFormModal.nhap_mo_ta_chi_tiet')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaiSanPhanMemFormModal;
