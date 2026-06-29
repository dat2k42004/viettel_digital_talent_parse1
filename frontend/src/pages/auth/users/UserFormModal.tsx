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
  const [form] = Form.useForm<NguoiDungRequest>();

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
          danhSachIdVaiTro: selectedUser.danhSachVaiTro?.map(v => v.id).filter(Boolean) || [],
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
      title={selectedUser ? 'Cập nhật thông tin tài khoản' : 'Thêm mới tài khoản người dùng'}
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
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input disabled={!!selectedUser} placeholder="Ví dụ: hung.nv" />
            </Form.Item>
          </Col>
          {!selectedUser ? (
            <Col span={12}>
              <Form.Item
                name="matKhau"
                label="Mật khẩu khởi tạo"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}
              >
                <Input.Password placeholder="Mật khẩu khởi tạo" />
              </Form.Item>
            </Col>
          ) : (
            <Col span={12}>
              <Form.Item
                name="maNguoiDung"
                label="Mã nhân viên"
              >
                <Input disabled placeholder="Hệ thống tự động sinh" />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="hoNguoiDung" label="Họ">
              <Input placeholder="Ví dụ: Nguyễn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tenDemNguoiDung" label="Tên đệm">
              <Input placeholder="Ví dụ: Văn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="tenNguoiDung"
              label="Tên chính"
              rules={[{ required: true, message: 'Vui lòng nhập tên chính!' }]}
            >
              <Input placeholder="Ví dụ: Hùng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Địa chỉ Email"
              rules={[{ type: 'email', message: 'Địa chỉ email không hợp lệ!' }]}
            >
              <Input placeholder="Ví dụ: hung.nv@congty.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="soDienThoai" label="Số điện thoại liên hệ">
              <Input placeholder="Ví dụ: 0987654321" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="chucVu" label="Chức danh công việc">
              <Input placeholder="Ví dụ: Chuyên viên Kỹ thuật" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="idPhongBan" label="Phòng ban làm việc">
              <Select
                placeholder="Chọn phòng ban..."
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
          label="Danh sách vai trò gán cho tài khoản"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn vai trò..."
            style={{ width: '100%' }}
            options={danhSachVaiTro.map(v => ({ value: v.id, label: v.tenVaiTro }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
