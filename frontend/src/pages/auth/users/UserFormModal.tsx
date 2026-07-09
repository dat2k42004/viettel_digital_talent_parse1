import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Button } from 'antd';
import type { NguoiDungResponse } from '../../../api-generated/models/nguoiDungResponse';
import type { VaiTroDropdownResponse } from '../../../api-generated/models/vaiTroDropdownResponse';
import type { NguoiDungRequest } from '../../../api-generated/models/nguoiDungRequest';

interface UserFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedUser: NguoiDungResponse | null;
  danhSachVaiTro: VaiTroDropdownResponse[];
  danhSachPhongBan: any[];
  onSave: (values: NguoiDungRequest) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onCancel,
  selectedUser,
  danhSachVaiTro,
  danhSachPhongBan,
  onSave
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<any>();

  useEffect(() => {
    if (open) {
      if (selectedUser) {
        form.setFieldsValue({
          tenDangNhap: selectedUser.tenDangNhap,
          maNguoiDung: selectedUser.maNguoiDung,
          hoNguoiDung: selectedUser.hoNguoiDung,
          tenDemNguoiDung: selectedUser.tenDemNguoiDung,
          tenNguoiDung: selectedUser.tenNguoiDung,
          chucVu: selectedUser.chucVu,
          email: selectedUser.email,
          soDienThoai: selectedUser.soDienThoai,
          idPhongBan: selectedUser.idPhongBan,
          danhSachIdVaiTro: (selectedUser.danhSachVaiTro?.map(v => v.id).filter(Boolean) || []) as number[],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, selectedUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as NguoiDungRequest);
    } catch (e) {
      // Báo lỗi validation
    }
  };

  return (
    <Modal
      title={selectedUser ? t('userFormModal.cap_nhat_thong_tin') : t('userFormModal.them_moi_tai_khoan')}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Xác nhận lưu
        </Button>
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenDangNhap"
              label={t('donViCreateModal.ten_dang_nhap')}
              rules={[{ required: true, message: t('donViCreateModal.vui_long_nhap_ten') }]}
            >
              <Input disabled={!!selectedUser} placeholder={t('userFormModal.vi_du_hungnv')} />
            </Form.Item>
          </Col>
          {!selectedUser ? (
            <Col span={12}>
              <Form.Item
                name="matKhau"
                label={t('userFormModal.mat_khau_khoi_tao')}
                rules={[{ required: true, message: t('userFormModal.vui_long_nhap_mat') }]}
              >
                <Input.Password placeholder={t('userFormModal.mat_khau_khoi_tao')} />
              </Form.Item>
            </Col>
          ) : (
            <Col span={12}>
              <Form.Item
                name="maNguoiDung"
                label={t('userManagementPage.ma_nhan_vien')}
              >
                <Input disabled placeholder={t('userFormModal.he_thong_tu_dong')} />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="hoNguoiDung" label={t('donViFormModal.ho')}>
              <Input placeholder={t('donViFormModal.vi_du_nguyen')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tenDemNguoiDung" label={t('donViFormModal.ten_dem')}>
              <Input placeholder={t('donViFormModal.vi_du_van')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="tenNguoiDung"
              label={t('userFormModal.ten_chinh')}
              rules={[{ required: true, message: t('userFormModal.vui_long_nhap_ten') }]}
            >
              <Input placeholder={t('userFormModal.vi_du_hung')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={t('appLayout.email')}
              rules={[{ type: 'email', message: t('userFormModal.dia_chi_email_khong') }]}
            >
              <Input placeholder={t('userFormModal.vi_du_hungnvcongtycom')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soDienThoai" label={t('userFormModal.so_dien_thoai_lien')}>
              <Input placeholder={t('nhaCungCapFormModal.vi_du_0987654321')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="chucVu" label={t('userFormModal.chuc_danh_cong_viec')}>
              <Input placeholder={t('userFormModal.vi_du_chuyen_vien')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idPhongBan" label={t('userFormModal.phong_ban_lam_viec')}>
              <Select
                placeholder={t('userFormModal.chon_phong_ban')}
                allowClear
                showSearch
                optionFilterProp="children"
                options={danhSachPhongBan.map(pb => ({ value: pb.id, label: pb.tenPhongBan }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="danhSachIdVaiTro"
          label={t('userFormModal.danh_sach_vai_tro')}
          rules={[{ required: true, message: t('userFormModal.vui_long_chon_it') }]}
        >
          <Select
            mode="multiple"
            placeholder={t('userFormModal.chon_vai_tro')}
            style={{ width: '100%' }}
            options={danhSachVaiTro.map(v => ({ value: v.id, label: v.tenVaiTro }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
