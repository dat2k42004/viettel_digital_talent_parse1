import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, message } from 'antd';
import type { LapRapLinhKienRequest } from '../../../api-generated/models/lapRapLinhKienRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { laySelectOptions1 } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions6 } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';

interface LapRapFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: LapRapLinhKienRequest) => Promise<void>;
}

export const LapRapFormModal: React.FC<LapRapFormModalProps> = ({
  open,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm<LapRapLinhKienRequest>();
  const [loading, setLoading] = useState(false);

  const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
  const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [tbRes, lkRes] = await Promise.all([
          laySelectOptions1(),
          laySelectOptions6(),
        ]);
        if (tbRes.data) setThietBiOptions(tbRes.data);
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } catch (e) {
        message.error('Không thể tải danh sách thiết bị/linh kiện cho lắp ráp!');
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchOptions();
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values as LapRapLinhKienRequest);
    } catch (e) {
      // Validation failed
    }
  };

  return (
    <Modal
      title="Thực hiện lắp ráp linh kiện"
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Xác nhận lắp ráp
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="thietBiPhanCungId"
              label="Chọn Thiết bị phần cứng nhận linh kiện (Mẹ)"
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị nhận!' }]}
            >
              <Select
                placeholder="Chọn thiết bị phần cứng (Ví dụ: Laptop Dell Latitude)"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={thietBiOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="linhKienPhanCungId"
              label="Chọn Linh kiện phần cứng cần lắp (Con)"
              rules={[{ required: true, message: 'Vui lòng chọn linh kiện lắp ráp!' }]}
            >
              <Select
                placeholder="Chọn linh kiện có sẵn trong kho (RAM, SSD...)"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={linhKienOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="ghiChu" label="Ghi chú lắp ráp">
          <Input.TextArea rows={3} placeholder="Nhập lý do, ghi chú chi tiết lắp ráp..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LapRapFormModal;
