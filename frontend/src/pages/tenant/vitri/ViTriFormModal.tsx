import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Select, Row, Col } from 'antd';
import type { ViTriResponse } from '../../../api-generated/models/viTriResponse';
import type { ViTriRequest } from '../../../api-generated/models/viTriRequest';

interface ViTriFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedViTri: ViTriResponse | null;
  onSave: (values: ViTriRequest) => Promise<void>;
}

export const ViTriFormModal: React.FC<ViTriFormModalProps> = ({
  open,
  onCancel,
  selectedViTri,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ViTriRequest>();

  useEffect(() => {
    if (open) {
      if (selectedViTri) {
        form.setFieldsValue({
          maViTri: selectedViTri.maViTri,
          tenViTri: selectedViTri.tenViTri,
          tenTiengAnh: selectedViTri.tenTiengAnh,
          loaiViTri: selectedViTri.loaiViTri,
          sucChuaToiDa: selectedViTri.sucChuaToiDa,
          dienTichM2: selectedViTri.dienTichM2,
          moTaChiTiet: selectedViTri.moTaChiTiet,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedViTri, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as ViTriRequest);
    } catch (e) {
      // Validation failed
    }
  };

  return (
    <Modal
      title={selectedViTri ? t('viTriFormModal.cap_nhat_vi_tri') : t('viTriFormModal.them_moi_vi_tri')}
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
      width={650}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {selectedViTri && (
          <Form.Item name="maViTri" label={t('viTriFormModal.ma_vi_tri')}>
            <Input disabled placeholder={t('viTriFormModal.ma_vi_tri_tu')} />
          </Form.Item>
        )}

        <Form.Item
          name="tenViTri"
          label={t('viTriManagementPage.ten_vi_tri')}
          rules={[{ required: true, message: t('viTriFormModal.vui_long_nhap_ten') }]}
        >
          <Input placeholder={t('viTriFormModal.vi_du_kho_a')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="loaiViTri"
              label={t('viTriManagementPage.loai_vi_tri')}
              rules={[{ required: true, message: t('viTriFormModal.vui_long_chon_loai') }]}
            >
              <Select
                placeholder={t('viTriFormModal.chon_loai_vi_tri')}
                options={[
                  { value: 'KHO', label: t('viTriFormModal.kho_bai_warehouse') },
                  { value: 'PHONG_MAY', label: t('viTriFormModal.phong_may_server_room') },
                  { value: 'KE_TU', label: t('viTriManagementPage.ke_tu_rack') },
                  { value: 'VAN_PHONG', label: t('viTriFormModal.van_phong_lam_viec') },
                  { value: 'KHAC', label: t('viTriFormModal.khac') },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tenTiengAnh" label={t('viTriFormModal.ten_tieng_anh')}>
              <Input placeholder={t('viTriFormModal.vi_du_warehouse_a')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sucChuaToiDa" label={t('viTriFormModal.suc_chua_toi_da')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('viTriFormModal.vi_du_1000')} min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dienTichM2" label={t('viTriManagementPage.dien_tich_m')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('viTriFormModal.vi_du_50')} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="moTaChiTiet" label={t('viTriFormModal.mo_ta_chi_tiet')}>
          <Input.TextArea rows={3} placeholder={t('viTriFormModal.mo_ta_thong_tin')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ViTriFormModal;
