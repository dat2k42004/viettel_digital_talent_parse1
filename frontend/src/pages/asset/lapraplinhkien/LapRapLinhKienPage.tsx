import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Typography, message, Popconfirm, Dropdown, Row, Col, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, SafetyOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import { QuyenHanGuard } from '../../../components/protected/QuyenHanGuard';
import { authStore, QUYEN } from '../../../stores/AuthStore';
import {
  layDanhSach18,
  themMoi18,
  capNhatThaoDo,
} from '../../../api-generated/endpoints/lap-rap-linh-kien-controller/lap-rap-linh-kien-controller';
import { laySelectOptions1 } from '../../../api-generated/endpoints/danh-sach-thiet-bi-phan-cung-controller/danh-sach-thiet-bi-phan-cung-controller';
import { laySelectOptions6 } from '../../../api-generated/endpoints/linh-kien-phan-cung-controller/linh-kien-phan-cung-controller';
import type { LapRapLinhKienResponse } from '../../../api-generated/models/lapRapLinhKienResponse';
import type { LapRapLinhKienRequest } from '../../../api-generated/models/lapRapLinhKienRequest';
import type { SelectOption } from '../../../api-generated/models/selectOption';
import { LapRapFormModal } from './LapRapLinhKienFormModal';

const { Title, Text } = Typography;

export const LapRapLinhKienPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [danhSach, setDanhSach] = useState<LapRapLinhKienResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter values
  const [thietBiId, setThietBiId] = useState<number | undefined>(undefined);
  const [linhKienId, setLinhKienId] = useState<number | undefined>(undefined);
  const [trangThaiLienKet, setTrangThaiLienKet] = useState<string | undefined>(undefined);

  // Dropdown options
  const [thietBiOptions, setThietBiOptions] = useState<SelectOption[]>([]);
  const [linhKienOptions, setLinhKienOptions] = useState<SelectOption[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);

  const taiDuLieu = async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await layDanhSach18({
        page: page - 1,
        size,
        thietBiPhanCungId: thietBiId,
        linhKienPhanCungId: linhKienId,
        trangThaiLienKet: trangThaiLienKet || undefined,
      });
      if (res.data) {
        // Handle custom response wrappers
        const content = (res.data as any).content || [];
        const pageInfo = (res.data as any).page_info || {};
        setDanhSach(content);
        setTotalCount(pageInfo.total_elements || 0);
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tải lịch sử lắp ráp linh kiện!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [tbRes, lkRes] = await Promise.all([
          laySelectOptions1(),
          laySelectOptions6(),
        ]);
        if (tbRes.data) setThietBiOptions(tbRes.data);
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } catch (e) { }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    taiDuLieu(currentPage, pageSize);
  }, [currentPage, pageSize, thietBiId, linhKienId, trangThaiLienKet]);

  const handleReset = () => {
    setThietBiId(undefined);
    setLinhKienId(undefined);
    setTrangThaiLienKet(undefined);
    setCurrentPage(1);
  };

  const handleSaveForm = async (values: LapRapLinhKienRequest) => {
    try {
      const res = await themMoi18(values);
      // Backend may return LapRapLinhKienResponse or ApiResponseLapRapLinhKienResponse
      const code = (res as any).code;
      if (code === 200 || (res && !code)) {
        message.success('Thực hiện lắp ráp thành công!');
        setIsFormOpen(false);
        taiDuLieu(1, pageSize);
        // Refresh options since linkien might be linked now
        const lkRes = await laySelectOptions6();
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } else {
        message.error((res as any).message || 'Lắp ráp thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Lỗi khi kết nối tới máy chủ!');
    }
  };

  const handleThaoDo = async (id: number) => {
    try {
      const res = await capNhatThaoDo(id);
      const code = (res as any).code;
      if (code === 200 || res) {
        message.success('Tháo dỡ linh kiện thành công!');
        taiDuLieu(currentPage, pageSize);
        // Refresh options
        const lkRes = await laySelectOptions6();
        if (lkRes.data) setLinhKienOptions(lkRes.data);
      } else {
        message.error((res as any).message || 'Tháo dỡ thất bại!');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tháo dỡ linh kiện!');
    }
  };

  const renderLienKetStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">Đang liên kết (Active)</Tag>;
      case 'INACTIVE':
        return <Tag color="red">Đã tháo dỡ (Inactive)</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Thiết bị mẹ (Serial / Thẻ tài sản)',
      key: 'thietBiMe',
      render: (_: any, record: LapRapLienKetThaoDoResponse) => {
        return (
          <div>
            <div><Text strong>{record.soSerialThietBi || 'N/A'}</Text></div>
            <div><Text type="secondary">{record.maTheTaiSanThietBi || 'Không có thẻ'}</Text></div>
          </div>
        );
      },
    },
    {
      title: 'Linh kiện con (Serial)',
      dataIndex: 'soSerialLinhKien',
      key: 'soSerialLinhKien',
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: 'Thời gian lắp ráp',
      dataIndex: 'thoiGianLap',
      key: 'thoiGianLap',
      width: 150,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Thời gian tháo dỡ',
      dataIndex: 'thoiGianThao',
      key: 'thoiGianThao',
      width: 150,
      render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Trạng thái liên kết',
      dataIndex: 'trangThaiLienKet',
      key: 'trangThaiLienKet',
      width: 180,
      render: (val: string) => renderLienKetStatus(val),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 120,
      render: (_: any, record: LapRapLienKetThaoDoResponse) => {
        const isLinked = record.trangThaiLienKet === 'ACTIVE';

        const items: any = [
          isLinked && authStore.kiemTraQuyen(QUYEN.SUA_LAP_RAP_LINH_KIEN)
            ? {
              key: 'disassemble',
              label: (
                <Popconfirm
                  title="Xác nhận tháo dỡ"
                  description="Bạn có chắc chắn muốn tháo dỡ linh kiện này khỏi thiết bị mẹ?"
                  okText="Xác nhận tháo"
                  cancelText="Hủy"
                  onConfirm={() => handleThaoDo(record.id!)}
                >
                  <span style={{ color: '#ff4d4f', display: 'block', width: '100%' }}>Tháo dỡ</span>
                </Popconfirm>
              ),
              icon: <SafetyOutlined style={{ color: '#ff4d4f' }} />,
            }
            : null,
        ].filter(Boolean) as MenuProps['items'];

        if (items.length === 0) return '-';

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button size="small">
              Thao tác <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  type LapRapLienKetThaoDoResponse = any; // type alias for mapping custom responses

  return (
    <QuyenHanGuard quyenYeuCau={QUYEN.XEM_LAP_RAP_LINH_KIEN}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý lắp ráp linh kiện
            </Title>
            <Text type="secondary">
              Quản lý lắp ráp nâng cấp hoặc tháo dỡ thu hồi linh kiện (RAM, HDD, SSD...) của thiết bị phần cứng.
            </Text>
          </div>
          <QuyenHanGuard quyenYeuCau={QUYEN.THEM_LAP_RAP_LINH_KIEN}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsFormOpen(true)}
            >
              Thực hiện lắp ráp
            </Button>
          </QuyenHanGuard>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Select
                placeholder="Chọn thiết bị phần cứng (Mẹ)"
                style={{ width: '100%' }}
                value={thietBiId}
                onChange={setThietBiId}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={thietBiOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Chọn linh kiện lắp đặt (Con)"
                style={{ width: '100%' }}
                value={linhKienId}
                onChange={setLinhKienId}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={linhKienOptions.map((opt) => ({ value: opt.id, label: opt.ten }))}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Trạng thái liên kết"
                style={{ width: '100%' }}
                value={trangThaiLienKet}
                onChange={setTrangThaiLienKet}
                allowClear
                options={[
                  { value: 'ACTIVE', label: 'Đang liên kết' },
                  { value: 'INACTIVE', label: 'Đã tháo dỡ' },
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <Button onClick={handleReset} block>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            dataSource={danhSach}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (p, s) => {
                setCurrentPage(p);
                setPageSize(s);
              },
              showSizeChanger: true,
            }}
          />
        </Card>

        <LapRapFormModal
          open={isFormOpen}
          onCancel={() => setIsFormOpen(false)}
          onSave={handleSaveForm}
        />
      </div>
    </QuyenHanGuard>
  );
});

export default LapRapLinhKienPage;
