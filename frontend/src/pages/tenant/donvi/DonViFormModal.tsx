import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Typography, Button } from 'antd';
import type { DonViResponse } from '../../../api-generated/models/donViResponse';
import type { DonViUpdateRequest } from '../../../api-generated/models/donViUpdateRequest';

const { Title } = Typography;

interface DonViFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDonVi: DonViResponse | null;
  onSave: (values: DonViUpdateRequest) => Promise<void>;
}

export const DonViFormModal: React.FC<DonViFormModalProps> = ({
  open,
  onCancel,
  selectedDonVi,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DonViUpdateRequest>();

  useEffect(() => {
    if (open) {
      if (selectedDonVi) {
        form.setFieldsValue({
          tenPhapLy: selectedDonVi.tenPhapLy,
          tenThuongMai: selectedDonVi.tenThuongMai,
          maSoThue: selectedDonVi.maSoThue,
          emailChinhThuc: selectedDonVi.emailChinhThuc,
          soDienThoaiDiDong: selectedDonVi.soDienThoaiDiDong,
          soDienThoaiCoDinh: selectedDonVi.soDienThoaiCoDinh,
          tenMienHeThong: selectedDonVi.tenMienHeThong,
          duongDanWebsite: selectedDonVi.duongDanWebsite,
          soNhaTenDuong: selectedDonVi.soNhaTenDuong,
          phuongXa: selectedDonVi.phuongXa,
          quanHuyen: selectedDonVi.quanHuyen,
          tinhThanhPho: selectedDonVi.tinhThanhPho,
          hoNguoiDaiDien: selectedDonVi.hoNguoiDaiDien,
          tenDemNguoiDaiDien: selectedDonVi.tenDemNguoiDaiDien,
          tenNguoiDaiDien: selectedDonVi.tenNguoiDaiDien,
          chucVuNguoiDaiDien: selectedDonVi.chucVuNguoiDaiDien,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedDonVi, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as DonViUpdateRequest);
    } catch (e) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title={t('donViFormModal.cap_nhat_thong_tin')}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận lưu
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
          Thông tin cơ bản
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenPhapLy"
              label={t('donViFormModal.ten_phap_ly_don')}
              rules={[{ required: true, message: t('dangKyDonViPage.vui_long_nhap_ten_phap_ly') }]}
            >
              <Input placeholder={t('donViFormModal.vi_du_cong_ty')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tenThuongMai" label={t('donViFormModal.ten_thuong_mai_ten')}>
              <Input placeholder={t('donViFormModal.vi_du_cty_a')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="maSoThue" label={t('donViManagementPage.ma_so_thue')}>
              <Input placeholder={t('donViFormModal.nhap_ma_so_thue')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenMienHeThong"
              label={t('donViFormModal.ten_mien_he_thong')}
              rules={[{ required: true, message: t('dangKyPage.vui_long_nhap_ten_mien') }]}
            >
              <Input placeholder={t('donViFormModal.vi_du_congtyacom')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="emailChinhThuc" label={t('donViFormModal.email_chinh_thuc')}>
              <Input type="email" placeholder="contact@congtya.com" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="soDienThoaiDiDong" label={t('donViManagementPage.sdt_di_dong')}>
              <Input placeholder={t('donViFormModal.so_dien_thoai_di')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="soDienThoaiCoDinh" label={t('donViManagementPage.sdt_co_dinh')}>
              <Input placeholder={t('donViFormModal.so_dien_thoai_co')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="duongDanWebsite" label={t('donViFormModal.duong_dan_website')}>
              <Input placeholder="http://congtya.com" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          Người đại diện pháp luật
        </Title>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="hoNguoiDaiDien" label={t('donViFormModal.ho')}>
              <Input placeholder={t('donViFormModal.vi_du_nguyen')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tenDemNguoiDaiDien" label={t('donViFormModal.ten_dem')}>
              <Input placeholder={t('donViFormModal.vi_du_van')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tenNguoiDaiDien" label={t('donViFormModal.ten')} rules={[{ required: true, message: t('donViFormModal.vui_long_nhap_ten') }]}>
              <Input placeholder={t('donViFormModal.vi_du_a')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="chucVuNguoiDaiDien" label={t('donViFormModal.chuc_vu')}>
              <Input placeholder={t('donViFormModal.vi_du_giam_doc')} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          Địa chỉ trụ sở chính
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="tinhThanhPho" label={t('donViFormModal.tinh_thanh_pho')}>
              <Input placeholder={t('donViFormModal.ha_noi')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="quanHuyen" label={t('donViFormModal.quan_huyen')}>
              <Input placeholder={t('donViFormModal.cau_giay')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="phuongXa" label={t('donViFormModal.phuong_xa')}>
              <Input placeholder={t('donViFormModal.dich_vong')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="soNhaTenDuong" label={t('donViFormModal.so_nha_ten_duong')}>
              <Input placeholder={t('donViFormModal.so_1_tran_duy')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DonViFormModal;
