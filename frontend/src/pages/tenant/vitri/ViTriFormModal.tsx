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
      title={selectedViTri ? 'Cập nhật Vị trí & Kho bãi' : 'Thêm mới Vị trí & Kho bãi'}
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
          <Form.Item name="maViTri" label="Mã vị trí">
            <Input disabled placeholder="Mã vị trí tự động" />
          </Form.Item>
        )}

        <Form.Item
          name="tenViTri"
          label="Tên vị trí"
          rules={[{ required: true, message: 'Vui lòng nhập tên vị trí!' }]}
        >
          <Input placeholder="Ví dụ: Kho A - Tầng 2" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="loaiViTri"
              label="Loại vị trí"
              rules={[{ required: true, message: 'Vui lòng chọn loại vị trí!' }]}
            >
              <Select
                placeholder="Chọn loại vị trí"
                options={[
                  { value: 'KHO', label: 'Kho bãi / Warehouse' },
                  { value: 'PHONG_MAY', label: 'Phòng máy / Server room' },
                  { value: 'KE_TU', label: 'Kệ tủ / Rack' },
                  { value: 'VAN_PHONG', label: 'Văn phòng làm việc' },
                  { value: 'KHAC', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tenTiengAnh" label="Tên tiếng Anh">
              <Input placeholder="Ví dụ: Warehouse A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="sucChuaToiDa" label="Sức chứa tối đa (số tài sản)">
              <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 1000" min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dienTichM2" label="Diện tích (m²)">
              <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 50" min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="moTaChiTiet" label="Mô tả chi tiết">
          <Input.TextArea rows={3} placeholder="Mô tả thông tin chi tiết về vị trí này..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ViTriFormModal;
