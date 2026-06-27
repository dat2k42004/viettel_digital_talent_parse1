import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Typography, message } from 'antd';
import { ToolOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { QuyenHanGuard } from '../../components/protected/QuyenHanGuard';

const { Title, Paragraph } = Typography;

interface PhieuBaoTriDto {
  id: number;
  tenThietBi: string;
  soSerial: string;
  nhaCungCapSua: string;
  chiPhiSuaChuyen: number;
  ngayHenTra: string;
  trangThai: 'DANG_SUA' | 'DA_HOAN_THANH';
}

export const MaintenancePage: React.FC = observer(() => {
  const [danhSachBaoTri, setDanhSachBaoTri] = useState<PhieuBaoTriDto[]>([
    {
      id: 101,
      tenThietBi: 'Laptop Dell Latitude 5520',
      soSerial: 'SR-DELL-5520',
      nhaCungCapSua: 'Trung tâm sửa chữa Dell Care',
      chiPhiSuaChuyen: 1200000,
      ngayHenTra: '2026-07-02',
      trangThai: 'DANG_SUA',
    },
    {
      id: 102,
      tenThietBi: 'Màn hình HP P24v G4',
      soSerial: 'SR-HP-P24V',
      nhaCungCapSua: 'Phong Vũ Service',
      chiPhiSuaChuyen: 500000,
      ngayHenTra: '2026-06-25',
      trangThai: 'DA_HOAN_THANH',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formBaoTri] = Form.useForm();

  const handleHoanThanhBaoTri = (id: number) => {
    setDanhSachBaoTri(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, trangThai: 'DA_HOAN_THANH' };
        }
        return item;
      })
    );
    message.success('Đã hoàn thành sửa chữa thiết bị, mở khoá khôi phục trạng thái hoạt động dưới DB!');
  };

  const handleThemMoiBaoTri = (values: any) => {
    const newTicket: PhieuBaoTriDto = {
      id: Date.now(),
      tenThietBi: values.tenThietBi,
      soSerial: values.soSerial,
      nhaCungCapSua: values.nhaCungCapSua,
      chiPhiSuaChuyen: values.chiPhiSuaChuyen || 0,
      ngayHenTra: values.ngayHenTra,
      trangThai: 'DANG_SUA',
    };

    setDanhSachBaoTri(prev => [newTicket, ...prev]);
    message.warning(`Đã tạo phiếu bảo trì cho thiết bị ${values.soSerial}. Thiết bị được chuyển sang KHOA.`);
    setIsModalOpen(false);
    formBaoTri.resetFields();
  };

  const columnsBaoTri = [
    { title: 'Tên thiết bị', dataIndex: 'tenThietBi', key: 'tenThietBi' },
    { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial' },
    { title: 'Đơn vị sửa chữa', dataIndex: 'nhaCungCapSua', key: 'nhaCungCapSua' },
    {
      title: 'Chi phí (VND)',
      dataIndex: 'chiPhiSuaChuyen',
      key: 'chiPhiSuaChuyen',
      render: (val: number) => val.toLocaleString('vi-VN'),
    },
    { title: 'Ngày hẹn nhận lại', dataIndex: 'ngayHenTra', key: 'ngayHenTra' },
    {
      title: 'Trạng thái bảo trì',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string) => (
        <Tag color={val === 'DANG_SUA' ? 'orange' : 'green'}>{val}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      render: (_: any, record: PhieuBaoTriDto) => (
        <Space>
          {record.trangThai === 'DANG_SUA' && (
            <QuyenHanGuard quyenYeuCau="THAO_TAC_TAI_SAN">
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleHoanThanhBaoTri(record.id)}
              >
                Hoàn thành sửa chữa
              </Button>
            </QuyenHanGuard>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý bảo hành & bảo trì</Title>
        <Paragraph type="secondary">
          Theo dõi hạn bảo hành chính hãng và theo dõi lịch sử bảo trì/sửa chữa thiết bị hư hỏng của đơn vị.
        </Paragraph>
      </div>

      <Card
        title="Nhật ký sửa chữa & bảo trì thiết bị"
        extra={
          <QuyenHanGuard quyenYeuCau="THAO_TAC_TAI_SAN">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Lập phiếu sửa chữa
            </Button>
          </QuyenHanGuard>
        }
      >
        <Table dataSource={danhSachBaoTri} columns={columnsBaoTri} rowKey="id" />
      </Card>

      <Modal
        title="Lập phiếu sửa chữa bảo trì mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={formBaoTri} onFinish={handleThemMoiBaoTri} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="tenThietBi"
            label="Tên thiết bị"
            rules={[{ required: true, message: 'Nhập tên thiết bị sửa chữa!' }]}
          >
            <Input placeholder="Ví dụ: Laptop Dell Latitude 5520" />
          </Form.Item>
          <Form.Item
            name="soSerial"
            label="Số Serial"
            rules={[{ required: true, message: 'Nhập số Serial thiết bị!' }]}
          >
            <Input placeholder="Ví dụ: SR-DELL-5520" />
          </Form.Item>
          <Form.Item
            name="nhaCungCapSua"
            label="Đơn vị sửa chữa thực hiện"
            rules={[{ required: true, message: 'Nhập tên trung tâm sửa chữa!' }]}
          >
            <Input placeholder="Ví dụ: Dell Care Service Center" />
          </Form.Item>
          <Form.Item name="chiPhiSuaChuyen" label="Chi phí dự kiến (VND)">
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item
            name="ngayHenTra"
            label="Ngày nhận lại máy dự kiến"
            rules={[{ required: true, message: 'Chọn ngày hẹn nhận!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<ToolOutlined />}>
                Bắt đầu bảo trì
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default MaintenancePage;
