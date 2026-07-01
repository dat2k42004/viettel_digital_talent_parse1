import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select } from 'antd';
import type { DanhMucTaiSanResponse } from '../../../api-generated/models/danhMucTaiSanResponse';
import type { DanhMucTaiSanRequest } from '../../../api-generated/models/danhMucTaiSanRequest';

interface DanhMucTaiSanFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedDanhMucTaiSan: DanhMucTaiSanResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhMucTaiSanRequest) => Promise<void>;
}

export const DanhMucTaiSanFormModal: React.FC<DanhMucTaiSanFormModalProps> = ({
  open,
  onCancel,
  selectedDanhMucTaiSan,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<DanhMucTaiSanRequest>();
  const isView = mode === 'view';

  useEffect(() => {
    if (open) {
      if (selectedDanhMucTaiSan) {
        form.setFieldsValue({
          maDanhMuc: selectedDanhMucTaiSan.maDanhMuc,
          tenDanhMuc: selectedDanhMucTaiSan.tenDanhMuc,
          moTa: selectedDanhMucTaiSan.moTa,
          trangThai: selectedDanhMucTaiSan.trangThai || 'HOAT_DONG',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 'HOAT_DONG' });
      }
    }
  }, [open, selectedDanhMucTaiSan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave({
        ...values,
        trangThai: selectedDanhMucTaiSan ? selectedDanhMucTaiSan.trangThai : 'HOAT_DONG',
      } as DanhMucTaiSanRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết danh mục tài sản';
    return selectedDanhMucTaiSan ? 'Cập nhật danh mục tài sản' : 'Thêm mới danh mục tài sản';
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
      width={650}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maDanhMuc"
              label="Mã danh mục"
            >
              <Input disabled placeholder="Mã hệ thống tự động sinh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tenDanhMuc"
              label="Tên danh mục"
              rules={[
                { required: true, message: 'Vui lòng nhập tên danh mục!' },
                { max: 100, message: 'Tên danh mục không vượt quá 100 ký tự!' },
              ]}
            >
              <Input disabled={isView} placeholder="Nhập tên danh mục tài sản" />
            </Form.Item>
          </Col>
        </Row>

        {isView && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="trangThai"
                label="Trạng thái"
              >
                <Select disabled options={[
                  { value: 'HOAT_DONG', label: 'Đang hoạt động' },
                  { value: 'KHOA', label: 'Tạm khóa' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item name="moTa" label="Mô tả danh mục">
          <Input.TextArea disabled={isView} rows={3} placeholder="Nhập mô tả chi tiết danh mục..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DanhMucTaiSanFormModal;
