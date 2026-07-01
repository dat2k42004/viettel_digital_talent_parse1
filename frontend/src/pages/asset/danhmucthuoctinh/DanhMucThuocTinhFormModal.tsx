import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Switch, Card, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DanhMucThuocTinhResponse } from '../../../api-generated/models/danhMucThuocTinhResponse';
import type { DanhMucThuocTinhRequest } from '../../../api-generated/models/danhMucThuocTinhRequest';

interface DanhMucThuocTinhFormModalProps {
  open: boolean;
  onCancel: () => void;
  selectedThuocTinh: DanhMucThuocTinhResponse | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (values: DanhMucThuocTinhRequest) => Promise<void>;
}

export const DanhMucThuocTinhFormModal: React.FC<DanhMucThuocTinhFormModalProps> = ({
  open,
  onCancel,
  selectedThuocTinh,
  mode,
  onSave,
}) => {
  const [form] = Form.useForm<DanhMucThuocTinhRequest>();
  const isView = mode === 'view';

  // Watch fields to dynamically show/hide Form.List for SELECT suggestions
  const kieuDuLieu = Form.useWatch('kieuDuLieu', form);

  useEffect(() => {
    if (open) {
      if (selectedThuocTinh) {
        form.setFieldsValue({
          maThuocTinh: selectedThuocTinh.maThuocTinh,
          tenThuocTinh: selectedThuocTinh.tenThuocTinh,
          kieuDuLieu: selectedThuocTinh.kieuDuLieu,
          apDungCho: selectedThuocTinh.apDungCho as any,
          batBuocNhap: selectedThuocTinh.batBuocNhap ?? false,
          giaTriMacDinh: selectedThuocTinh.giaTriMacDinh,
          trangThai: selectedThuocTinh.trangThai || 'HOAT_DONG',
          luaChonGoiY: selectedThuocTinh.luaChonGoiY?.map(item => ({
            id: item.id,
            giaTri: item.giaTri,
            trangThai: item.trangThai || 'HOAT_DONG',
            thuTuHienThi: item.thuTuHienThi || 0,
          })) || [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          batBuocNhap: false,
          trangThai: 'HOAT_DONG',
          kieuDuLieu: 'TEXT',
          apDungCho: 'PHAN_CUNG' as any,
          luaChonGoiY: [],
        });
      }
    }
  }, [open, selectedThuocTinh, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Clean suggestions list if type is not SELECT
      if (values.kieuDuLieu !== 'SELECT') {
        values.luaChonGoiY = [];
      }
      await onSave({
        ...values,
        trangThai: selectedThuocTinh ? selectedThuocTinh.trangThai : 'HOAT_DONG',
      } as DanhMucThuocTinhRequest);
    } catch (e) {
      // Validation failed
    }
  };

  const getTitle = () => {
    if (isView) return 'Chi tiết danh mục thuộc tính động';
    return selectedThuocTinh ? 'Cập nhật thuộc tính động' : 'Thêm mới thuộc tính động';
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
      width={750}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tenThuocTinh"
              label="Tên thuộc tính hiển thị"
              rules={[
                { required: true, message: 'Vui lòng nhập tên thuộc tính!' },
                { max: 100, message: 'Tên thuộc tính không vượt quá 100 ký tự!' }
              ]}
            >
              <Input disabled={isView} placeholder="Ví dụ: Dung lượng RAM, Hệ điều hành" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maThuocTinh"
              label="Mã thuộc tính duy nhất"
            >
              <Input disabled placeholder="Mã hệ thống tự động sinh" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isView ? 8 : 12}>
            <Form.Item
              name="kieuDuLieu"
              label="Kiêu dữ liệu"
              rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu!' }]}
            >
              <Select disabled={isView} options={[
                { value: 'TEXT', label: 'Văn bản (TEXT)' },
                { value: 'NUMBER', label: 'Số (NUMBER)' },
                { value: 'SELECT', label: 'Lựa chọn (SELECT)' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={isView ? 8 : 12}>
            <Form.Item
              name="apDungCho"
              label="Áp dụng cho phân hệ"
              rules={[{ required: true, message: 'Vui lòng chọn phân hệ áp dụng!' }]}
            >
              <Select disabled={isView} options={[
                { value: 'PHAN_CUNG', label: 'Thiết bị Phần cứng' },
                { value: 'PHAN_MEM', label: 'Key Bản quyền Phần mềm' },
                { value: 'LINH_KIEN', label: 'Linh kiện Phần cứng' },
              ]} />
            </Form.Item>
          </Col>
          {isView && (
            <Col span={8}>
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
          )}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="giaTriMacDinh"
              label="Giá trị mặc định"
              rules={[{ max: 255, message: 'Giá trị không vượt quá 255 ký tự!' }]}
            >
              <Input disabled={isView} placeholder="Nhập giá trị mặc định của thuộc tính" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="batBuocNhap" label="Bắt buộc nhập dữ liệu?" valuePropName="checked">
              <Switch disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        {kieuDuLieu === 'SELECT' && (
          <Card title="Danh sách các tùy chọn gợi ý (Options)" size="small" style={{ marginTop: 16 }}>
            <Form.List name="luaChonGoiY">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row gutter={8} key={field.key} align="middle" style={{ marginBottom: 8 }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'id']}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Col span={10}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'giaTri']}
                          rules={[
                            { required: true, message: 'Vui lòng nhập giá trị gợi ý!' },
                            { max: 150, message: 'Không quá 150 ký tự!' }
                          ]}
                          noStyle
                        >
                          <Input disabled={isView} placeholder="Giá trị hiển thị (Ví dụ: 8GB, Windows 11)" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'thuTuHienThi']}
                          rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
                          noStyle
                        >
                          <InputNumber disabled={isView} style={{ width: '100%' }} placeholder="Thứ tự hiển thị" min={0} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'trangThai']}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Select disabled={isView} options={[
                            { value: 'HOAT_DONG', label: 'Hoạt động' },
                            { value: 'KHOA', label: 'Khóa' },
                          ]} />
                        </Form.Item>
                      </Col>
                      {!isView && (
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        </Col>
                      )}
                    </Row>
                  ))}
                  {!isView && (
                    <Form.Item style={{ marginTop: 12, marginBottom: 0 }}>
                      <Button
                        type="dashed"
                        onClick={() => add({ giaTri: '', trangThai: 'HOAT_DONG', thuTuHienThi: fields.length + 1 })}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm lựa chọn gợi ý
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </Card>
        )}
      </Form>
    </Modal>
  );
};

export default DanhMucThuocTinhFormModal;
