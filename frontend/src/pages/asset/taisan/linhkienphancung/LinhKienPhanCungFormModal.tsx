import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { LinhKienPhanCungResponse } from '../../../../api-generated/models/linhKienPhanCungResponse';
import type { LinhKienPhanCungRequest } from '../../../../api-generated/models/linhKienPhanCungRequest';
import { laySelectOptions3 } from '../../../../api-generated/endpoints/tai-san-phan-cung-controller/tai-san-phan-cung-controller';
import { laySelectOptions5 } from '../../../../api-generated/endpoints/nha-cung-cap-controller/nha-cung-cap-controller';
import { useSearchableSelect } from '../../../../hooks/useSearchableSelect';

interface LinhKienPhanCungFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedLinhKien: LinhKienPhanCungResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: LinhKienPhanCungRequest) => Promise<void>;
}

export const LinhKienPhanCungFormModal: React.FC<LinhKienPhanCungFormModalProps> = ({
  open,
  onCancel,
  selectedLinhKien,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<LinhKienPhanCungRequest>();
  const isView = mode === 'view';

  const mauPhanCung = useSearchableSelect(laySelectOptions3 as any);
  const nhaCungCap = useSearchableSelect(laySelectOptions5 as any);

  useEffect(() => {
    if (open) {
      Promise.all([
        mauPhanCung.fetchOptions(),
        nhaCungCap.fetchOptions(),
      ]).catch(() => message.error(t('linhKienPhanCungFormModal.khong_the_tai_danh')));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (selectedLinhKien) {
        form.setFieldsValue({
          idTaiSanPhanCung: selectedLinhKien.idTaiSanPhanCung,
          idNhaCungCap: selectedLinhKien.idNhaCungCap,
          soSerial: selectedLinhKien.soSerial,
          giaMua: selectedLinhKien.giaMua ? Number(selectedLinhKien.giaMua) : undefined,
          thoiGianMua: selectedLinhKien.thoiGianMua ? dayjs(selectedLinhKien.thoiGianMua) as any : undefined,
          hanBaoHanhThang: selectedLinhKien.hanBaoHanhThang,
          trangThaiKho: selectedLinhKien.trangThaiKho || 'TON_KHO',
          viTriKho: selectedLinhKien.viTriKho,
          trangThai: selectedLinhKien.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThaiKho: 'TON_KHO', trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedLinhKien, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoiGianMua: values.thoiGianMua ? dayjs(values.thoiGianMua).format('YYYY-MM-DD') : undefined,
        trangThai: selectedLinhKien ? selectedLinhKien.trangThai : 'HOAT_DONG',
      };
      await onSave(payload as any);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('linhKienPhanCungFormModal.chi_tiet_linh_kien');
    return selectedLinhKien ? t('linhKienPhanCungFormModal.cap_nhat_linh_kien') : t('linhKienPhanCungFormModal.them_moi_linh_kien');
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
              name="idTaiSanPhanCung"
              label={t('linhKienPhanCungFormModal.mau_thiet_bi_goc')}
              rules={[{ required: true, message: t('linhKienPhanCungFormModal.vui_long_chon_mau') }]}
            >
              <Select
                disabled={isView}
                placeholder={t('linhKienPhanCungFormModal.chon_mau_linh_kien')}
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
          <Col span={24}>
            <Form.Item
              name="soSerial"
              label={t('baoCaoPage.so_serial')}
              rules={[
                { required: true, message: t('linhKienPhanCungFormModal.vui_long_nhap_so') },
                { max: 100, message: t('linhKienPhanCungFormModal.so_serial_khong_vuot') }
              ]}
            >
              <Input disabled={isView} placeholder={t('linhKienPhanCungFormModal.nhap_so_serial_linh')} />
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
              <InputNumber disabled={isView} style={{ width: '100%' }} min={0} placeholder={t('linhKienPhanCungFormModal.han_bao_hanh')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="trangThaiKho" label={t('linhKienPhanCungPage.trang_thai_kho')}>
              <Select disabled={isView} options={[
                { value: 'TON_KHO', label: t('linhKienPhanCungFormModal.ton_kho_san_sang') },
                { value: 'CAP_PHAT', label: t('linhKienPhanCungFormModal.da_lap_rap_lien') },
                { value: 'BAO_TRI', label: t('linhKienPhanCungPage.dang_bao_tri') },
                { value: 'THANH_LY', label: t('linhKienPhanCungPage.da_thanh_ly') },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item name="viTriKho" label={t('baoCaoPage.vi_tri_kho')}>
              <Input disabled={isView} placeholder={t('linhKienPhanCungFormModal.vi_tri_luu_tru')} />
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

export default LinhKienPhanCungFormModal;
