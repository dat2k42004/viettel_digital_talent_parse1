import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Switch, message, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { authStore, QUYEN } from '../../../../stores/AuthStore';
import { axiosInstance } from '../../../../api/axiosInstance';
import type { TaiSanPhanCungResponse } from '../../../../api-generated/models/taiSanPhanCungResponse';
import type { TaiSanPhanCungRequest } from '../../../../api-generated/models/taiSanPhanCungRequest';
import type { SelectOption } from '../../../../api-generated/models/selectOption';
import { laySelectOptions9 } from '../../../../api-generated/endpoints/hang-san-xuat-controller/hang-san-xuat-controller';
import { laySelectOptions7 } from '../../../../api-generated/endpoints/loai-tai-san-controller/loai-tai-san-controller';
import { laySelectOptions11 } from '../../../../api-generated/endpoints/danh-muc-tai-san-controller/danh-muc-tai-san-controller';

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

  // Dropdown options
  const [hangOptions, setHangOptions] = useState<SelectOption[]>([]);
  const [loaiOptions, setLoaiOptions] = useState<SelectOption[]>([]);
  const [danhmucOptions, setDanhmucOptions] = useState<SelectOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hangRes, loaiRes, dmRes] = await Promise.all([
          laySelectOptions9(),
          laySelectOptions7(),
          laySelectOptions11(),
        ]);
        if (hangRes.data) setHangOptions(hangRes.data);
        if (loaiRes.data) setLoaiOptions(loaiRes.data);
        if (dmRes.data) setDanhmucOptions(dmRes.data);
      } catch (e) {
        message.error(t('taiSanPhanMemFormModal.khong_the_tai_danh'));
      }
    };
    if (open) {
      fetchOptions();
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
                options={hangOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
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
                options={loaiOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
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
                options={danhmucOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hinhAnh" label={t('taiSanPhanMemFormModal.hinh_anh_mau')}>
              {isView ? (
                form.getFieldValue('hinhAnh') ? (
                  <div style={{ marginTop: 8 }}>
                    <img src={form.getFieldValue('hinhAnh')} alt={t('phieuNhapTaiSanFormModal.mau_phan_cung')} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'contain' }} />
                  </div>
                ) : (
                  <span>{t('taiSanPhanMemFormModal.khong_co_hinh_anh')}</span>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Input
                    value={imageUrl}
                    disabled
                    placeholder={t('taiSanPhanMemFormModal.url_hinh_anh_se')}
                  />
                  {authStore.kiemTraQuyen(QUYEN.TAI_LEN_FILE) ? (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={async (file) => {
                        const formData = new FormData();
                        formData.append('files', file);
                        setUploading(true);
                        try {
                          const res = await axiosInstance.post('/api/files/upload', formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });
                          if (res.data && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
                            const uploadedUrl = res.data.data[0];
                            form.setFieldValue('hinhAnh', uploadedUrl);
                            setImageUrl(uploadedUrl);
                            message.success(t('taiSanPhanMemFormModal.tai_anh_len_thanh'));
                          } else {
                            message.error(t('taiSanPhanMemFormModal.tai_anh_that_bai'));
                          }
                        } catch (err: any) {
                          message.error(err?.message || t('taiSanPhanMemFormModal.loi_khi_tai_anh'));
                        } finally {
                          setUploading(false);
                        }
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading}>
                        Tải ảnh lên (Upload)
                      </Button>
                    </Upload>
                  ) : (
                    <Typography.Text type="secondary">{t('taiSanPhanMemFormModal.ban_khong_co_quyen')}</Typography.Text>
                  )}
                  {imageUrl && (
                    <div style={{ marginTop: 4 }}>
                      <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 80, borderRadius: 8, objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="coTheThaoLap" label={t('taiSanPhanCungFormModal.co_the_thao_lap')} valuePropName="checked">
              <Switch disabled={isView} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={6}>
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

        <Form.Item name="moTa" label={t('taiSanPhanMemFormModal.mo_ta_mau_tai')}>
          <Input.TextArea disabled={isView} rows={3} placeholder={t('taiSanPhanMemFormModal.mo_ta_thong_so')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaiSanPhanCungFormModal;
