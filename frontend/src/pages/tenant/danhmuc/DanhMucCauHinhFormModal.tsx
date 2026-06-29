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
      title={selectedRecord ? 'Cập nhật danh mục cấu hình' : 'Thêm mới danh mục cấu hình'}
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
          label="Mã định danh cấu hình"
          rules={[{ required: true, message: 'Vui lòng nhập mã định danh!' }]}
        >
          <Input placeholder="Ví dụ: SYSTEM_SMTP_PORT" disabled={!!selectedRecord} />
        </Form.Item>

        <Form.Item
          name="tenCauHinh"
          label="Tên cấu hình"
          rules={[{ required: true, message: 'Vui lòng nhập tên cấu hình!' }]}
        >
          <Input placeholder="Ví dụ: Cổng SMTP Server" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nhomCauHinh"
              label="Nhóm cấu hình"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm cấu hình!' }]}
            >
              <Select
                placeholder="Chọn nhóm"
                options={[
                  { value: 'HE_THONG', label: 'Cấu hình Hệ thống' },
                  { value: 'BMTT', label: 'Bảo mật & Xác thực' },
                  { value: 'EMAIL', label: 'Email & Thông báo' },
                  { value: 'TIEU_CHUAN', label: 'Tiêu chuẩn & Quy trình' },
                  { value: 'KHAC', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="loaiDuLieu"
              label="Loại dữ liệu"
              rules={[{ required: true, message: 'Vui lòng chọn loại dữ liệu!' }]}
            >
              <Select
                placeholder="Chọn loại dữ liệu"
                options={[
                  { value: 'STRING', label: 'Chuỗi ký tự (String)' },
                  { value: 'NUMBER', label: 'Số (Number)' },
                  { value: 'BOOLEAN', label: 'Đúng/Sai (Boolean)' },
                  { value: 'JSON', label: 'Cấu trúc JSON' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="giaTriMacDinh" label="Giá trị mặc định ban đầu">
          <Input placeholder="Ví dụ: 587 hoặc true" />
        </Form.Item>

        <Form.Item name="moTaCauHinh" label="Mô tả chức năng">
          <Input.TextArea rows={3} placeholder="Mô tả công dụng và hướng dẫn cấu hình của trường này..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DanhMucCauHinhFormModal;
