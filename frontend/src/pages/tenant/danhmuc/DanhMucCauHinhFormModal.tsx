import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col } from 'antd';
import type { DanhMucCauHinhResponse } from '../../../api-generated/models/danhMucCauHinhResponse';
import type { DanhMucCauHinhRequest } from '../../../api-generated/models/danhMucCauHinhRequest';

interface DanhMucCauHinhFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedRecord: DanhMucCauHinhResponse | null;
  onSave: (values: DanhMucCauHinhRequest) => Promise<void>;
}

export const DanhMucCauHinhFormModal: React.FC<DanhMucCauHinhFormModalProps> = ({
  open,
  onCancel,
  selectedRecord,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<DanhMucCauHinhRequest>();

  useEffect(() => {
    if (open) {
      if (selectedRecord) {
        form.setFieldsValue({
          maCauHinh: selectedRecord.maCauHinh,
          tenCauHinh: selectedRecord.tenCauHinh,
          moTaCauHinh: selectedRecord.moTaCauHinh,
          nhomCauHinh: selectedRecord.nhomCauHinh,
          loaiDuLieu: selectedRecord.loaiDuLieu,
          giaTriMacDinh: selectedRecord.giaTriMacDinh,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as DanhMucCauHinhRequest);
    } catch (e) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title={selectedRecord ? t('danhMucCauHinhFormModal.cap_nhat_danh_muc') : t('danhMucCauHinhFormModal.them_moi_danh_muc')}
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
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="maCauHinh"
          label={t('danhMucCauHinhFormModal.ma_dinh_danh_cau')}
          rules={[{ required: true, message: t('danhMucCauHinhFormModal.vui_long_nhap_ma') }]}
        >
          <Input placeholder={t('danhMucCauHinhFormModal.vi_du_system_smtp_port')} disabled={!!selectedRecord} />
        </Form.Item>

        <Form.Item
          name="tenCauHinh"
          label={t('danhMucCauHinhPage.ten_cau_hinh')}
          rules={[{ required: true, message: t('danhMucCauHinhFormModal.vui_long_nhap_ten') }]}
        >
          <Input placeholder={t('danhMucCauHinhFormModal.vi_du_cong_smtp')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nhomCauHinh"
              label={t('danhMucCauHinhFormModal.nhom_cau_hinh')}
              rules={[{ required: true, message: t('danhMucCauHinhFormModal.vui_long_chon_nhom') }]}
            >
              <Select
                placeholder={t('danhMucCauHinhFormModal.chon_nhom')}
                options={[
                  { value: 'HE_THONG', label: t('danhMucCauHinhFormModal.cau_hinh_he_thong') },
                  { value: 'BMTT', label: t('danhMucCauHinhFormModal.bao_mat_xac_thuc') },
                  { value: 'EMAIL', label: t('danhMucCauHinhFormModal.email_thong_bao') },
                  { value: 'TIEU_CHUAN', label: t('danhMucCauHinhFormModal.tieu_chuan_quy_trinh') },
                  { value: 'KHAC', label: t('viTriFormModal.khac') },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="loaiDuLieu"
              label={t('danhMucCauHinhPage.loai_du_lieu')}
              rules={[{ required: true, message: t('danhMucCauHinhFormModal.vui_long_chon_loai') }]}
            >
              <Select
                placeholder={t('danhMucCauHinhFormModal.chon_loai_du_lieu')}
                options={[
                  { value: 'STRING', label: t('danhMucCauHinhFormModal.chuoi_ky_tu_string') },
                  { value: 'NUMBER', label: t('danhMucCauHinhFormModal.so_number') },
                  { value: 'BOOLEAN', label: t('danhMucCauHinhFormModal.dungsai_boolean') },
                  { value: 'JSON', label: t('danhMucCauHinhFormModal.cau_truc_json') },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="giaTriMacDinh" label={t('danhMucCauHinhFormModal.gia_tri_mac_dinh')}>
          <Input placeholder={t('danhMucCauHinhFormModal.vi_du_587_hoac')} />
        </Form.Item>

        <Form.Item name="moTaCauHinh" label={t('danhMucCauHinhFormModal.mo_ta_chuc_nang')}>
          <Input.TextArea rows={3} placeholder={t('danhMucCauHinhFormModal.mo_ta_cong_dung')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DanhMucCauHinhFormModal;
