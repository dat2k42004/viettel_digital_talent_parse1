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
      title="Cập nhật thông tin Đơn vị"
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
              label="Tên pháp lý Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập tên pháp lý!' }]}
            >
              <Input placeholder="Ví dụ: Công ty Cổ phần A" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tenThuongMai" label="Tên thương mại / Tên viết tắt">
              <Input placeholder="Ví dụ: Cty A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="maSoThue" label="Mã số thuế">
              <Input placeholder="Nhập mã số thuế doanh nghiệp" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenMienHeThong"
              label="Tên miền hệ thống"
              rules={[{ required: true, message: 'Vui lòng nhập tên miền!' }]}
            >
              <Input placeholder="Ví dụ: congtya.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="emailChinhThuc" label="Email chính thức">
              <Input type="email" placeholder="contact@congtya.com" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="soDienThoaiDiDong" label="SĐT di động">
              <Input placeholder="Số điện thoại di động" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="soDienThoaiCoDinh" label="SĐT cố định">
              <Input placeholder="Số điện thoại cố định" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="duongDanWebsite" label="Đường dẫn Website">
              <Input placeholder="http://congtya.com" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          Người đại diện pháp luật
        </Title>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="hoNguoiDaiDien" label="Họ">
              <Input placeholder="Ví dụ: Nguyễn" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tenDemNguoiDaiDien" label="Tên đệm">
              <Input placeholder="Ví dụ: Văn" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="tenNguoiDaiDien" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
              <Input placeholder="Ví dụ: A" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="chucVuNguoiDaiDien" label="Chức vụ">
              <Input placeholder="Ví dụ: Giám đốc" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginTop: 16, marginBottom: 16 }}>
          Địa chỉ trụ sở chính
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="tinhThanhPho" label="Tỉnh / Thành phố">
              <Input placeholder="Hà Nội" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="quanHuyen" label="Quận / Huyện">
              <Input placeholder="Cầu Giấy" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="phuongXa" label="Phường / Xã">
              <Input placeholder="Dịch Vọng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="soNhaTenDuong" label="Số nhà, tên đường">
              <Input placeholder="Số 1 Trần Duy Hưng" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DonViFormModal;
