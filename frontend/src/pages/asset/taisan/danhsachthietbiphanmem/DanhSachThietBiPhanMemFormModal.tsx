import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { DanhSachThietBiPhanMemResponse } from '../../../../api-generated/models/danhSachThietBiPhanMemResponse';
import type { DanhSachThietBiPhanMemRequest } from '../../../../api-generated/models/danhSachThietBiPhanMemRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions2 } from '../../../../api-generated/endpoints/tai-san-phan-mem-controller/tai-san-phan-mem-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';

interface DanhSachThietBiPhanMemFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThietBi: DanhSachThietBiPhanMemResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhSachThietBiPhanMemRequest) => Promise<void>;
}

export const DanhSachThietBiPhanMemFormModal: React.FC<DanhSachThietBiPhanMemFormModalProps> = ({
  open,
  onCancel,
  selectedThietBi,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DanhSachThietBiPhanMemRequest>();
  const isView = mode === 'view';

  const [mauPhanMemOptions, setMauPhanMemOptions] = useState<SelectOption[]>([]);
  const [nhaCungCapOptions, setNhaCungCapOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [mauRes, nccRes] = await Promise.all([
          laySelectOptions2(),
          laySelectOptions5(),
        ]);
        if (mauRes.data) setMauPhanMemOptions(mauRes.data);
        if (nccRes.data) setNhaCungCapOptions(nccRes.data);
      } catch (e) {
        message.error(t('danhSachThietBiPhanMemFormModal.khong_the_tai_danh'));
      }
    };
    if (open) {
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedThietBi) {
        form.setFieldsValue({
          idTaiSanPhanMem: selectedThietBi.idTaiSanPhanMem,
          idNhaCungCap: selectedThietBi.idNhaCungCap,
          keyBanQuyen: selectedThietBi.keyBanQuyen,
          maChungTuMua: selectedThietBi.maChungTuMua,
          tongSoGhe: selectedThietBi.tongSoGhe,
          giaMua: selectedThietBi.giaMua ? Number(selectedThietBi.giaMua) : undefined,
          thoiGianMua: selectedThietBi.thoiGianMua ? dayjs(selectedThietBi.thoiGianMua) as any : undefined,
          thoiGianHetHan: selectedThietBi.thoiGianHetHan ? dayjs(selectedThietBi.thoiGianHetHan) as any : undefined,
          trangThaiKho: selectedThietBi.trangThaiKho || 'TON_KHO',
          trangThai: selectedThietBi.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ tongSoGhe: 1, trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedThietBi, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        thoiGianHetHan: values.thoiGianHetHan ? dayjs(values.thoiGianHetHan).format('YYYY-MM-DD') : undefined,
        trangThai: selectedThietBi ? selectedThietBi.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('danhSachThietBiPhanMemFormModal.chi_tiet_ban_quyen');
    return selectedThietBi ? t('danhSachThietBiPhanMemFormModal.cap_nhat_ban_quyen') : t('danhSachThietBiPhanMemFormModal.them_moi_ban_quyen');
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
              name="idTaiSanPhanMem"
              label={t('danhSachThietBiPhanMemFormModal.mau_tai_san_phan')}
              rules={[{ required: true, message: t('danhSachThietBiPhanMemFormModal.vui_long_chon_mau') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('danhSachThietBiPhanMemFormModal.chon_mau_phan_mem')}
                options={mauPhanMemOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idNhaCungCap" label={t('donHangMuaSamPage.nha_cung_cap')}>
              <Select
                disabled={isView}
                placeholder={t('donHangMuaSamFormModal.chon_nha_cung_cap')}
                options={nhaCungCapOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="keyBanQuyen"
              label={t('danhSachThietBiPhanMemFormModal.key_ban_quyen_license')}
              rules={[
                { required: true, message: t('danhSachThietBiPhanMemFormModal.vui_long_nhap_key') },
                { max: 255, message: t('danhSachThietBiPhanMemFormModal.key_ban_quyen_khong') },
              ]}
            >
              <Input disabled={isView} placeholder={t('danhSachThietBiPhanMemFormModal.nhap_ma_key_ban')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maChungTuMua"
              label={t('danhSachThietBiPhanMemFormModal.ma_chung_tu_mua')}
              rules={[{ max: 100, message: t('danhSachThietBiPhanMemFormModal.ma_chung_tu_khong') }]}
            >
              <Input disabled={isView} placeholder={t('danhSachThietBiPhanMemFormModal.nhap_ma_hoa_donchung')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tongSoGhe"
              label={t('danhSachThietBiPhanMemFormModal.tong_so_ghe_license')}
              rules={[
                { required: true, message: t('danhSachThietBiPhanMemFormModal.vui_long_nhap_so') },
                { type: 'number', min: 1, message: t('danhSachThietBiPhanMemFormModal.tong_so_ghe_phai') }
              ]}
            >
              <InputNumber disabled={isView} style={{ width: '100%' }} placeholder={t('danhSachThietBiPhanMemFormModal.so_luong_may_duoc')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="giaMua" label={t('linhKienPhanCungFormModal.gia_mua_vnd')}>
              <InputNumber
                disabled={isView}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                placeholder={t('linhKienPhanCungFormModal.nhap_gia_mua')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="thoiGianMua" label={t('linhKienPhanCungPage.thoi_gian_mua')}>
              <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="thoiGianHetHan" label={t('danhSachThietBiPhanMemFormModal.thoi_gian_het_han')}>
              <DatePicker disabled={isView} style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 12 : 24}>
            <Form.Item name="trangThaiKho" label={t('linhKienPhanCungPage.trang_thai_kho')}>
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: t('danhSachThietBiPhanMemFormModal.chua_kich_hoat_trong') },
                { value: 'CAP_PHAT', label: t('danhSachThietBiPhanMemFormModal.dang_hoat_dong_da') },
                { value: 'THANH_LY', label: t('danhSachThietBiPhanMemPage.da_huyhet_han') },
              ]} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={12}>
              <Form.Item
                name="trangThai"
                label={t('linhKienPhanCungPage.trang_thai_van_hanh')}
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: t('userManagementPage.hoat_dong') },
                  { value: 'KHOA', label: t('viTriManagementPage.khoa') },
                  { value: 'CAP_PHAT', label: t('dashboardPage.cap_phat') },
                ]} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default DanhSachThietBiPhanMemFormModal;
