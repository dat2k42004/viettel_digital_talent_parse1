import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Row, Col, Typography, message, Alert, List } from 'antd';
import { ScanOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

const { Title, Paragraph, Text } = Typography;

interface DotKiemKe {
  id: number;
  tenDotKiemKe: string;
  khoVatLy: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: 'DANG_THUC_HIEN' | 'DA_KET_THUC';
}

interface ThietBiDoiSoat {
  id: number;
  soSerial: string;
  maTheTaiSan: string;
  tenThietBi: string;
  trangThaiHeThong: string;
  ketQuaKiemKe: 'KHOP_KHOP' | 'THIEU_HUT' | 'DU_THUA_SAI_VI_TRI';
}

export const InventoryPage: React.FC = observer(() => {
  const [danhSachKiemKe] = useState<DotKiemKe[]>([
    {
      id: 1,
      tenDotKiemKe: 'Kiểm kê tài sản Quý II/2026',
      khoVatLy: 'Kho A - Tầng 2',
      ngayBatDau: '2026-06-20',
      ngayKetThuc: '2026-06-30',
      trangThai: 'DANG_THUC_HIEN',
    },
  ]);

  const [activeSession, setActiveSession] = useState<DotKiemKe | null>(danhSachKiemKe[0]);
  const [soSerialKiemKe, setSoSerialKiemKe] = useState('');
  const [quetResult, setQuetResult] = useState<string | null>(null);

  const [danhSachKiemKeThucTe, setDanhSachKiemKeThucTe] = useState<ThietBiDoiSoat[]>([
    { id: 101, soSerial: 'SR-DELL-5520', maTheTaiSan: 'TS-PC-001', tenThietBi: 'Laptop Dell Latitude 5520', trangThaiHeThong: 'TON_KHO', ketQuaKiemKe: 'KHOP_KHOP' },
  ]);

  const handleQuetSerial = () => {
    if (!soSerialKiemKe.trim()) {
      message.error('Vui lòng nhập số Serial hoặc quét mã QR!');
      return;
    }

    const serialValue = soSerialKiemKe.trim();

    if (serialValue === 'SR-MAC-M3') {
      const extra: ThietBiDoiSoat = {
        id: 102,
        soSerial: 'SR-MAC-M3',
        maTheTaiSan: 'TS-PC-002',
        tenThietBi: 'MacBook Pro M3 Max',
        trangThaiHeThong: 'CAP_PHAT',
        ketQuaKiemKe: 'DU_THUA_SAI_VI_TRI',
      };
      if (!danhSachKiemKeThucTe.find(item => item.soSerial === 'SR-MAC-M3')) {
        setDanhSachKiemKeThucTe(prev => [extra, ...prev]);
        setQuetResult('DU_THUA_SAI_VI_TRI');
        message.warning('Phát hiện thiết bị nằm sai vị trí quy định trên hệ thống!');
      } else {
        message.info('Thiết bị này đã được đối soát trước đó!');
      }
    } else if (serialValue === 'SR-HP-ELITE') {
      const match: ThietBiDoiSoat = {
        id: 103,
        soSerial: 'SR-HP-ELITE',
        maTheTaiSan: 'TS-PC-003',
        tenThietBi: 'Laptop HP EliteBook 840 G8',
        trangThaiHeThong: 'BAO_TRI',
        ketQuaKiemKe: 'KHOP_KHOP',
      };
      if (!danhSachKiemKeThucTe.find(item => item.soSerial === 'SR-HP-ELITE')) {
        setDanhSachKiemKeThucTe(prev => [match, ...prev]);
        setQuetResult('KHOP_KHOP');
        message.success('Đối soát trùng khớp thông tin thiết bị!');
      } else {
        message.info('Thiết bị này đã được đối soát trước đó!');
      }
    } else {
      setQuetResult('THIEU_HUT');
      message.error('Mã tài sản hoặc Số Serial không tồn tại trên hệ thống hoặc thiếu hụt!');
    }

    setSoSerialKiemKe('');
  };

  const columnsThucTe = [
    { title: 'Tên thiết bị', dataIndex: 'tenThietBi', key: 'tenThietBi' },
    { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial' },
    { title: 'Trạng thái hệ thống', dataIndex: 'trangThaiHeThong', key: 'trangThaiHeThong' },
    {
      title: 'Kết quả kiểm kê đối soát',
      dataIndex: 'ketQuaKiemKe',
      key: 'ketQuaKiemKe',
      render: (val: string) => {
        const colors: Record<string, string> = {
          KHOP_KHOP: 'green',
          THIEU_HUT: 'red',
          DU_THUA_SAI_VI_TRI: 'orange',
        };
        return <Tag color={colors[val]}>{val}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Kiểm kê tài sản CNTT</Title>
        <Paragraph type="secondary">
          Bắt đầu đợt đối soát thông qua quét mã QR Code dán trên thiết bị vật lý hoặc nhập thủ công số Serial.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Các đợt kiểm kê gần đây" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <List
              dataSource={danhSachKiemKe}
              renderItem={(item: DotKiemKe) => (
                <div
                  onClick={() => setActiveSession(item)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 4,
                    border: activeSession?.id === item.id ? '1px solid #adc6ff' : '1px solid #f0f0f0',
                    background: activeSession?.id === item.id ? '#f0f5ff' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 8,
                  }}
                >
                  <div><Text strong>{item.tenDotKiemKe}</Text></div>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>Vị trí: {item.khoVatLy}</Text></div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={item.trangThai === 'DANG_THUC_HIEN' ? 'orange' : 'gray'}>{item.trangThai}</Tag>
                  </div>
                </div>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          {activeSession ? (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card title="Quét thiết bị vật lý đối soát (Simulated QR Scanner)">
                <Paragraph>
                  Nhập số Serial giả lập quét QR (Ví dụ: <strong>SR-MAC-M3</strong> để giả lập sai vị trí, <strong>SR-HP-ELITE</strong> để khớp khớp, hoặc nhập số bừa để báo lỗi).
                </Paragraph>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    prefix={<ScanOutlined />}
                    placeholder="Nhập Số Serial / Thẻ tài sản quét được..."
                    value={soSerialKiemKe}
                    onChange={(e) => setSoSerialKiemKe(e.target.value)}
                    onPressEnter={handleQuetSerial}
                  />
                  <Button type="primary" onClick={handleQuetSerial}>Xác nhận quét</Button>
                </Space.Compact>

                {quetResult && (
                  <div style={{ marginTop: 16 }}>
                    {quetResult === 'KHOP_KHOP' && (
                      <Alert message="Khớp khớp thông tin thành công" type="success" showIcon icon={<CheckCircleOutlined />} />
                    )}
                    {quetResult === 'DU_THUA_SAI_VI_TRI' && (
                      <Alert message="Sai vị trí kho / Dư thừa thực tế" type="warning" showIcon />
                    )}
                    {quetResult === 'THIEU_HUT' && (
                      <Alert message="Không tồn tại thiết bị trên hệ thống" type="error" showIcon icon={<CloseCircleOutlined />} />
                    )}
                  </div>
                )}
              </Card>

              <Card title="Danh sách đối soát thực tế tại phòng ban">
                <Table dataSource={danhSachKiemKeThucTe} columns={columnsThucTe} rowKey="id" pagination={false} />
              </Card>
            </Space>
          ) : (
            <Card style={{ textAlign: 'center', padding: 48, color: '#999' }}>
              Vui lòng chọn đợt kiểm kê từ danh sách bên trái.
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
});

export default InventoryPage;
