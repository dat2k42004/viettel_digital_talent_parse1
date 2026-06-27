import React, { useState } from 'react';
import { Card, Select, Button, DatePicker, Table, Space, Typography, message } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

const { Title, Paragraph, Text } = Typography;

interface ThongKeBaoCaoDto {
  key: string;
  maTheTaiSan: string;
  tenThietBi: string;
  giaTriBanDau: number;
  khauHaoLuyKe: number;
  giaTriConLai: number;
}

export const ReportPage: React.FC = observer(() => {
  const [loaiBaoCao, setLoaiBaoCao] = useState('inventory');
  
  const danhSachBaoCao: ThongKeBaoCaoDto[] = [
    { key: '1', maTheTaiSan: 'TS-PC-001', tenThietBi: 'Laptop Dell Latitude 5520', giaTriBanDau: 25000000, khauHaoLuyKe: 5000000, giaTriConLai: 20000000 },
    { key: '2', maTheTaiSan: 'TS-PC-002', tenThietBi: 'MacBook Pro M3 Max', giaTriBanDau: 45000000, khauHaoLuyKe: 10000000, giaTriConLai: 35000000 },
    { key: '3', maTheTaiSan: 'TS-PC-003', tenThietBi: 'Laptop HP EliteBook 840 G8', giaTriBanDau: 22000000, khauHaoLuyKe: 8000000, giaTriConLai: 14000000 },
  ];

  const handleXuatFile = (format: 'excel' | 'pdf') => {
    message.open({
      type: 'loading',
      content: `Đang kết xuất dữ liệu và tải xuống báo cáo dưới định dạng ${format.toUpperCase()}...`,
      duration: 1.5,
    });
    setTimeout(() => {
      message.success(`Xuất báo cáo dạng ${format.toUpperCase()} thành công!`);
    }, 1600);
  };

  const columnsBaoCao = [
    { title: 'Mã tài sản', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan' },
    { title: 'Tên thiết bị', dataIndex: 'tenThietBi', key: 'tenThietBi' },
    { title: 'Nguyên giá (VND)', dataIndex: 'giaTriBanDau', key: 'giaTriBanDau', render: (val: number) => val.toLocaleString('vi-VN') },
    { title: 'Khấu hao luỹ kế (VND)', dataIndex: 'khauHaoLuyKe', key: 'khauHaoLuyKe', render: (val: number) => val.toLocaleString('vi-VN') },
    { title: 'Giá trị còn lại (VND)', dataIndex: 'giaTriConLai', key: 'giaTriConLai', render: (val: number) => val.toLocaleString('vi-VN') },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Kết xuất báo cáo tài sản</Title>
        <Paragraph type="secondary">
          Xuất dữ liệu cấu hình, lịch sử luân chuyển, hao mòn tài sản ra các file Excel/PDF lưu trữ vật lý.
        </Paragraph>
      </div>

      <Card title="Cấu hình báo cáo cần xuất" style={{ marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Space size="large" wrap>
          <div>
            <div style={{ marginBottom: 6 }}><Text strong>Loại báo cáo</Text></div>
            <Select
              value={loaiBaoCao}
              onChange={setLoaiBaoCao}
              style={{ width: 280 }}
              options={[
                { value: 'inventory', label: 'Báo cáo kiểm kê tài sản' },
                { value: 'depreciation', label: 'Báo cáo khấu hao hao mòn tài sản' },
                { value: 'vouchers', label: 'Lịch sử giao dịch chứng từ cấp phát/thu hồi' },
              ]}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}><Text strong>Thời gian xuất</Text></div>
            <DatePicker.RangePicker />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <Space>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={() => handleXuatFile('excel')}>
                Xuất file Excel
              </Button>
              <Button type="default" danger icon={<FilePdfOutlined />} onClick={() => handleXuatFile('pdf')}>
                Xuất file PDF
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Card title="Xem trước dữ liệu báo cáo" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table dataSource={danhSachBaoCao} columns={columnsBaoCao} pagination={false} />
      </Card>
    </div>
  );
});

export default ReportPage;
