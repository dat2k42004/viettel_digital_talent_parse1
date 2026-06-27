import React, { useState } from 'react';
import { Card, Table, Tabs, Tag, Input, Space, Button, Modal, Descriptions } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

interface ThietBiPhanCungDto {
  key: string;
  soSerial: string;
  maTheTaiSan: string;
  tenThietBi: string;
  giaMua: number;
  hanBaoHanhThang: number;
  trangThaiKho: 'TON_KHO' | 'CAP_PHAT' | 'BAO_TRI' | 'THANH_LY';
  trangThaiVanHanh: 'HOAT_DONG' | 'KHOA' | 'CAP_PHAT';
  viTriKho: string;
}

export const AssetListPage: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState('1');
  const [searchText, setSearchText] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<ThietBiPhanCungDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const danhSachThietBiPhanCung: ThietBiPhanCungDto[] = [
    {
      key: '1',
      soSerial: 'SR-DELL-5520',
      maTheTaiSan: 'TS-PC-001',
      tenThietBi: 'Laptop Dell Latitude 5520',
      giaMua: 25000000,
      hanBaoHanhThang: 12,
      trangThaiKho: 'TON_KHO',
      trangThaiVanHanh: 'HOAT_DONG',
      viTriKho: 'Khu A - Tầng 2',
    },
    {
      key: '2',
      soSerial: 'SR-MAC-M3',
      maTheTaiSan: 'TS-PC-002',
      tenThietBi: 'MacBook Pro M3 Max',
      giaMua: 45000000,
      hanBaoHanhThang: 24,
      trangThaiKho: 'CAP_PHAT',
      trangThaiVanHanh: 'CAP_PHAT',
      viTriKho: 'Cấp phát cho NV',
    },
    {
      key: '3',
      soSerial: 'SR-HP-ELITE',
      maTheTaiSan: 'TS-PC-003',
      tenThietBi: 'Laptop HP EliteBook 840 G8',
      giaMua: 22000000,
      hanBaoHanhThang: 12,
      trangThaiKho: 'BAO_TRI',
      trangThaiVanHanh: 'KHOA',
      viTriKho: 'Phòng kỹ thuật sửa chữa',
    },
  ];

  const columnsPhanCung = [
    { title: 'Mã thẻ tài sản', dataIndex: 'maTheTaiSan', key: 'maTheTaiSan' },
    { title: 'Tên thiết bị', dataIndex: 'tenThietBi', key: 'tenThietBi' },
    { title: 'Số Serial', dataIndex: 'soSerial', key: 'soSerial' },
    {
      title: 'Giá mua (VND)',
      dataIndex: 'giaMua',
      key: 'giaMua',
      render: (val: number) => val.toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái kho',
      dataIndex: 'trangThaiKho',
      key: 'trangThaiKho',
      render: (val: string) => {
        const colors: Record<string, string> = {
          TON_KHO: 'blue',
          CAP_PHAT: 'green',
          BAO_TRI: 'orange',
          THANH_LY: 'red',
        };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Trạng thái vận hành',
      dataIndex: 'trangThaiVanHanh',
      key: 'trangThaiVanHanh',
      render: (val: string) => {
        const colors: Record<string, string> = {
          HOAT_DONG: 'cyan',
          KHOA: 'red',
          CAP_PHAT: 'green',
        };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      render: (_: any, record: ThietBiPhanCungDto) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedAsset(record);
            setIsModalOpen(true);
          }}
        >
          Xem
        </Button>
      ),
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredData = danhSachThietBiPhanCung.filter(item =>
    item.tenThietBi.toLowerCase().includes(searchText.toLowerCase()) ||
    item.soSerial.toLowerCase().includes(searchText.toLowerCase()) ||
    item.maTheTaiSan.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card
        title="Danh sách tổng hợp tài sản"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm tài sản..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm mới tài sản
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Thiết bị phần cứng',
              children: <Table dataSource={filteredData} columns={columnsPhanCung} />,
            },
            {
              key: '2',
              label: 'Linh kiện phần cứng',
              children: (
                <div style={{ textAlign: 'center', padding: 24, color: '#8c8c8c' }}>
                  Lưới linh kiện phần cứng (Trống)
                </div>
              ),
            },
            {
              key: '3',
              label: 'Tài sản phần mềm',
              children: (
                <div style={{ textAlign: 'center', padding: 24, color: '#8c8c8c' }}>
                  Lưới tài sản phần mềm (Trống)
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Chi tiết tài sản"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedAsset && (
          <Descriptions bordered column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Mã thẻ tài sản">{selectedAsset.maTheTaiSan}</Descriptions.Item>
            <Descriptions.Item label="Tên thiết bị">{selectedAsset.tenThietBi}</Descriptions.Item>
            <Descriptions.Item label="Số Serial">{selectedAsset.soSerial}</Descriptions.Item>
            <Descriptions.Item label="Giá mua">{selectedAsset.giaMua.toLocaleString('vi-VN')} VND</Descriptions.Item>
            <Descriptions.Item label="Hạn bảo hành">{selectedAsset.hanBaoHanhThang} tháng</Descriptions.Item>
            <Descriptions.Item label="Trạng thái kho">
              <Tag color="blue">{selectedAsset.trangThaiKho}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái vận hành">
              <Tag color="orange">{selectedAsset.trangThaiVanHanh}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí">{selectedAsset.viTriKho}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
});

export default AssetListPage;
