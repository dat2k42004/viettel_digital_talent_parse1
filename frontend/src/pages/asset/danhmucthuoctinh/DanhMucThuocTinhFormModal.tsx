import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Switch, Card, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DanhMucThuocTinhResponse } from '../../../api-generated/models/danhMucThuocTinhResponse';
import type { DanhMucThuocTinhRequest } from '../../../api-generated/models/danhMucThuocTinhRequest';

interface DanhMucThuocTinhFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThuocTinh: DanhMucThuocTinhResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhMucThuocTinhRequest) => Promise<void>;
}

export const DanhMucThuocTinhFormModal: React.FC<DanhMucThuocTinhFormModalProps> = ({
  open,
  onCancel,
  selectedThuocTinh,
  mode,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DanhMucThuocTinhRequest>();
  const isView = mode === 'view';

  // Watch fields to dynamically show/hide Form.List for SELECT suggestions
  const kieuDuLieu = Form.useWatch('kieuDuLieu', form);

  useEffect(() => {
    if (open) {
      if (selectedThuocTinh) {
        form.setFieldsValue({
          maThuocTinh: selectedThuocTinh.maThuocTinh,
          tenThuocTinh: selectedThuocTinh.tenThuocTinh,
          kieuDuLieu: selectedThuocTinh.kieuDuLieu,
          apDungCho: selectedThuocTinh.apDungCho as any,
          batBuocNhap: selectedThuocTinh.batBuocNhap ?? false,
          giaTriMacDinh: selectedThuocTinh.giaTriMacDinh,
          trangThai: selectedThuocTinh.trangThai || 'HOAT_DONG',
          luaChonGoiY: selectedThuocTinh.luaChonGoiY?.map(item => ({
            id: item.id,
            giaTri: item.giaTri,
            trangThai: item.trangThai || 'HOAT_DONG',
            thuTuHienThi: item.thuTuHienThi || 0,
          })) || [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          batBuocNhap: false,
          trangThai: 'HOAT_DONG',
          kieuDuLieu: 'TEXT',
          apDungCho: 'PHAN_CUNG' as any,
          luaChonGoiY: [],
        });
      }
    }
  }, [open, selectedThuocTinh, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Clean suggestions list if type is not SELECT
      if (values.kieuDuLieu !== 'SELECT') {
        values.luaChonGoiY = [];
      }
      await onSave({
        ...values,
        trangThai: selectedThuocTinh ? selectedThuocTinh.trangThai : 'HOAT_DONG',
      } as DanhMucThuocTinhRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return t('danhMucThuocTinhFormModal.chi_tiet_danh_muc');
    return selectedThuocTinh ? t('danhMucThuocTinhFormModal.cap_nhat_thuoc_tinh') : t('danhMucThuocTinhFormModal.them_moi_thuoc_tinh');
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
      width={750}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenThuocTinh"
              label={t('danhMucThuocTinhFormModal.ten_thuoc_tinh_hien')}
              rules={[
                { required: true, message: t('danhMucThuocTinhFormModal.vui_long_nhap_ten') },
                { max: 100, message: t('danhMucThuocTinhFormModal.ten_thuoc_tinh_khong') }
              ]}
            >
              <Input disabled={isView} placeholder={t('danhMucThuocTinhFormModal.vi_du_dung_luong')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maThuocTinh"
              label={t('danhMucThuocTinhFormModal.ma_thuoc_tinh_duy')}
            >
              <Input disabled placeholder={t('loaiTaiSanFormModal.ma_he_thong_tu')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item
              name="kieuDuLieu"
              label={t('danhMucThuocTinhFormModal.kieu_du_lieu')}
              rules={[{ required: true, message: t('danhMucThuocTinhFormModal.vui_long_chon_kieu') }]}
            >
              <Select disabled={isView} options={[
                { value: 'TEXT', label: t('danhMucThuocTinhFormModal.van_ban_text') },
                { value: 'NUMBER', label: t('danhMucThuocTinhFormModal.so_number') },
                { value: 'SELECT', label: t('danhMucThuocTinhFormModal.lua_chon_select') },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item
              name="apDungCho"
              label={t('danhMucThuocTinhPage.ap_dung_cho_phan')}
              rules={[{ required: true, message: t('danhMucThuocTinhFormModal.vui_long_chon_phan') }]}
            >
              <Select disabled={isView} options={[
                { value: 'PHAN_CUNG', label: t('danhMucThuocTinhPage.thiet_bi_phan_cung') },
                { value: 'PHAN_MEM', label: t('danhMucThuocTinhFormModal.key_ban_quyen_phan') },
                { value: 'LINH_KIEN', label: t('danhMucThuocTinhPage.linh_kien_phan_cung') },
              ]} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={8}>
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="giaTriMacDinh"
              label={t('danhMucCauHinhPage.gia_tri_mac_dinh')}
              rules={[{ max: 255, message: t('danhMucThuocTinhFormModal.gia_tri_khong_vuot') }]}
            >
              <Input disabled={isView} placeholder={t('danhMucThuocTinhFormModal.nhap_gia_tri_mac')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="batBuocNhap" label={t('danhMucThuocTinhFormModal.bat_buoc_nhap_du')} valuePropName="checked">
              <Switch disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        {kieuDuLieu === 'SELECT' && (
          <Card title={t('danhMucThuocTinhFormModal.danh_sach_cac_tuy')} size="small" style={{ marginTop: 16 }}>
            <Form.List name="luaChonGoiY">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row gutter={8} key={field.key} align="middle" style={{ marginBottom: 8 }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'id']}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Col span={10}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'giaTri']}
                          rules={[
                            { required: true, message: t('danhMucThuocTinhFormModal.vui_long_nhap_gia') },
                            { max: 150, message: t('danhMucThuocTinhFormModal.khong_qua_150_ky') }
                          ]}
                          noStyle
                        >
                          <Input disabled={isView} placeholder={t('danhMucThuocTinhFormModal.gia_tri_hien_thi')} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'thuTuHienThi']}
                          rules={[{ required: true, message: t('danhMucThuocTinhFormModal.vui_long_nhap_thu') }]}
                          noStyle
                        >
                          <InputNumber disabled={isView} style={{ width: '100%' }} placeholder={t('danhMucThuocTinhFormModal.thu_tu_hien_thi')} min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'trangThai']}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Select disabled={isView} options={[
                            { value: 'HOAT_DONG', label: t('userManagementPage.hoat_dong') },
                            { value: 'KHOA', label: t('viTriManagementPage.khoa') },
                          ]} />
                        </Form.Item>
                      </Col>
                      {!isView && (
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </Col>
                      )}
                    </Row>
                  ))}
                  {!isView && (
                    <Form.Item style={{ marginTop: 12, marginBottom: 0 }}>
                      <Button
                        type="dashed"
                        onClick={() => add({ giaTri: '', trangThai: 'HOAT_DONG', thuTuHienThi: fields.length + 1 })}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm lựa chọn gợi ý
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </Card>
        )}
      </Form>
    </Modal>
  );
};

export default DanhMucThuocTinhFormModal;
