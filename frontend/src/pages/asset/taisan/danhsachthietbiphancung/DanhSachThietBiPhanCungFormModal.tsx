import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { DanhSachThietBiPhanCungResponse } from '../../../../api-generated/models/danhSachThietBiPhanCungResponse';
import type { DanhSachThietBiPhanCungRequest } from '../../../../api-generated/models/danhSachThietBiPhanCungRequest';
import { laySelectOptions3 } from '../../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { useSearchableSelect } from '../../../../hooks/useSearchableSelect';

interface DanhSachThietBiPhanCungFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThietBi: DanhSachThietBiPhanCungResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhSachThietBiPhanCungRequest) => Promise<void>;
}

export const DanhSachThietBiPhanCungFormModal: React.FC<DanhSachThietBiPhanCungFormModalProps> = ({
  open,
  onCancel,
  selectedThietBi,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DanhSachThietBiPhanCungRequest>();
  const isView = mode === 'view';

  const mauPhanCung = useSearchableSelect(laySelectOptions3 as any);
  const nhaCungCap = useSearchableSelect(laySelectOptions5 as any);

  useEffect(() => {
    if (open) {
      Promise.all([
        mauPhanCung.fetchOptions(),
        nhaCungCap.fetchOptions(),
      ]).catch(() => message.error(t('danhSachThietBiPhanCungFormModal.khong_the_tai_danh')));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedThietBi) {
        form.setFieldsValue({
          idTaiSanPhanCung: selectedThietBi.idTaiSanPhanCung,
          idNhaCungCap: selectedThietBi.idNhaCungCap,
          soSerial: selectedThietBi.soSerial,
          maTheTaiSan: selectedThietBi.maTheTaiSan,
          giaMua: selectedThietBi.giaMua ? Number(selectedThietBi.giaMua) : undefined,
          thoiGianMua: selectedThietBi.thoiGianMua ? dayjs(selectedThietBi.thoiGianMua) as any : undefined,
          hanBaoHanhThang: selectedThietBi.hanBaoHanhThang,
          trangThaiKho: selectedThietBi.trangThaiKho || 'TON_KHO',
          viTriKho: selectedThietBi.viTriKho,
          trangThai: selectedThietBi.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedThietBi, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        trangThai: selectedThietBi ? selectedThietBi.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('danhSachThietBiPhanCungFormModal.chi_tiet_thiet_bi');
    return selectedThietBi ? t('danhSachThietBiPhanCungFormModal.cap_nhat_thiet_bi') : t('danhSachThietBiPhanCungFormModal.them_moi_thiet_bi');
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
              name="idTaiSanPhanCung"
              label={t('danhSachThietBiPhanCungFormModal.mau_tai_san_phan')}
              rules={[{ required: true, message: t('danhSachThietBiPhanCungFormModal.vui_long_chon_mau') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('keHoachBaoTriFormModal.chon_mau_tai_san')}
                showSearch
                filterOption={false}
                onSearch={mauPhanCung.handleSearch}
                loading={mauPhanCung.loading}
                options={mauPhanCung.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idNhaCungCap" label={t('donHangMuaSamPage.nha_cung_cap')}>
              <Select
                disabled={isView}
                placeholder={t('donHangMuaSamFormModal.chon_nha_cung_cap')}
                showSearch
                filterOption={false}
                onSearch={nhaCungCap.handleSearch}
                loading={nhaCungCap.loading}
                options={nhaCungCap.options.map((opt) => ({ value: opt.id, label: opt.ten }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="soSerial"
              label={t('baoCaoPage.so_serial')}
              rules={[
                { required: true, message: t('linhKienPhanCungFormModal.vui_long_nhap_so') },
                { max: 100, message: t('danhSachThietBiPhanCungFormModal.serial_khong_vuot_qua') },
              ]}
            >
              <Input disabled={isView} placeholder={t('danhSachThietBiPhanCungFormModal.nhap_so_serial_thiet')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maTheTaiSan"
              label={t('baoCaoPage.ma_the_tai_san')}
            >
              <Input disabled placeholder={t('danhSachThietBiPhanCungFormModal.ma_the_tu_dong')} />
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
            <Form.Item name="hanBaoHanhThang" label={t('linhKienPhanCungFormModal.han_bao_hanh_thang')}>
              <InputNumber disabled={isView} style={{ width: '100%' }} min={0} placeholder={t('danhSachThietBiPhanCungFormModal.so_thang_bao_hanh')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="trangThaiKho" label={t('linhKienPhanCungPage.trang_thai_kho')}>
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: t('linhKienPhanCungPage.ton_kho') },
                { value: 'CAP_PHAT', label: t('dashboardPage.dang_cap_phat') },
                { value: 'BAO_TRI', label: t('linhKienPhanCungPage.dang_bao_tri') },
                { value: 'THANH_LY', label: t('linhKienPhanCungPage.da_thanh_ly') },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="viTriKho" label={t('baoCaoPage.vi_tri_kho')}>
              <Input disabled={isView} placeholder={t('danhSachThietBiPhanCungFormModal.nhap_vi_tri_luu')} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={8}>
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

export default DanhSachThietBiPhanCungFormModal;
